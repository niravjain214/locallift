"use client";

import { useState } from "react";
import { AREA_KEY } from "@/lib/area-storage";

type Props = {
  applianceId: string;
  open: boolean;
  onClose: () => void;
};

export function BookingModal({ applianceId, open, onClose }: Props) {
  const [customer_name, setName] = useState("");
  const [customer_phone, setPhone] = useState("");
  const [customer_whatsapp, setWa] = useState(true);
  const [customer_address, setAddr] = useState("");
  const [landmark, setLandmark] = useState("");
  const [start_date, setStart] = useState("");
  const [end_date, setEnd] = useState("");
  const [special_requests, setReq] = useState("");
  const [done, setDone] = useState<{ id: string; msg: string } | null>(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const area = localStorage.getItem(AREA_KEY) ?? "";
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        appliance_id: applianceId,
        area,
        customer_name,
        customer_phone,
        customer_whatsapp,
        customer_address,
        landmark,
        start_date,
        end_date,
        special_requests,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error ?? "Something went wrong");
      return;
    }
    setDone({ id: data.booking_id, msg: data.message });
  }

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
          <h3 className="text-lg font-semibold text-emerald-700">Booking received</h3>
          <p className="mt-2 text-slate-600">{done.msg}</p>
          <p className="mt-4 font-mono text-sm text-slate-800">
            Booking ID: <strong>{done.id}</strong>
          </p>
          <button
            type="button"
            className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white"
            onClick={() => {
              setDone(null);
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Rent this appliance</h3>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-600"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <label className="text-sm">
            Full Name *
            <input
              required
              value={customer_name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Phone Number *
            <input
              required
              type="tel"
              value={customer_phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={customer_whatsapp}
              onChange={(e) => setWa(e.target.checked)}
            />
            WhatsApp available?
          </label>
          <label className="text-sm">
            Complete Address *
            <textarea
              required
              value={customer_address}
              onChange={(e) => setAddr(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="text-sm">
            Landmark *
            <input
              required
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              Rental Start *
              <input
                required
                type="date"
                value={start_date}
                onChange={(e) => setStart(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Rental End *
              <input
                required
                type="date"
                value={end_date}
                onChange={(e) => setEnd(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          </div>
          <label className="text-sm">
            Special Requests
            <textarea
              value={special_requests}
              onChange={(e) => setReq(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
