import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function InstallPage() {
  return (
    <>
      <AppHeader />
      <main className="ll-page max-w-2xl pb-16">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Install App
        </h1>

        <section className="mt-10">
          <div className="mt-4 space-y-5 text-sm text-slate-700">
            <div className="ll-card ll-card-pad">
              <p className="font-semibold text-slate-900">Android (Chrome)</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>Tap the 3 dots (top right)</li>
                <li>Tap "Install App" or "Add to Home screen"</li>
                <li>Tap Install</li>
              </ol>
            </div>
            <div className="ll-card ll-card-pad">
              <p className="font-semibold text-slate-900">iPhone (Safari)</p>
              <ol className="mt-2 list-decimal space-y-1.5 pl-5">
                <li>Tap the Share icon (bottom center)</li>
                <li>Scroll and tap "Add to Home Screen"</li>
                <li>Tap Add</li>
              </ol>
            </div>
          </div>
        </section>

        <p className="mt-10 text-sm text-slate-600">
          <Link href="/" className="font-medium text-teal-700 underline">
            ← Back to home
          </Link>
        </p>
      </main>
    </>
  );
}
