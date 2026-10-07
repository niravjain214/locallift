"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/appliances", label: "Appliances" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/financials", label: "Financials" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row">
      <aside className="shrink-0 border-b border-violet-900/30 bg-violet-950 text-white md:w-56 md:border-b-0 md:border-r">
        <div className="px-4 py-5 md:sticky md:top-0 md:max-h-screen md:overflow-y-auto">
          <p className="text-lg font-bold tracking-tight text-violet-100">
            LocalLift
          </p>
          <p className="text-xs text-violet-400">Admin</p>
          <nav className="mt-4 flex gap-1 overflow-x-auto pb-1 md:mt-6 md:flex-col md:overflow-visible md:pb-0">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`shrink-0 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap md:whitespace-normal ${
                  pathname === l.href
                    ? "bg-violet-800 font-medium text-white"
                    : "text-violet-200 hover:bg-violet-900 hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <a
            href="/api/admin/logout"
            className="mt-6 inline-block text-sm text-violet-400 underline underline-offset-2 hover:text-white"
          >
            Log out
          </a>
          <Link
            href="/"
            className="mt-3 block text-sm text-violet-400 underline underline-offset-2 hover:text-white"
          >
            ← LocalLift home
          </Link>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
}
