"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Seller } from "@/lib/types";
import { fetchAdminSnapshot } from "@/lib/admin-fetch";
import type { StoreData } from "@/lib/store";

export default function AdminSellerDetailPage() {
  const params = useParams();
  const phone = decodeURIComponent(String(params.phone ?? ""));
  const [data, setData] = useState<StoreData | null>(null);

  useEffect(() => {
    fetchAdminSnapshot().then(setData);
  }, [phone]);

  const seller = data?.sellers.find((s) => s.phone === phone);

  async function patch(body: Record<string, unknown>) {
    await fetch(`/api/sellers/${encodeURIComponent(phone)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    fetchAdminSnapshot().then(setData);
  }

  if (!data) return <p className="text-slate-600">Loading…</p>;
  if (!seller) return <p className="text-slate-600">Seller not found</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-violet-950">{seller.name}</h1>
        <div className="flex gap-2">
          <Link
            href={`/seller/${encodeURIComponent(phone)}`}
            target="_blank"
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white"
          >
            View as seller
          </Link>
          <Link href="/admin/sellers" className="text-violet-600 underline">
            ← All sellers
          </Link>
        </div>
      </div>
      <SellerEditForm seller={seller} onSave={patch} />
    </div>
  );
}

function SellerEditForm({
  seller,
  onSave,
}: {
  seller: Seller;
  onSave: (b: Record<string, unknown>) => void;
}) {
  const [name, setName] = useState(seller.name);
  const [shop_name, setShop] = useState(seller.shop_name);
  const [status, setStatus] = useState(seller.status);

  return (
    <form
      className="max-w-xl space-y-4 rounded-xl border border-violet-100 bg-white p-6 shadow-sm"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ name, shop_name, status });
      }}
    >
      <label className="block text-sm">
        Name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Shop name
        <input
          value={shop_name}
          onChange={(e) => setShop(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Status
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "active" | "paused")
          }
          className="mt-1 w-full rounded border px-3 py-2"
        >
          <option value="active">active</option>
          <option value="paused">paused</option>
        </select>
      </label>
      <button
        type="submit"
        className="rounded-xl bg-violet-600 px-6 py-2 font-medium text-white"
      >
        Save
      </button>
    </form>
  );
}
