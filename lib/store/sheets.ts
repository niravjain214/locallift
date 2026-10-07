import { google } from "googleapis";
import type { Appliance, Booking, Seller } from "../types";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const raw = process.env.GOOGLE_PRIVATE_KEY;
  if (!email || !raw) return null;

  // Vercel sometimes stores `\n` literally, and sometimes users paste the key
  // with actual newlines. Normalize both forms into real PEM newlines.
  const key = raw
    .trim()
    // If env var contains `\\n` (double-escaped) -> convert to newline
    .replace(/\\\\n/g, "\n")
    // If env var contains `\n` -> convert to newline
    .replace(/\\n/g, "\n");
  return new google.auth.GoogleAuth({
    credentials: { client_email: email, private_key: key },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function sheetsConfigured(): boolean {
  return Boolean(SPREADSHEET_ID && getAuth());
}

async function getSheets() {
  const auth = getAuth();
  if (!SPREADSHEET_ID || !auth) throw new Error("Sheets not configured");
  return google.sheets({ version: "v4", auth });
}

function normalizePhoneDigits(input: string): string {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("91") && d.length === 12) d = d.slice(2);
  if (d.startsWith("0") && d.length === 11) d = d.slice(1);
  return d;
}

function safeStr(v: unknown): string {
  return v == null ? "" : String(v);
}

function safeNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(String(v ?? "").trim());
  return Number.isFinite(n) ? n : 0;
}

function normalizeServiceAreas(raw: unknown): string {
  // Ensure service area strings match our dropdown values reliably.
  // - treat semicolons/newlines as commas
  // - trim each token
  // - join with a single comma
  const s = String(raw ?? "");
  return s
    .replace(/[\n\r;|]/g, ",")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .join(",");
}

function quoteSheetTitle(title: string): string {
  // A1 notation: quote sheet titles with single quotes and escape inner quotes by doubling.
  // Example: 'Seller Data'!A1
  const escaped = title.replace(/'/g, "''");
  return `'${escaped}'`;
}

async function resolveSellersSheetTitle(
  sheets: Awaited<ReturnType<typeof getSheets>>
): Promise<string> {
  // Try to find the tab title case-insensitively; avoids failures when the tab is renamed or has trailing spaces.
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID!,
    includeGridData: false,
  });
  const titles =
    spreadsheet.data.sheets
      ?.map((s) => s.properties?.title ?? "")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const exact = titles.find((t) => t.toLowerCase() === "sellers");
  if (exact) return exact;

  const partial = titles.find((t) => t.toLowerCase().includes("seller"));
  return partial ?? "Sellers";
}

async function resolveAppliancesSheetTitle(
  sheets: Awaited<ReturnType<typeof getSheets>>
): Promise<string> {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID!,
    includeGridData: false,
  });
  const titles =
    spreadsheet.data.sheets
      ?.map((s) => s.properties?.title ?? "")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const exact = titles.find((t) => t.toLowerCase() === "appliances");
  if (exact) return exact;

  const partial = titles.find((t) => t.toLowerCase().includes("appliance"));
  return partial ?? "Appliances";
}

/**
 * Read fallback for serverless: when the local JSON store is empty/reset,
 * treat Sheets as the source-of-truth for seller existence.
 */
export async function findSellerByPhone(
  phoneDigits: string
): Promise<Seller | null> {
  if (!sheetsConfigured()) return null;
  const phone = normalizePhoneDigits(phoneDigits).slice(-10);
  if (phone.length !== 10) return null;

  const sheets = await getSheets();
  const sellersTitle = await resolveSellersSheetTitle(sheets);
  const range = `${quoteSheetTitle(sellersTitle)}!A1:K10000`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    // Columns based on `appendSellerRow`: A..K (phone is in column B)
    // Use a finite range and the resolved sheet tab title.
    range,
    majorDimension: "ROWS",
  });

  const rows = res.data.values ?? [];
  for (const row of rows) {
    const rowPhone = normalizePhoneDigits(safeStr(row[1])).slice(-10);
    if (rowPhone !== phone) continue;

    const statusRaw = safeStr(row[8]).toLowerCase();
    const status: Seller["status"] =
      statusRaw === "paused" ? "paused" : "active";

    return {
      seller_id: safeStr(row[0]),
      phone,
      name: safeStr(row[2]),
      shop_name: safeStr(row[3]),
      address: safeStr(row[4]),
      service_areas: normalizeServiceAreas(row[5]),
      upi_id: safeStr(row[6]),
      whatsapp_phone: safeStr(row[7]) || undefined,
      status,
      joined_at: safeStr(row[9]),
      total_earnings: safeNum(row[10]),
      // `appendSellerRow` writes last_payout_at but range is A:K, so it may be missing.
      last_payout_at: "",
    };
  }

  return null;
}

