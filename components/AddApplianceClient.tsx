"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { APPLIANCE_CATEGORY_OPTIONS } from "@/lib/areas";

type Props = { phone: string };

export function AddApplianceClient({ phone }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [category, setCat] = useState(APPLIANCE_CATEGORY_OPTIONS[0] ?? "Other");
  const [daily_price, setPrice] = useState("");
  const [deposit, setDep] = useState("");
  const [description, setDesc] = useState("");
  const [condition, setCond] = useState("Good");
  const [available_from, setFrom] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [available_to, setTo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  function onFiles(files: FileList | null) {
    if (!files || files.length < 3) {
      setErr("Please select 3 photos");
      return;
    }
    setErr("");
    const readers: Promise<string>[] = [];
    for (let i = 0; i < 3; i++) {
      const f = files[i];
      readers.push(
        new Promise((resolve, reject) => {
          const r = new FileReader();
          r.onload = () => resolve(String(r.result));
          r.onerror = reject;
          r.readAsDataURL(f);
        })
      );
    }
    Promise.all(readers).then(setPhotos);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (photos.length < 3) {
      setErr("Three photos required");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/appliances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      cache: "no-store",
      body: JSON.stringify({
        seller_phone: phone,
        name,
        category,
        photos,
        daily_price: Number(daily_price),
        deposit: Number(deposit),
        description,
        condition,
        available_from,
        available_to: available_to || "",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setErr(data.error ?? "Failed");
      return;
    }
    setOk(true);
    setTimeout(() => router.push(`/seller/${encodeURIComponent(phone)}`), 1500);
  }

  return (
    <>
      <AppHeader variant="seller" />
      <main className="ll-page max-w-xl pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Add product listing
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Upload clear photos and transparent pricing to help customers book faster.
          </p>
        </div>
        {ok && (
          <p className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">
            Your item is now live!
          </p>
        )}
        <form
          onSubmit={submit}
          className="ll-card ll-card-pad flex flex-col gap-4 sm:gap-5"
        >
          <label className="text-sm font-medium text-slate-700">
            Product name *
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ll-input"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Product category
            <select
              value={category}
              onChange={(e) => setCat(e.target.value as typeof APPLIANCE_CATEGORY_OPTIONS[number])}
              className="ll-input"
            >
              {APPLIANCE_CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Photos * (at least 3)
            <input
              required
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => onFiles(e.target.files)}
              className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-teal-800"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Rent per day (₹) *
              <input
                required
                type="number"
                min={1}
                value={daily_price}
                onChange={(e) => setPrice(e.target.value)}
                className="ll-input"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Security deposit (₹) *
              <input
                required
                type="number"
                min={0}
                value={deposit}
                onChange={(e) => setDep(e.target.value)}
                className="ll-input"
              />
            </label>
          </div>
          <label className="text-sm font-medium text-slate-700">
            Description
            <textarea
              value={description}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              className="ll-input min-h-[6rem]"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Condition
            <select
              value={condition}
              onChange={(e) => setCond(e.target.value)}
              className="ll-input"
            >
              {["New", "Good", "Fair", "Used"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              Available from
              <input
                type="date"
                value={available_from}
                onChange={(e) => setFrom(e.target.value)}
                className="ll-input"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Available to (optional)
              <input
                type="date"
                value={available_to}
                onChange={(e) => setTo(e.target.value)}
                className="ll-input"
              />
            </label>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            disabled={loading || ok}
            className="ll-btn-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? "Publishing…" : "Publish product"}
          </button>
        </form>
      </main>
    </>
  );
}
