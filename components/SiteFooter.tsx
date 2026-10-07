import Link from "next/link";
import { InstallAppButton } from "@/components/InstallAppButton";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-5 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold text-slate-900 dark:text-white">LocalLift</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Appliance rentals in Dehradun. Clear pricing, local partners,
              straightforward booking.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:max-w-md">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Rent
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/browse"
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                  >
                    Browse
                  </Link>
                </li>
                <li>
                  <Link
                    href="/track"
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                  >
                    Track booking
                  </Link>
                </li>
                <li>
                  <Link
                    href="/policies"
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                  >
                    Policies & Terms
                  </Link>
                </li>
                <li>
                  <InstallAppButton
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                    label="Install on phone"
                  />
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Partner
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/sell"
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                  >
                    List appliances
                  </Link>
                </li>
                <li>
                  <Link
                    href="/sell/start"
                    className="text-slate-700 hover:text-teal-700 dark:text-slate-300 dark:hover:text-[#E9B8C9]"
                  >
                    Partner sign-in
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          © {new Date().getFullYear()} LocalLift · Dehradun
        </p>
      </div>
    </footer>
  );
}