/**
 * Read all sellers from Sheets (used by admin snapshot when local JSON store
 * isn't populated / reset in serverless).
 */
export async function listSellersFromSheets(): Promise<Seller[]> {
  if (!sheetsConfigured()) return [];

  const sheets = await getSheets();
  const sellersTitle = await resolveSellersSheetTitle(sheets);
  const range = `${quoteSheetTitle(sellersTitle)}!A1:K10000`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    range,
    majorDimension: "ROWS",
  });

  const rows = res.data.values ?? [];
  const out: Seller[] = [];

  // Skip header row if present by checking phone digits.
  for (const row of rows) {
    const phoneDigits = normalizePhoneDigits(safeStr(row[1])).slice(-10);
    if (phoneDigits.length !== 10) continue;

    const statusRaw = safeStr(row[8]).toLowerCase();
    const status: Seller["status"] =
      statusRaw === "paused" ? "paused" : "active";

    out.push({
      seller_id: safeStr(row[0]),
      phone: phoneDigits,
      name: safeStr(row[2]),
      shop_name: safeStr(row[3]),
      address: safeStr(row[4]),
      service_areas: normalizeServiceAreas(row[5]),
      upi_id: safeStr(row[6]),
      whatsapp_phone: safeStr(row[7]) || undefined,
      status,
      joined_at: safeStr(row[9]),
      total_earnings: safeNum(row[10]),
      last_payout_at: "",
    });
  }

  return out;
}

/**
 * Read appliances from Sheets (used when local JSON store is empty/reset in
 * serverless).
 */
export async function listAppliancesFromSheets(): Promise<Appliance[]> {
  if (!sheetsConfigured()) return [];

  const sheets = await getSheets();
  const appliancesTitle = await resolveAppliancesSheetTitle(sheets);
  const range = `${quoteSheetTitle(appliancesTitle)}!A1:P10000`;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID!,
    range,
    majorDimension: "ROWS",
  });

  const rows = res.data.values ?? [];
  if (rows.length === 0) return [];

  const firstRow = rows[0] ?? [];
  const firstCell0 = safeStr(firstRow[0]).toLowerCase();
  const likelyHasHeader = /appliance/.test(firstCell0);

  const dataRows = likelyHasHeader ? rows.slice(1) : rows;
  const headerRow = likelyHasHeader ? firstRow : [];

  const findIndexByIncludes = (patterns: string[]): number => {
    for (let i = 0; i < headerRow.length; i++) {
      const cell = safeStr(headerRow[i]).toLowerCase();
      if (patterns.some((p) => cell.includes(p))) return i;
    }
    return -1;
  };

  // Fixed indices (A..P) fallback
  const fixed = {
    appliance_id: 0,
    seller_phone: 1,
    name: 2,
    category: 3,
    photos: 4,
    daily_price: 5,
    deposit: 6,
    description: 7,
    condition: 8,
    service_areas: 9,
    status: 10,
    available_from: 11,
    available_to: 12,
    created_at: 13,
    total_rentals: 14,
    total_earnings: 15,
  };

  let indices = fixed;
  if (likelyHasHeader) {
    const mapped = {
      appliance_id: findIndexByIncludes(["appliance_id", "appliance id", "appliance"]),
      seller_phone: findIndexByIncludes(["seller_phone", "seller phone", "phone"]),
      name: findIndexByIncludes(["name"]),
      category: findIndexByIncludes(["category"]),
      photos: findIndexByIncludes(["photo"]),
      daily_price: findIndexByIncludes(["daily", "price"]),
      deposit: findIndexByIncludes(["deposit"]),
      description: findIndexByIncludes(["description"]),
      condition: findIndexByIncludes(["condition"]),
      service_areas: findIndexByIncludes(["service_areas", "service areas", "areas"]),
      status: findIndexByIncludes(["status"]),
      available_from: findIndexByIncludes(["available_from", "available from", "from"]),
      available_to: findIndexByIncludes(["available_to", "available to", "to"]),
      created_at: findIndexByIncludes(["created_at", "created"]),
      total_rentals: findIndexByIncludes(["total_rentals", "total rentals", "rentals"]),
      total_earnings: findIndexByIncludes(["total_earnings", "total earnings", "earnings"]),
    };

    // Only use mapping if we can at least identify the 2 critical columns.
    if (mapped.appliance_id >= 0 && mapped.seller_phone >= 0) indices = mapped;
  }

  const out: Appliance[] = [];
  for (const row of dataRows) {
    const applianceId = safeStr(row[indices.appliance_id] ?? "").trim();
    const sellerPhone = normalizePhoneDigits(
      safeStr(row[indices.seller_phone] ?? "")
    ).slice(-10);
    if (!applianceId || sellerPhone.length !== 10) continue;

    const photosRaw = safeStr(row[indices.photos] ?? "");
    let photos: string[] = [];
    try {
      const parsed = JSON.parse(photosRaw);
      photos = Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      photos = [];
    }

    const statusRaw = safeStr(row[indices.status] ?? "").toLowerCase();
    const status: Appliance["status"] =
      statusRaw === "paused"
        ? "paused"
        : statusRaw === "rented"
          ? "rented"
          : statusRaw === "deleted"
            ? "deleted"
            : "live";

    out.push({
      appliance_id: applianceId,
      seller_phone: sellerPhone,
      name: safeStr(row[indices.name] ?? ""),
      category: safeStr(row[indices.category] ?? ""),
      photos,
      daily_price: safeNum(row[indices.daily_price]),
      deposit: safeNum(row[indices.deposit]),
      description: safeStr(row[indices.description] ?? ""),
      condition: safeStr(row[indices.condition] ?? ""),
      service_areas: normalizeServiceAreas(row[indices.service_areas]),
      status,
      available_from: safeStr(row[indices.available_from] ?? ""),
      available_to: safeStr(row[indices.available_to] ?? ""),
      created_at: safeStr(row[indices.created_at] ?? ""),
      total_rentals: safeNum(row[indices.total_rentals]),
      total_earnings: safeNum(row[indices.total_earnings]),
    });
  }

  return out;
}

