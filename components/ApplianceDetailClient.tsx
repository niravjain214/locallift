"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { BookingModal } from "@/components/BookingModal";

type Props = { id: string };

export function ApplianceDetailClient({ id }: Props) {
  const [data, setData] = useState<{
    appliance: {
      appliance_id: string;
      name: string;
      description: string;
      condition: string;
      daily_price: number;
      deposit: number;
      photos: string[];
      category: string;
    };
    seller_name: string;
  } | null>(null);
  const [ix, setIx] = useState(0);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    fetch(`/api/appliances/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setData);
  }, [id]);

  if (!data?.appliance) {
    return (
      <>
        <AppHeader />
        <p className="ll-page text-center text-slate-500">Loading…</p>
      </>
    );
  }

  const a = data.appliance;
  const photo = a.photos[ix] ?? a.photos[0];

  return (
    <>
      <AppHeader />
      <main className="ll-page max-w-4xl pb-24 sm:pb-8">
        <div className="ll-card overflow-hidden">
          <div className="relative aspect-[4/3] bg-slate-100 sm:aspect-[16/10]">
            {photo &&
              (photo.startsWith("data:") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-full w-full object-cover" />
              ))}
          </div>
          <div className="flex gap-2 overflow-x-auto p-3">
            {a.photos.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIx(i)}
                className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === ix ? "border-teal-500" : "border-transparent"
                }`}
              >
                {p.startsWith("data:") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p} alt="" className="h-full w-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p} alt="" className="h-full w-full object-cover" />
                )}
              </button>
            ))}
          </div>
          <div className="space-y-4 p-5 sm:p-8">
            <div>
              <p className="text-xs font-semibold tracking-wide text-teal-600 uppercase">
                {a.category}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {a.name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">{data.seller_name}</p>
            </div>
            <p className="leading-relaxed text-slate-700">
              {a.description || "—"}
            </p>
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-800">
                Condition: {a.condition}
              </span>
            </div>
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-4 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-2xl font-bold text-teal-700">
                ₹{a.daily_price}
                <span className="text-base font-semibold text-slate-500">
                  /day
                </span>
              </p>
              <p className="text-sm font-medium text-slate-600">
                + ₹{a.deposit} refundable deposit
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModal(true)}
              className="fixed right-0 bottom-0 left-0 z-30 inline-flex min-h-14 w-full items-center justify-center bg-teal-600 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3.5 text-base font-semibold text-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition hover:bg-teal-500 sm:static sm:z-0 sm:mt-4 sm:min-h-12 sm:w-full sm:rounded-full sm:py-3.5 sm:pb-3.5 sm:shadow-md"
            >
              Book this appliance
            </button>
          </div>
        </div>
      </main>
      <BookingModal
        applianceId={a.appliance_id}
        open={modal}
        onClose={() => setModal(false)}
      />
    </>
  );
}
