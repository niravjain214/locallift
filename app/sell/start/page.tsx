"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { DEHRADUN_AREAS } from "@/lib/areas";

function SellStartContent() {
  const router = useRouter();
  const search = useSearchParams();
  const qpPhone = search.get("phone") ?? "";

  const [step, setStep] = useState<"phone" | "otp" | "register">("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneLocked, setPhoneLocked] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [shop_name, setShop] = useState("");
  const [whatsapp_phone, setWa] = useState("");
  const [address, setAddr] = useState("");
  const [upi_id, setUpi] = useState("");
  const [areas, setAreas] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (qpPhone) setPhoneInput(qpPhone);
  }, [qpPhone]);

  function toggleArea(a: string) {
    setAreas((prev) => ({ ...prev, [a]: !prev[a] }));
  }

  async function continueFromPhone(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const lr = await fetch("/api/seller/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ phone: phoneInput }),
      });
      const lookup = await lr.json();
      if (!lr.ok) {
        setErr(String(lookup.error ?? "Something went wrong"));
        return;
      }
      const { phone, registered, requiresOtp } = lookup as {
        phone: string;
        registered: boolean;
        requiresOtp: boolean;
      };
      setPhoneLocked(phone);

      if (requiresOtp) {
        const sr = await fetch("/api/seller/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({ phone }),
        });
        const sent = await sr.json();
        if (!sr.ok) {
          setErr(String(sent.error ?? "Could not send OTP"));
          return;
        }
        setStep("otp");
        return;
      }

      if (registered) {
        router.replace(`/seller/${encodeURIComponent(phone)}`);
        return;
      }
      setStep("register");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const vr = await fetch("/api/seller/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
        body: JSON.stringify({ phone: phoneLocked, code: otp }),
      });
      const body = await vr.json();
      if (!vr.ok) {
        setErr(String(body.error ?? "Verification failed"));
        return;
      }

      if (body.next === "admin") {
        router.replace("/admin");
        router.refresh();
        return;
      }

      const lr = await fetch("/api/seller/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
        body: JSON.stringify({ phone: phoneLocked }),
      });
      const lookup = await lr.json();
      if (lookup.registered) {
        router.replace(`/seller/${encodeURIComponent(phoneLocked)}`);
        return;
      }
      setStep("register");
    } finally {
      setLoading(false);
    }
  }

  async function submitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const service_areas = Object.entries(areas)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (!service_areas.length) {
      setErr("Select at least one service area");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          name,
          shop_name,
          phone: phoneLocked,
          whatsapp_phone,
          address,
          upi_id,
          service_areas,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(String(data.error ?? "Failed"));
        return;
      }
      const p = String(data.seller.phone).replace(/\D/g, "").slice(-10);
      router.replace(`/seller/${encodeURIComponent(p)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader variant="seller" />
      <main className="ll-page max-w-xl pb-16">
        {step === "phone" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Partner sign-in</h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter your registered mobile number. New partners complete details
              on the next step.
            </p>
            <form onSubmit={continueFromPhone} className="mt-8 flex flex-col gap-4">
              <label className="text-sm font-medium text-slate-700">
                Mobile number
                <input
                  required
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="ll-input"
                />
              </label>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Please wait…" : "Continue"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Verify mobile</h1>
            <p className="mt-2 text-sm text-slate-600">
              We sent a code to{" "}
              <span className="font-semibold text-slate-800">{phoneLocked}</span>{" "}
              via SMS.
            </p>
            <form onSubmit={verifyOtp} className="mt-8 flex flex-col gap-4">
              <label className="text-sm font-medium text-slate-700">
                Enter OTP
                <input
                  required
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="ll-input"
                  placeholder="6-digit code"
                />
              </label>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify and continue"}
              </button>
              <button
                type="button"
                className="text-sm text-teal-700 underline"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setErr("");
                }}
              >
                Use a different number
              </button>
            </form>
          </>
        )}

        {step === "register" && (
          <>
            <h1 className="text-2xl font-bold text-slate-900">Seller registration</h1>
            <p className="mt-2 text-sm text-slate-600">
              Mobile{" "}
              <span className="font-semibold text-slate-800">{phoneLocked}</span>{" "}
              is locked for this account.
            </p>
            <form onSubmit={submitRegistration} className="mt-6 flex flex-col gap-4">
              <label className="text-sm">
                Full Name *
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="ll-input"
                />
              </label>
              <label className="text-sm">
                Shop/Business Name
                <input
                  value={shop_name}
                  onChange={(e) => setShop(e.target.value)}
                  className="ll-input"
                />
              </label>
              <label className="text-sm">
                Phone * <span className="text-slate-500">(dashboard login)</span>
                <input
                  readOnly
                  value={phoneLocked}
                  className="ll-input cursor-not-allowed bg-slate-50"
                />
              </label>
              <label className="text-sm">
                WhatsApp Number (if different)
                <input
                  type="tel"
                  value={whatsapp_phone}
                  onChange={(e) => setWa(e.target.value)}
                  className="ll-input"
                />
              </label>
              <label className="text-sm">
                Complete Address *
                <textarea
                  required
                  value={address}
                  onChange={(e) => setAddr(e.target.value)}
                  rows={3}
                  className="ll-input min-h-[5rem]"
                />
              </label>
              <fieldset className="text-sm">
                <legend className="font-medium text-slate-700">Service Areas *</legend>
                <div className="mt-2 grid max-h-56 grid-cols-1 gap-2 overflow-y-auto rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                  {DEHRADUN_AREAS.map((a) => (
                    <label key={a} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={!!areas[a]}
                        onChange={() => toggleArea(a)}
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </fieldset>
              <label className="text-sm">
                UPI ID *
                <input
                  required
                  value={upi_id}
                  onChange={(e) => setUpi(e.target.value)}
                  className="ll-input"
                  placeholder="name@upi"
                />
              </label>
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-teal-600 py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Saving…" : "Create dashboard"}
              </button>
            </form>
          </>
        )}
      </main>
    </>
  );
}

export default function SellStartPage() {
  return (
    <Suspense
      fallback={
        <>
          <AppHeader variant="seller" />
          <main className="flex flex-1 items-center justify-center px-4 py-16">
            <p className="text-slate-600">Loading…</p>
          </main>
        </>
      }
    >
      <SellStartContent />
    </Suspense>
  );
}
