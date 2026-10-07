import type { Appliance } from "./types";

/** Parse comma-separated service areas from seller/appliance row. */
export function parseServiceAreas(areas: string): string[] {
  return areas
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

/** User sees appliance iff: area matches, status live, and window includes rental intent (browse = today). */
export function applianceVisibleInArea(
  appliance: Appliance,
  userArea: string,
  referenceDate: string
): boolean {
  if (appliance.status !== "live") return false;
  const areas = parseServiceAreas(appliance.service_areas);
  if (!areas.includes(userArea)) return false;
  const ref = referenceDate.slice(0, 10);
  const from = appliance.available_from.slice(0, 10);
  const to = appliance.available_to?.trim();
  if (ref < from) return false;
  if (to && ref > to.slice(0, 10)) return false;
  return true;
}

/** For booking: appliance must be live and cover [start, end] within availability window. */
export function applianceAvailableForDates(
  appliance: Appliance,
  userArea: string,
  startDate: string,
  endDate: string
): boolean {
  if (appliance.status !== "live") return false;
  const areas = parseServiceAreas(appliance.service_areas);
  if (!areas.includes(userArea)) return false;
  const s = startDate.slice(0, 10);
  const e = endDate.slice(0, 10);
  const from = appliance.available_from.slice(0, 10);
  const to = appliance.available_to?.trim();
  if (s < from || e < from) return false;
  if (to) {
    const toD = to.slice(0, 10);
    if (s > toD || e > toD) return false;
  }
  return s <= e;
}