/** Append booking row — primary user-facing Sheets sync. */
export async function appendBookingRow(b: Booking): Promise<void> {
  if (!sheetsConfigured()) return;
  const sheets = await getSheets();
  const row = [
    b.booking_id,
    b.appliance_id,
    b.seller_phone,
    b.customer_name,
    b.customer_phone,
    String(b.customer_whatsapp),
    b.customer_address,
    b.landmark,
    b.start_date,
    b.end_date,
    String(b.total_days),
    String(b.rental_amount),
    String(b.deposit_amount),
    String(b.total_amount),
    b.special_requests,
    b.status,
    b.payment_status,
    b.created_at,
    b.confirmed_at,
    b.delivered_at,
    b.returned_at,
    String(b.deposit_returned),
    b.notes,
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID!,
    range: "Bookings!A:W",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** Append seller row on register. */
export async function appendSellerRow(s: Seller): Promise<void> {
  if (!sheetsConfigured()) return;
  const sheets = await getSheets();
  const sellersTitle = await resolveSellersSheetTitle(sheets);
  // Keep it finite for parse-safety; 10k rows should be enough for MVP.
  const range = `${quoteSheetTitle(sellersTitle)}!A1:K10000`;
  const row = [
    s.seller_id,
    s.phone,
    s.name,
    s.shop_name,
    s.address,
    s.service_areas,
    s.upi_id,
    s.whatsapp_phone ?? "",
    s.status,
    s.joined_at,
    String(s.total_earnings),
    s.last_payout_at,
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID!,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** Append appliance row on create. */
export async function appendApplianceRow(a: Appliance): Promise<void> {
  if (!sheetsConfigured()) return;
  const sheets = await getSheets();
  const appliancesTitle = await resolveAppliancesSheetTitle(sheets);

  // IMPORTANT:
  // We currently collect seller photos as base64 `data:image/...` strings in the browser.
  // Writing those base64 blobs into a single Google Sheets cell quickly exceeds the
  // Sheets per-cell input limits and breaks registration/listing.
  //
  // For MVP, store only an empty photos array in Sheets.
  // (Future improvement: upload images to S3/Vercel Blob and store URLs in Sheets.)
  const photosForSheets: string[] = [];

  const row = [
    a.appliance_id,
    a.seller_phone,
    a.name,
    a.category,
    JSON.stringify(photosForSheets),
    String(a.daily_price),
    String(a.deposit),
    a.description,
    a.condition,
    a.service_areas,
    a.status,
    a.available_from,
    a.available_to,
    a.created_at,
    String(a.total_rentals),
    String(a.total_earnings),
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID!,
    range: `${quoteSheetTitle(appliancesTitle)}!A:P`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
