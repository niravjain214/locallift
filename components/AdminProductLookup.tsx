"use client";

import Link from "next/link";
import { useState } from "react";
import type { Appliance } from "@/lib/types";

export function AdminProductLookup() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [appliance, setAppliance] = useState<Appliance | null>(null);
  const [sellerName, setSellerName] = useState("");
  const [sellerShop, setSellerShop] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setAppliance(null);
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/appliances/${encodeURIComponent(trimmed)}`,
        { cache: "no-store" }
      );
      const data = await res.json();
      if (!res.ok) {
        setErr(data.error ?? "Product not found");
        return;
      }
      setAppliance(data.appliance as Appliance);
      setSellerName(String(data.seller_name ?? ""));
      setSellerShop(String(data.seller_shop ?? ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-violet-950">
        Look up product by ID
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter an appliance ID (e.g.{" "}
        <code className="rounded bg-violet-50 px-1 text-violet-900">APP-20260329-904</code>
        ) to view listing details and seller.
      </p>
      <form
        onSubmit={search}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
      >
        <label className="min-w-0 flex-1 text-sm font-medium text-slate-700">
          Appliance ID
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="APP-YYYYMMDD-XXX"
            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="shrink-0 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {appliance && (
        <div className="mt-6 space-y-4 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                {appliance.appliance_id}
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">
                {appliance.name}
              </h3>
              <p className="text-sm text-slate-600">
                {sellerName}
                {sellerShop ? ` · ${sellerShop}` : ""}
              </p>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                appliance.status === "live"
                  ? "bg-emerald-100 text-emerald-800"
                  : appliance.status === "deleted"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-900"
              }`}
            >
              {appliance.status}
            </span>
          </div>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Category</dt>
              <dd className="font-medium text-slate-900">{appliance.category}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Seller phone</dt>
              <dd className="font-mono font-medium text-slate-900">
                {appliance.seller_phone}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Rent / day</dt>
              <dd className="font-medium text-slate-900">₹{appliance.daily_price}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Deposit</dt>
              <dd className="font-medium text-slate-900">₹{appliance.deposit}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Service areas</dt>
              <dd className="text-slate-900">{appliance.service_areas || "—"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Availability</dt>
              <dd className="text-slate-900">
                {appliance.available_from}
                {appliance.available_to
                  ? ` → ${appliance.available_to}`
                  : " (open)"}
              </dd>
            </div>
          </dl>
          <p className="text-sm text-slate-700">
            {appliance.description || "No description."}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href={`/appliance/${encodeURIComponent(appliance.appliance_id)}`}
              className="rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50"
            >
              Open public page
            </Link>
            <Link
              href={`/admin/sellers/${encodeURIComponent(appliance.seller_phone)}`}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              View seller in admin
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
