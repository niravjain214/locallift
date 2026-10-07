import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { InstallAppButton } from "@/components/InstallAppButton";
import { WhenNotInstalled } from "@/components/WhenNotInstalled";
import { HomeBlinkitCategories } from "@/components/HomeBlinkitCategories";

export default function HomePage() {
  return (
    <>
      <AppHeader />
      <main className="flex flex-1 flex-col bg-[#2596be]">
        {/* Pink header band (like Blinkit): install strip + location + search */}
        <WhenNotInstalled>
          <section className="border-b border-black/[0.06] bg-[#2596be] md:hidden">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
              <p className="text-xs font-semibold text-slate-900">
                Install LocalLift on your phone
              </p>
              <InstallAppButton
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                label="Download App"
              />
            </div>
          </section>
        </WhenNotInstalled>
        <section className="w-full bg-[#2596be] pb-5 pt-3">
          <div className="mx-auto w-full max-w-6xl px-4">
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-900/75">
                  Dehradun
                </p>
                <p className="truncate text-sm font-semibold text-slate-900">
                  Select your area (top bar)
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  href="/orders"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm"
                >
                  My orders
                </Link>
              </div>
            </div>

            <div className="mt-3">
              <Link
                href="/browse"
                className="flex items-center gap-3 rounded-full bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_2px_12px_rgba(15,23,42,0.08)] ring-1 ring-black/[0.06] dark:bg-slate-900 dark:text-slate-200 dark:ring-[#2596be]/25"
              >
                <span className="text-lg opacity-80" aria-hidden>
                  🔎
                </span>
                <span className="font-medium text-slate-500">
                  Rent Laptops, TVs, Cameras, ACs...
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* White content sheet below the pink band (categories, listings, …) */}
        <div className="relative z-[1] -mt-2 flex flex-1 flex-col rounded-t-[22px] bg-white shadow-[0_-4px_24px_rgba(15,23,42,0.06)] dark:bg-slate-950 dark:shadow-[0_-4px_24px_rgba(233,184,201,0.07)]">
          <HomeBlinkitCategories />

          <section className="border-b border-slate-200/80 py-4 dark:border-slate-800">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4 py-2 text-center text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:justify-between sm:text-left">
            <span>Trusted local partners</span>
            <span className="hidden sm:inline">·</span>
            <span>Transparent daily rates</span>
            <span className="hidden sm:inline">·</span>
            <span>Area-based matching</span>
          </div>
        </section>

          <section className="mx-auto max-w-6xl px-4 py-12">
            <h2 className="mb-6 text-center text-sm font-bold uppercase tracking-[0.2em] text-[#2596be] dark:text-[#2596be]">
              Why LocalLift
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Clear pricing",
                  body: "Rent/day and deposit shown before you book — totals, payment status, and no surprise add-ons.",
                },
                {
                  title: "Fast coordination",
                  body: "Area-based matching, booking status, and simpler pickup and return with fewer back-and-forth calls.",
                },
                {
                  title: "Partner tools",
                  body: "List and publish quickly, manage bookings, and track earnings from your phone.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-[#2596be]/35 bg-white px-4 py-4 shadow-sm dark:border-[#2596be]/40 dark:bg-slate-900"
                >
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#2596be]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="bg-slate-900 py-16 text-white">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 text-center md:flex-row md:justify-between md:text-left">
            <div className="max-w-lg">
              <h2 className="text-2xl font-bold md:text-3xl">
                Ready when you are
              </h2>
              <p className="mt-3 text-slate-300">
                Choose your service area, compare options, and send a booking in
                minutes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/browse"
                className="inline-flex h-14 shrink-0 items-center justify-center rounded-full bg-white px-10 font-semibold text-slate-900 transition hover:bg-teal-50"
              >
                Get started
              </Link>
              <Link
                href="/policies"
                className="inline-flex h-14 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/5 px-8 font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Policies & Terms
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

