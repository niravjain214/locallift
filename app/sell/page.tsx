import Image from "next/image";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { IMG } from "@/lib/imagery";

export default function SellLandingPage() {
  return (
    <>
      <AppHeader variant="seller" />
      <main className="flex flex-1 flex-col">
        <section className="relative min-h-[70vh] overflow-hidden bg-slate-900">
          <div className="absolute inset-0">
            <Image
              src={IMG.sell}
              alt=""
              fill
              className="object-cover object-center opacity-50"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/85 to-slate-900" />
          </div>
          <div className="relative mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-300">
              Partner with LocalLift
            </p>
            <h1 className="mt-5 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              Earn from idle appliances
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-200">
              List fans, coolers, and kitchen appliances. You control pricing
              and availability; we help renters in your service areas find you.
            </p>
            <Link
              href="/sell/start"
              className="mt-10 inline-flex h-14 w-full max-w-sm items-center justify-center rounded-full bg-amber-500 px-8 text-base font-semibold text-white shadow-lg shadow-black/30 transition hover:bg-amber-400 sm:w-auto"
            >
              Continue with phone number
            </Link>
            <p className="mt-8 max-w-md text-sm text-slate-400">
              Already a partner? Enter the same mobile number on the next step
              to open your dashboard.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
