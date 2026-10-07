import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { DEHRADUN_AREAS } from "../areas";
import type { Appliance, AreaRow, Booking, Seller } from "../types";

/** Local dev uses `data/store.json`. On Vercel the filesystem is read-only except `/tmp`, so we persist there (ephemeral across cold starts / instances — use a real DB or Sheets-backed store for production). */
function getDataDir(): string {
  if (process.env.VERCEL === "1") return tmpdir();
  return path.join(process.cwd(), "data");
}

function getStorePath(): string {
  if (process.env.VERCEL === "1") {
    return path.join(tmpdir(), "locallift-store.json");
  }
  return path.join(process.cwd(), "data", "store.json");
}

export interface StoreData {
  sellers: Seller[];
  appliances: Appliance[];
  bookings: Booking[];
  areas: AreaRow[];
}

function seedAreas(): AreaRow[] {
  return DEHRADUN_AREAS.map((name, i) => ({
    area_name: name,
    display_order: i,
    active: true,
  }));
}

const empty: StoreData = {
  sellers: [],
  appliances: [],
  bookings: [],
  areas: seedAreas(),
};

async function ensureDir() {
  await fs.mkdir(getDataDir(), { recursive: true });
}

export async function readStore(): Promise<StoreData> {
  const storePath = getStorePath();
  try {
    const raw = await fs.readFile(storePath, "utf-8");
    const data = JSON.parse(raw) as StoreData;
    if (!data.areas?.length) data.areas = seedAreas();
    return data;
  } catch {
    const seeded = { ...empty, areas: seedAreas() };
    try {
      await ensureDir();
      await writeStore(seeded);
    } catch {
      /* ignore: e.g. read-only fs; still serve empty store so APIs don’t 500 */
    }
    return seeded;
  }
}

export async function writeStore(data: StoreData): Promise<void> {
  await ensureDir();
  await fs.writeFile(getStorePath(), JSON.stringify(data, null, 2), "utf-8");
}

export async function withStore<T>(
  fn: (data: StoreData) => Promise<T> | T
): Promise<T> {
  const data = await readStore();
  return fn(data);
}

export async function mutateStore(
  fn: (data: StoreData) => void | Promise<void>
): Promise<StoreData> {
  const data = await readStore();
  await fn(data);
  await writeStore(data);
  return data;
}
