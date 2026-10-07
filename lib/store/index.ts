import type { StoreData } from "./local";
export type { StoreData };

import {
  readStore as readLocalStore,
  writeStore as writeLocalStore,
  mutateStore as mutateLocalStore,
  withStore as withLocalStore,
} from "./local";

import {
  isSupabaseConfigured,
  readStore as readSupabaseStore,
  writeStore as writeSupabaseStore,
  mutateStore as mutateSupabaseStore,
  withStore as withSupabaseStore,
  findSellerByPhone as findSellerByPhoneDb,
  appendBookingRow as appendBookingRowDb,
  appendSellerRow as appendSellerRowDb,
  appendApplianceRow as appendApplianceRowDb,
} from "./supabase";

function usingDb(): boolean {
  return isSupabaseConfigured();
}

export async function readStore() {
  return usingDb() ? readSupabaseStore() : readLocalStore();
}

export async function writeStore(data: StoreData) {
  return usingDb() ? writeSupabaseStore(data) : writeLocalStore(data);
}

export async function mutateStore(fn: (data: StoreData) => void | Promise<void>) {
  return usingDb() ? mutateSupabaseStore(fn) : mutateLocalStore(fn);
}

export async function withStore<T>(
  fn: (data: StoreData) => Promise<T> | T
): Promise<T> {
  return usingDb() ? withSupabaseStore(fn) : withLocalStore(fn);
}

export async function findSellerByPhone(phoneDigits: string) {
  return usingDb() ? findSellerByPhoneDb(phoneDigits) : null;
}

export async function appendBookingRow(b: import("@/lib/types").Booking) {
  return usingDb() ? appendBookingRowDb(b) : undefined;
}

export async function appendSellerRow(s: import("@/lib/types").Seller) {
  return usingDb() ? appendSellerRowDb(s) : undefined;
}

export async function appendApplianceRow(a: import("@/lib/types").Appliance) {
  return usingDb() ? appendApplianceRowDb(a) : undefined;
}
