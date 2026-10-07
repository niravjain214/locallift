import { parseServiceAreas } from "@/lib/match";
import type { StoreData } from "@/lib/store/local";

/** Any area used in seller/listing service_areas stays enabled for admin + future UX. */
export function ensureAreasActiveForServiceAreas(
  data: StoreData,
  serviceAreasCsv: string
): void {
  for (const area_name of parseServiceAreas(serviceAreasCsv)) {
    const idx = data.areas.findIndex((a) => a.area_name === area_name);
    if (idx >= 0) data.areas[idx].active = true;
    else {
      data.areas.push({
        area_name,
        display_order: data.areas.length,
        active: true,
      });
    }
  }
}
