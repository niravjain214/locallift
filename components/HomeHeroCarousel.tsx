"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  imageSrc: string;
  year: string;
  title: string;
  subtitle: string;
  ctaHref: string;
  ctaLabel: string;
};

export function HomeHeroCarousel({ imageSrc }: { imageSrc: string }) {
  const slides: Slide[] = useMemo(
    () => [
      {
        imageSrc,
        year: new Date().getFullYear().toString(),
        title: "LocalLift — Dehradun",
        subtitle:
          "Rent appliances by area. Transparent daily pricing, verified partners, fast delivery coordination.",
        ctaHref: "/browse",
        ctaLabel: "Browse appliances",
      },
      {
        imageSrc,
        year: new Date().getFullYear().toString(),
        title: "Become a partner",
        subtitle:
          "List your appliances, get bookings, and track earnings — all in a simple dashboard built for mobile.",
        ctaHref: "/sell",
        ctaLabel: "Partner dashboard",
      },
    ],
    [imageSrc]
  );

  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = window.setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(t);
  }, [paused, slides.length]);

  const slide = slides[idx]!;

  return (
    <section
      className="mx-auto w-full max-w-6xl px-2 pb-10 pt-4 sm:px-4 sm:pt-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-900 shadow-[0_12px_40px_rgba(15,23,42,0.15)] sm:rounded-3xl sm:shadow-[0_20px_80px_rgba(15,23,42,0.18)]">
        <div className="relative aspect-[2000/945]">
          <Image
            src={slide.imageSrc}
            alt=""
            fill
            priority
            className="object-contain sm:object-cover"
            sizes="(min-width: 1024px) 960px, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />

          {/* Desktop overlay content (kept inside image) */}
          <div className="absolute inset-x-0 bottom-0 hidden p-4 sm:block sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                  {slide.year}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight sm:text-3xl">
                  {slide.title}
                </p>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                  {slide.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={slide.ctaHref}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-slate-900 transition hover:bg-teal-50"
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          </div>

          {/* Carousel controls: centered vertically so they never overlap CTAs */}
          <button
            type="button"
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white sm:left-5"
            onClick={() => setIdx((i) => (i - 1 + slides.length) % slides.length)}
          >
            <span aria-hidden>‹</span>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm transition hover:bg-white sm:right-5"
            onClick={() => setIdx((i) => (i + 1) % slides.length)}
          >
            <span aria-hidden>›</span>
          </button>
        </div>
      </div>

      {/* Mobile content (placed under image) */}
      <div className="mt-4 sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
          {slide.year}
        </p>
        <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          {slide.title}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          {slide.subtitle}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={slide.ctaHref}
            className="inline-flex h-10 items-center justify-center rounded-full bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-500"
          >
            {slide.ctaLabel}
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-10 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
          >
            Browse
          </Link>
        </div>
      </div>
    </section>
  );
}

