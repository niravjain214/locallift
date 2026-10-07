import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function PoliciesPage() {
  return (
    <>
      <AppHeader />
      <main className="ll-page max-w-3xl pb-16">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Policies & Terms
        </h1>

        <section className="ll-card ll-card-pad mt-6">
          <h2 className="text-lg font-semibold text-slate-900">1. PRIVACY POLICY</h2>
          <p className="mt-3 font-medium text-slate-800">PRIVACY POLICY — LOCALLIFT</p>
          <p className="mt-3 text-sm text-slate-700">We collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Name, phone, address (to connect renters and sellers)</li>
            <li>ID proof (for safety, stored securely)</li>
            <li>Rental history (to improve service)</li>
          </ul>
          <p className="mt-3 text-sm text-slate-700">We share:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Renter details with seller (for delivery only)</li>
            <li>Nothing with third parties for marketing</li>
          </ul>
          <p className="mt-3 text-sm text-slate-700">We keep:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Data until you ask us to delete</li>
            <li>Transaction records for 2 years (legal requirement)</li>
          </ul>
          <p className="mt-3 text-sm text-slate-700">
            Contact: <span className="font-medium">support@locallift.in</span> to access or
            delete your data.
          </p>
        </section>

        <section className="ll-card ll-card-pad mt-5">
          <h2 className="text-lg font-semibold text-slate-900">2. TERMS OF SERVICE</h2>
          <p className="mt-3 font-medium text-slate-800">TERMS — LOCALLIFT</p>
          <p className="mt-3 text-sm text-slate-700">
            LocalLift connects appliance owners with renters. We don't own items, we just
            facilitate.
          </p>
          <p className="mt-3 text-sm font-medium text-slate-800">Sellers:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>List accurate info, working items only</li>
            <li>Hand over clean, functional appliances</li>
            <li>Return security deposit within 5 days if no damage</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-slate-800">Renters:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Use items as intended, don't modify or repair</li>
            <li>Return on time, same condition (normal wear OK)</li>
            <li>Pay for damage caused by misuse</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-slate-800">Platform:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>15% commission on rentals</li>
            <li>Not responsible for item quality or disputes</li>
            <li>Can ban users for fraud or safety issues</li>
          </ul>
          <p className="mt-3 text-sm text-slate-700">
            Disputes: We mediate. Unresolved: Dehradun courts.
          </p>
        </section>

        <section className="ll-card ll-card-pad mt-5">
          <h2 className="text-lg font-semibold text-slate-900">3. DAMAGE POLICY</h2>
          <p className="mt-3 font-medium text-slate-800">DAMAGE — LOCALLIFT</p>
          <p className="mt-3 text-sm font-medium text-slate-800">Normal wear (free):</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Scratches, faded color, minor scuffs</li>
          </ul>
          <p className="mt-3 text-sm font-medium text-slate-800">You pay (from deposit):</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Cracks, dents, non-functionality</li>
            <li>Missing parts or accessories</li>
            <li>Part swapping (compressor, board) = full deposit</li>
          </ul>
          <p className="mt-3 text-sm text-slate-700">
            We inspect at return. Dispute? Photo evidence decides.
          </p>
          <p className="mt-2 text-sm text-slate-700">
            Repair cost guide: Fan ₹150-600, Cooler ₹300-1,200, AC ₹500-5,000
          </p>
        </section>

        <section className="ll-card ll-card-pad mt-5">
          <h2 className="text-lg font-semibold text-slate-900">4. RENTAL AGREEMENT</h2>
          <p className="mt-3 text-sm text-slate-700">
            By renting, you agree to: Use properly, don't modify, return on time, pay for
            damage.
          </p>
        </section>

        <section className="ll-card ll-card-pad mt-5">
          <h2 className="text-lg font-semibold text-slate-900">5. CANCELLATION</h2>
          <p className="mt-3 font-medium text-slate-800">CANCELLATION — LOCALLIFT</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Before delivery: Full refund</li>
            <li>After pickup: No rental refund, deposit back if item OK</li>
            <li>Late return: ₹50-200/day from deposit</li>
          </ul>
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

