"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ELECTRONICS_CATEGORY_GROUPS } from "@/lib/areas";
import { AREA_KEY } from "@/lib/area-storage";
import {
  categoryLogoFor,
  productEmojiForGroup,
  productEmojiImageForGroup,
  productImageForGroup,
} from "@/lib/product-images";

export function HomeBlinkitCategories() {
  const [area, setArea] = useState("");

  useEffect(() => {
    const sync = () => setArea(localStorage.getItem(AREA_KEY) ?? "");
    sync();
    window.addEventListener("locallift-area", sync);
    return () => window.removeEventListener("locallift-area", sync);
  }, []);

  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-5">
      <div className="space-y-7">
        {ELECTRONICS_CATEGORY_GROUPS.map((group) => (
          <div key={group.slug}>
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-12 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={categoryLogoFor(group.slug)}
                  alt={group.label}
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                {group.label}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-5 xl:grid-cols-6">
              {group.products.map((product) => {
                const emoji = productEmojiForGroup(group.slug, product);
                const emojiImage = productEmojiImageForGroup(group.slug, product);
                return (
                  <Link
                    key={`${group.slug}-${product}`}
                    href={`/browse?${new URLSearchParams({
                      ...(area ? { area } : {}),
                      category: group.slug,
                      q: product,
                    }).toString()}`}
                    className="rounded-2xl bg-[#eaf1f3] p-2 transition hover:bg-[#dfe8eb] dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    <div className="mb-1 aspect-[4/3] overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800">
                      {emojiImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={emojiImage}
                          alt={product}
                          className="h-full w-full object-contain p-2"
                        />
                      ) : emoji ? (
                        <div className="flex h-full w-full items-center justify-center text-4xl md:text-5xl">
                          <span role="img" aria-label={product}>
                            {emoji}
                          </span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={productImageForGroup(group.slug, product)}
                          alt={product}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <p className="line-clamp-2 text-center text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200">
                      {product}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
