"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DEHRADUN_AREAS } from "@/lib/areas";
import type { Appliance, Booking, Seller } from "@/lib/types";

type Props = { phone: string };

export function SellerDashboardClient({ phone }: Props) {
  const [seller, setSeller] = useState<Seller | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [load, setLoad] = useState(true);
  const [gate, setGate] = useState<"ok" | "verify" | "missing">("ok");

  const refresh = useCallback(async () => {
    setGate("ok");
    const [srRes, arRes, brRes] = await Promise.all([
      fetch(`/api/sellers/${encodeURIComponent(phone)}`, {
        credentials: "include",
        cache: "no-store",
      }),
      fetch(`/api/appliances?seller_phone=${encodeURIComponent(phone)}`, {
        credentials: "include",
        cache: "no-store",
      }),
      fetch(`/api/bookings?seller_phone=${encodeURIComponent(phone)}`, {
        credentials: "include",
        cache: "no-store",
      }),
    ]);
    if (srRes.status === 401) {
      setSeller(null);
      setAppliances([]);
      setBookings([]);
      setGate("verify");
      setLoad(false);
      return;
    }
    const sr = await srRes.json();
    const ar = await arRes.json();
    const br = await brRes.json();
    if (!sr.seller) {
      setSeller(null);
      setGate("missing");
    } else {
      setSeller(sr.seller);
    }
    setAppliances(ar.appliances ?? []);
    setBookings(br.bookings ?? []);
    setLoad(false);
  }, [phone]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const earnings = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const done = bookings.filter((b) => b.status === "completed");
    const sum = (list: Booking[]) =>
      list.reduce((s, b) => s + b.rental_amount, 0);
    const week = done.filter(
      (b) => new Date(b.returned_at || b.created_at) >= weekAgo
    );
    const month = done.filter(
      (b) => new Date(b.returned_at || b.created_at) >= monthStart
    );
    const pendingPay = bookings
      .filter((b) => b.status !== "completed" && b.status !== "cancelled")
      .reduce((s, b) => s + b.rental_amount, 0);
    return {
      week: sum(week),
      month: sum(month),
      total: sum(done),
      pending: pendingPay,
      lastPayout: seller?.last_payout_at || "—",
    };
  }, [bookings, seller]);

  async function patchAppliance(
    id: string,
    body: Record<string, unknown>
  ) {
    await fetch(`/api/appliances/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(body),
    });
    refresh();
  }

  async function patchSeller(body: Record<string, unknown>) {
    await fetch(`/api/sellers/${encodeURIComponent(phone)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify(body),
    });
    refresh();
  }

  async function pauseAll() {
    await patchSeller({ status: "paused" });
    for (const a of appliances) {
      if (a.status === "live" || a.status === "rented") {
        await patchAppliance(a.appliance_id, { status: "paused" });
      }
    }
  }

  if (gate === "verify") {
    const ten = String(phone).replace(/\D/g, "").slice(-10);
    return (
      <>
        <AppHeader variant="seller" />
        <main className="ll-page max-w-md pb-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            Verify your number
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This dashboard is protected with SMS verification. Sign in with your
            mobile number to continue.
          </p>
          <a
            href={`/sell/start?phone=${encodeURIComponent(ten)}`}
            className="ll-btn-primary mt-8 inline-flex"
          >
            Continue to sign-in
          </a>
        </main>
      </>
    );
  }

  if (gate === "missing" && !load) {
    const ten = String(phone).replace(/\D/g, "").slice(-10);
    return (
      <>
        <AppHeader variant="seller" />
        <main className="ll-page max-w-md pb-16 text-center">
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">
            No seller account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find a partner registered for this number.
          </p>
          <a
            href={`/sell/start?phone=${encodeURIComponent(ten)}`}
            className="ll-btn-primary mt-8 inline-flex"
          >
            Register or use another number
          </a>
        </main>
      </>
    );
  }

  if (load || !seller) {
    return (
      <>
        <AppHeader variant="seller" />
        <p className="ll-page text-center text-slate-500">Loading dashboard…</p>
      </>
    );
  }

  const newReq = bookings.filter((b) => b.status === "pending");
  const activeRent = bookings.filter((b) =>
    ["confirmed", "out_for_delivery", "active", "return_due"].includes(b.status)
  );
  const completed = bookings.filter((b) => b.status === "completed");

  const liveCount = appliances.filter((a) => a.status === "live").length;

  return (
    <>
      <AppHeader variant="seller" />
      <main className="ll-page max-w-5xl space-y-6 sm:space-y-8">
        <div className="ll-card relative overflow-hidden ll-card-pad">
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-teal-50/90 via-white to-amber-50/50"
            aria-hidden
          />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-teal-700 uppercase">
                Partner hub
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {seller.name}
                {seller.shop_name ? (
                  <span className="font-medium text-slate-600">
                    {" "}
                    · {seller.shop_name}
                  </span>
                ) : null}
              </h1>
              <p className="mt-1 text-sm text-slate-600">{seller.phone}</p>
            </div>
            <Link
              href={`/seller/${encodeURIComponent(phone)}/add`}
              className="ll-btn-primary w-full justify-center sm:w-auto"
            >
              Add listing
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <PartnerStat label="New requests" value={newReq.length} />
          <PartnerStat label="Active rentals" value={activeRent.length} />
          <PartnerStat label="Live listings" value={liveCount} />
          <PartnerStat
            label="This week"
            value={`₹${earnings.week.toFixed(0)}`}
          />
        </div>

        <section className="ll-card ll-card-pad">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-lg font-semibold text-slate-900">My listings</h2>
            <p className="text-xs text-slate-500">
              Cards on mobile · full table on larger screens
            </p>
          </div>

          <div className="mt-4 space-y-3 md:hidden">
            {appliances.map((a) => (
              <div
                key={a.appliance_id}
                className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                  {a.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photos[0]}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-500">{a.category}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={a.daily_price}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm"
                      onBlur={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v) && v !== a.daily_price) {
                          patchAppliance(a.appliance_id, { daily_price: v });
                        }
                      }}
                    />
                    <span className="text-xs text-slate-500">₹/day</span>
                  </div>
                  <p className="mt-1 text-xs capitalize text-slate-600">
                    {a.status} · earns ₹{a.total_earnings}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-800 ring-1 ring-slate-200"
                      onClick={() =>
                        patchAppliance(a.appliance_id, {
                          status: a.status === "paused" ? "live" : "paused",
                        })
                      }
                    >
                      {a.status === "paused" ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700 ring-1 ring-red-100"
                      onClick={() => {
                        if (confirm("Delete this listing? (soft-delete)"))
                          patchAppliance(a.appliance_id, { status: "deleted" });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!appliances.length && (
              <p className="text-center text-sm text-slate-500">
                No listings yet. Add your first appliance.
              </p>
            )}
          </div>

          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2">Category</th>
                  <th className="pb-2 pr-2">Price/day</th>
                  <th className="pb-2 pr-2">Status</th>
                  <th className="pb-2 pr-2">Earnings</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appliances.map((a) => (
                  <tr key={a.appliance_id} className="border-b border-slate-100">
                    <td className="py-2 pr-2 font-medium">{a.name}</td>
                    <td className="py-2 pr-2">{a.category}</td>
                    <td className="py-2 pr-2">
                      <input
                        type="number"
                        defaultValue={a.daily_price}
                        className="w-20 rounded-lg border border-slate-200 px-2 py-1"
                        onBlur={(e) => {
                          const v = Number(e.target.value);
                          if (!Number.isNaN(v) && v !== a.daily_price) {
                            patchAppliance(a.appliance_id, { daily_price: v });
                          }
                        }}
                      />
                    </td>
                    <td className="py-2 pr-2">{a.status}</td>
                    <td className="py-2 pr-2">₹{a.total_earnings}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          className="rounded-full bg-slate-100 px-2 py-1 text-xs"
                          onClick={() =>
                            patchAppliance(a.appliance_id, {
                              status: a.status === "paused" ? "live" : "paused",
                            })
                          }
                        >
                          {a.status === "paused" ? "Resume" : "Pause"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-red-50 px-2 py-1 text-xs text-red-700"
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this listing? (soft-delete)"
                              )
                            )
                              patchAppliance(a.appliance_id, {
                                status: "deleted",
                              });
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="ll-card ll-card-pad lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900">Bookings</h2>
            <p className="mt-1 text-sm">
              <Link
                href={`/seller/${encodeURIComponent(phone)}/bookings`}
                className="font-medium text-teal-700 underline decoration-teal-300 underline-offset-2 hover:text-teal-900"
              >
                Open full bookings →
              </Link>
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-medium text-amber-700">New requests</h3>
                <ul className="mt-1 text-sm text-slate-600">
                  {newReq.map((b) => (
                    <li key={b.booking_id}>
                      {b.booking_id} — {b.customer_name} ({b.customer_phone})
                    </li>
                  ))}
                  {!newReq.length && <li>None</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-teal-700">Active rentals</h3>
                <ul className="mt-1 text-sm text-slate-600">
                  {activeRent.map((b) => (
                    <li key={b.booking_id}>
                      {b.customer_name} — {b.customer_phone} ·{" "}
                      {b.start_date} → {b.end_date}
                      <br />
                      <span className="text-xs">{b.customer_address}</span>
                    </li>
                  ))}
                  {!activeRent.length && <li>None</li>}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-700">Completed</h3>
                <p className="text-sm text-slate-600">{completed.length} total</p>
              </div>
            </div>
          </div>

          <div className="ll-card border-amber-200/80 bg-gradient-to-b from-amber-50/80 to-white p-6">
            <h2 className="text-lg font-semibold text-slate-900">Earnings</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt>This week</dt>
                <dd className="font-semibold">₹{earnings.week.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>This month</dt>
                <dd className="font-semibold">₹{earnings.month.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Total</dt>
                <dd className="font-semibold">₹{earnings.total.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Pending</dt>
                <dd className="font-semibold">₹{earnings.pending.toFixed(0)}</dd>
              </div>
              <div className="flex justify-between border-t border-amber-200 pt-2">
                <dt>Last payout</dt>
                <dd>{earnings.lastPayout}</dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="ll-card ll-card-pad">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <SellerSettingsForm seller={seller} onSave={patchSeller} />
          <button
            type="button"
            className="mt-4 w-full rounded-full border border-red-200 bg-red-50 py-3 text-sm font-semibold text-red-800 sm:w-auto sm:px-8"
            onClick={() => pauseAll()}
          >
            Pause all listings
          </button>
        </section>
      </main>
    </>
  );
}

function PartnerStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
        {value}
      </p>
    </div>
  );
}

function SellerSettingsForm({
  seller,
  onSave,
}: {
  seller: Seller;
  onSave: (b: Record<string, unknown>) => void;
}) {
  const [upi_id, setUpi] = useState(seller.upi_id);
  const [address, setAddr] = useState(seller.address);
  const [areas, setAreas] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {};
    for (const a of DEHRADUN_AREAS) m[a] = false;
    seller.service_areas.split(",").forEach((x) => {
      const t = x.trim();
      if (t) m[t] = true;
    });
    return m;
  });

  return (
    <form
      className="mt-4 grid gap-4 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const service_areas = Object.entries(areas)
          .filter(([, v]) => v)
          .map(([k]) => k);
        onSave({ upi_id, address, service_areas });
      }}
    >
      <label className="text-sm sm:col-span-2">
        UPI ID
        <input
          value={upi_id}
          onChange={(e) => setUpi(e.target.value)}
          className="ll-input"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Address
        <textarea
          value={address}
          onChange={(e) => setAddr(e.target.value)}
          rows={2}
          className="ll-input min-h-[5rem]"
        />
      </label>
      <fieldset className="text-sm sm:col-span-2">
        <legend>Service areas</legend>
        <div className="mt-2 grid max-h-40 grid-cols-2 gap-1 overflow-y-auto">
          {DEHRADUN_AREAS.map((a) => (
            <label key={a} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={!!areas[a]}
                onChange={() =>
                  setAreas((prev) => ({ ...prev, [a]: !prev[a] }))
                }
              />
              {a}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="submit"
        className="rounded-full bg-slate-900 py-3 text-sm font-semibold text-white sm:col-span-2"
      >
        Save settings
      </button>
    </form>
  );
}
