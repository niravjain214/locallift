"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApplianceRow = {
  appliance_id: string;
  name: string;
  category: string;
  daily_price: number;
  photos: string[];
  seller_name: string;
  status?: string;
};

const PRICE_GREEN = "bg-[#1a6d32]";

export function HomeLiveSection() {
  const [items, setItems] = useState<ApplianceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/appliances?sort=price_asc", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        const rows = Array.isArray(data?.appliances) ? data.appliances : [];
        setItems(rows);
      })
      .catch(() => {
        if (!mounted) return;
        setItems([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const gridItems = items.slice(0, 12);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-14 pt-2">
      <div className="mb-4 flex items-end justify-between gap-3 pt-1 sm:pt-2">
        <div className="min-w-0">
          <h2 className="inline-block rounded-xl bg-[#E9B8C9] px-4 py-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Live marketplace
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            Rentals near you in Dehradun
          </p>
        </div>
        <Link
          href="/browse"
          className="shrink-0 text-sm font-semibold text-rose-800 underline decoration-rose-800/80 underline-offset-2 dark:text-rose-300"
        >
          See all &gt;
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>
      ) : gridItems.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No listings yet — check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
          {gridItems.map((a, idx) => (
            <Link
              key={a.appliance_id}
              href={`/appliance/${a.appliance_id}`}
              className="group block min-w-0"
            >
              <div className="relative">
                <div className="aspect-square overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                  {a.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.photos[0]}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-3xl text-slate-300 dark:text-slate-600">
                      🧰
                    </div>
                  )}
                </div>
                {idx === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:bg-amber-500/20 dark:text-amber-100">
                    Popular
                  </span>
                )}
                <span
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#E9B8C9] bg-white text-lg font-semibold leading-none text-rose-600 shadow-sm dark:bg-slate-950 dark:text-[#E9B8C9]"
                  aria-hidden
                >
                  +
                </span>
              </div>
              <div className="mt-2 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-flex rounded-md ${PRICE_GREEN} px-2 py-0.5 text-xs font-bold text-white`}
                  >
                    ₹{a.daily_price}
                    <span className="font-semibold opacity-90">/day</span>
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-slate-900 dark:text-slate-100">
                  {a.name}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-600 dark:text-slate-400">
                  {a.seller_name || "Local partner"}
                  {a.category ? ` · ${a.category}` : ""}
                </p>
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-500">
                  <span aria-hidden>⚡</span> Same-day coordination
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
