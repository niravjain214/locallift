"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AREA_KEY } from "@/lib/area-storage";
import { DEHRADUN_AREAS } from "@/lib/areas";
import { InstallAppButton } from "@/components/InstallAppButton";
import { ThemeToggle } from "@/components/ThemeToggle";

type Props = {
  variant?: "public" | "seller" | "admin";
};

function ArrowTowardMenu({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function AppHeader({ variant = "public" }: Props) {
  const pathname = usePathname();
  const [area, setArea] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const sync = () => setArea(localStorage.getItem(AREA_KEY));
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("locallift-area", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("locallift-area", sync);
    };
  }, []);

  const isAdmin = variant === "admin";
  const brandClass = isAdmin ? "text-violet-700" : "text-slate-900";

  const publicNavLinks = (
    <>
      <Link
        href="/browse"
        className="shrink-0 rounded-full px-3 py-2 text-sm text-slate-800 transition hover:bg-white/35 sm:px-3.5"
      >
        Browse
      </Link>
      <Link
        href="/track"
        className="shrink-0 rounded-full px-3 py-2 text-sm text-slate-800 transition hover:bg-white/35 sm:px-3.5"
      >
        Track
      </Link>
      <Link
        href="/orders"
        className="shrink-0 rounded-full px-3 py-2 text-sm text-slate-800 transition hover:bg-white/35 sm:px-3.5"
      >
        My Orders
      </Link>
      <InstallAppButton
        className="shrink-0 rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:px-3.5"
        label="Download App"
      />
      <ThemeToggle className="hidden md:inline-flex" />
      <span className="hidden items-center gap-1 md:inline-flex" title="Shops can sign up as a partner">
        <span className="max-w-[11rem] truncate text-xs font-semibold text-slate-900 lg:max-w-none">
          Want to be a partner?
        </span>
        <ArrowTowardMenu className="h-4 w-4 shrink-0 text-slate-900" />
      </span>
      <Link
        href="/sell"
        className="shrink-0 rounded-full bg-amber-500/15 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-500/25 sm:px-3.5"
      >
        Partner
      </Link>
    </>
  );

  const areaChip =
    area && variant === "public" ? (
      <Link
        href="/browse"
        title={area}
        className="flex max-w-[11rem] shrink-0 items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1.5 text-xs font-semibold text-teal-900 ring-1 ring-teal-100/80 transition hover:bg-teal-100 sm:max-w-md sm:px-3"
      >
        <span className="truncate">📍 {area}</span>
        <span className="shrink-0 font-normal text-teal-600 underline underline-offset-2">
          Change
        </span>
      </Link>
    ) : null;

  return (
    <header
      className={`sticky top-0 z-40 border-b ${
        isAdmin
          ? "border-violet-200/80 bg-violet-50/95"
          : "border-black/[0.08] bg-[#2596be]"
      } backdrop-blur-md`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:gap-3 sm:py-3.5">
        <Link
          href="/"
          className={`shrink-0 text-base font-bold tracking-tight sm:text-lg ${brandClass}`}
        >
          {isAdmin ? "LocalLift Admin" : "LocalLift"}
        </Link>

        {variant === "public" ? (
          <>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 md:hidden">
              <ThemeToggle className="shrink-0" />
              <span className="max-w-[min(8.5rem,32vw)] text-right text-[10px] font-semibold leading-snug text-slate-900 sm:max-w-[10rem] sm:text-[11px]">
                Want to be a partner?
              </span>
              <ArrowTowardMenu className="h-4 w-4 shrink-0 self-center text-slate-900" />
            </div>
            <nav
              className="hidden min-w-0 flex-1 items-center justify-end gap-1 md:flex"
              aria-label="Main"
            >
              {publicNavLinks}
              {areaChip}
            </nav>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-800 transition hover:bg-white/35 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="app-header-mobile-nav"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu — includes Partner for shops"
              }
              title="Open menu — Partner signup for shops"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              )}
            </button>
          </>
        ) : (
          <nav className="flex flex-1 items-center justify-end gap-1">
            {variant === "seller" && (
              <Link
                href="/"
                className="shrink-0 rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-teal-800 sm:px-3.5"
              >
                Home
              </Link>
            )}
          </nav>
        )}
      </div>

      {variant === "public" && (
        <div
          id="app-header-mobile-nav"
          className={`border-t border-slate-200/80 bg-white/98 dark:border-slate-800 dark:bg-slate-950 md:hidden ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <nav
            className="mx-auto flex max-w-6xl flex-col gap-0.5 px-4 py-3"
            aria-label="Mobile"
          >
            <Link
              href="/browse"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Browse
            </Link>
            <Link
              href="/track"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              Track
            </Link>
            <Link
              href="/orders"
              className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
              onClick={() => setMenuOpen(false)}
            >
              My Orders
            </Link>
            <InstallAppButton
              className="rounded-xl bg-teal-50 px-3 py-2.5 text-left text-sm font-semibold text-teal-900 transition hover:bg-teal-100 dark:bg-slate-900 dark:text-[#2596be] dark:ring-1 dark:ring-[#2596be]/30 dark:hover:bg-slate-800"
              label="Download App"
              onTriggered={() => setMenuOpen(false)}
            />
            <Link
              href="/sell"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-amber-900 transition hover:bg-amber-500/10 dark:text-[#dff09a] dark:hover:bg-[#2596be]/10"
              onClick={() => setMenuOpen(false)}
            >
              Partner
            </Link>
            {area && (
              <Link
                href="/browse"
                className="mt-1 flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2.5 text-sm font-semibold text-teal-900 ring-1 ring-teal-100/80"
                title={area}
                onClick={() => setMenuOpen(false)}
              >
                <span className="min-w-0 truncate">📍 {area}</span>
                <span className="shrink-0 text-xs font-normal text-teal-600 underline underline-offset-2">
                  Change
                </span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function AreaSelectInline({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-slate-700 dark:text-slate-200">Select your area</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <option value="">Choose area…</option>
        {DEHRADUN_AREAS.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </label>
  );
}

