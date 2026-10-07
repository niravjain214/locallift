export const AREA_KEY = "locallift_area";

export function getStoredArea(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AREA_KEY);
}

export function setStoredArea(area: string): void {
  localStorage.setItem(AREA_KEY, area);
}
