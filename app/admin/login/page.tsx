"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function AdminLoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setErr("Invalid password");
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-violet-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-violet-900">LocalLift Admin</h1>
        <p className="mt-1 text-sm text-slate-500">Enter the Admin Password</p>
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Password"
            autoComplete="current-password"
          />
          {err && <p className="text-sm text-red-600">{err}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-violet-600 py-3 font-semibold text-white hover:bg-violet-700"
          >
            Sign in
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/"
            className="font-medium text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900"
          >
            ← Back to LocalLift home
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <p className="text-slate-600">Loading…</p>
        </main>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
