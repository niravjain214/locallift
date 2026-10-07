"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppHeader, AreaSelectInline } from "@/components/AppHeader";
import { BROWSE_CATEGORIES, ELECTRONICS_CATEGORY_GROUPS } from "@/lib/areas";
import { AREA_KEY } from "@/lib/area-storage";
import {
  categoryLogoFor,
  productEmojiForGroup,
  productEmojiImageForGroup,
  productImageForGroup,
} from "@/lib/product-images";

type ApplianceRow = {
  appliance_id: string;
  name: string;
  category: string;
  daily_price: number;
  deposit: number;
  photos: string[];
  seller_name: string;
  status: string;
};

export function BrowseClient() {
  const sp = useSearchParams();
  const [area, setArea] = useState("");
  const [ready, setReady] = useState(false);
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("price_asc");
  const [items, setItems] = useState<ApplianceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const a = localStorage.getItem(AREA_KEY) ?? "";
    setArea(a);
    setReady(!!a);
  }, []);

  useEffect(() => {
    const cat = sp.get("category");
    const query = sp.get("q");
    const product = sp.get("product");
    if (cat) setCategory(cat);
    if (query) setQ(query);
    if (product) setQ(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistArea = (v: string) => {
    setArea(v);
    if (v) {
      localStorage.setItem(AREA_KEY, v);
      window.dispatchEvent(new Event("locallift-area"));
      setReady(true);
    }
  };

  const load = useCallback(async () => {
    if (!area) return;
    setLoading(true);
    const params = new URLSearchParams({ area, category, sort });
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    const res = await fetch(`/api/appliances?${params}`, { cache: "no-store" });
    const data = await res.json();
    let rows: ApplianceRow[] = data.appliances ?? [];
    const query = q.trim().toLowerCase();
    if (query) {
      rows = rows.filter(
        (x) =>
          String(x.name ?? "").toLowerCase().includes(query) ||
          String(x.category ?? "").toLowerCase().includes(query) ||
          String(x.seller_name ?? "").toLowerCase().includes(query)
      );
    }
    setItems(rows);
    setLoading(false);
  }, [area, category, minPrice, maxPrice, sort, q]);

  useEffect(() => {
    if (ready && area) load();
  }, [ready, area, load]);

  const headerArea = useMemo(() => area, [area]);
  const selectedGroup = useMemo(
    () => ELECTRONICS_CATEGORY_GROUPS.find((g) => g.slug === category) ?? null,
    [category]
  );

  return (
    <>
      <AppHeader />
      <main className="ll-page flex flex-col gap-6 sm:gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Browse products
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
            Choose your area, select a category, and compare rental pricing.
          </p>
        </div>
        <div className="ll-card ll-card-pad">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              <AreaSelectInline value={area} onChange={persistArea} />
            </div>
            {headerArea && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                📍{" "}
                <span className="font-semibold text-teal-700">{headerArea}</span>
                <button
                  type="button"
                  className="ml-2 text-teal-600 underline"
                  onClick={() => {
                    setReady(false);
                    setArea("");
                    localStorage.removeItem(AREA_KEY);
                    window.dispatchEvent(new Event("locallift-area"));
                  }}
                >
                  Change
                </button>
              </p>
            )}
          </div>
          {!ready && (
            <button
              type="button"
              onClick={() => area && setReady(true)}
              disabled={!area}
              className="ll-btn-primary mt-4 w-full disabled:pointer-events-none disabled:opacity-50 sm:mt-0 sm:w-auto"
            >
              Continue to listings
            </button>
          )}
        </div>

        {ready && (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {sidebarOpen ? "Hide filters" : "Show filters"}
                <span aria-hidden>{sidebarOpen ? "◀" : "▶"}</span>
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {items.length} products found
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
              {sidebarOpen ? (
                <aside className="ll-card ll-card-pad h-fit space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Categories
                    </p>
                    <div className="space-y-2">
                      {ELECTRONICS_CATEGORY_GROUPS.map((g) => (
                        <button
                          key={g.slug}
                          type="button"
                          onClick={() => setCategory(g.slug)}
                          className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                            category === g.slug
                              ? "bg-[#2596be] text-slate-900 ring-1 ring-[#2596be]"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                          }`}
                        >
                          <span className="mr-2 inline-flex h-5 w-7 overflow-hidden rounded bg-white/80 align-middle">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={categoryLogoFor(g.slug)}
                              alt={g.label}
                              className="h-full w-full object-cover"
                            />
                          </span>
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedGroup && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Products
                      </p>
                      <div className="space-y-2">
                        {selectedGroup.products.map((p) => {
                          const emoji = productEmojiForGroup(selectedGroup.slug, p);
                          const emojiImage = productEmojiImageForGroup(selectedGroup.slug, p);
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setQ(p)}
                              className={`flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs transition ${
                                q.toLowerCase() === p.toLowerCase()
                                  ? "bg-[#2596be] text-slate-900"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                              }`}
                            >
                              {emojiImage ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={emojiImage}
                                  alt={p}
                                  className="h-9 w-11 rounded-md object-contain bg-white p-1 dark:bg-slate-700 md:h-10 md:w-12"
                                />
                              ) : emoji ? (
                                <span
                                  className="inline-flex h-9 w-11 items-center justify-center rounded-md bg-white text-xl dark:bg-slate-700 md:h-10 md:w-12 md:text-2xl"
                                  role="img"
                                  aria-label={p}
                                >
                                  {emoji}
                                </span>
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={productImageForGroup(selectedGroup.slug, p)}
                                  alt={p}
                                  className="h-8 w-10 rounded-md object-cover"
                                />
                              )}
                              <span className="line-clamp-2">{p}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3">
                    <label className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Category</span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="ll-input mt-1 py-2.5"
                      >
                        {BROWSE_CATEGORIES.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Min ₹/day</span>
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="ll-input mt-1 py-2.5"
                        placeholder="0"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Max ₹/day</span>
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="ll-input mt-1 py-2.5"
                        placeholder="Any"
                      />
                    </label>
                    <label className="text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Sort</span>
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="ll-input mt-1 py-2.5"
                      >
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                    </label>
                  </div>
                </aside>
              ) : null}

              <section className="min-w-0">
                <div className="ll-card ll-card-pad mb-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Search products
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search laptop, projector, camera..."
                      className="ll-input mt-2"
                    />
                  </label>
                </div>

                {loading ? (
                  <p className="text-center text-slate-500 dark:text-slate-400">Loading…</p>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {items.map((a) => (
                      <Link
                        key={a.appliance_id}
                        href={`/appliance/${a.appliance_id}`}
                        className="ll-card flex flex-col overflow-hidden transition hover:border-teal-300/80 hover:shadow-lg"
                      >
                        <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800">
                          {a.photos[0] ? (
                            a.photos[0].startsWith("data:") ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.photos[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={a.photos[0]}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            )
                          ) : null}
                        </div>
                        <div className="flex flex-1 flex-col gap-1 p-4">
                          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{a.seller_name}</p>
                          <p className="text-lg font-bold text-teal-700">
                            ₹{a.daily_price}
                            <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                              /day
                            </span>
                          </p>
                          <span className="mt-auto inline-flex w-fit rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Available now
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {!loading && items.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400">
                    No products in this area yet. Try another category, product, or area.
                  </p>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </>
  );
}

