import type { StoreData } from "@/lib/store";

export async function fetchAdminSnapshot(): Promise<StoreData | null> {
  const res = await fetch("/api/admin/snapshot", {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}
