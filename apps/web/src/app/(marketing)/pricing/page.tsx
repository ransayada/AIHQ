import Link from "next/link";
import { Clock } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)] flex flex-col items-center justify-center px-6">
      <Link href="/" className="text-sm text-[var(--color-studio-300)] hover:text-white mb-12 inline-block self-start max-w-5xl w-full mx-auto">
        ← Back to AIHQ
      </Link>

      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-studio-700)] border border-[var(--color-studio-600)] flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8 text-[var(--color-accent-purple)]" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Pricing — Coming Soon</h1>
        <p className="text-[var(--color-studio-200)] text-base leading-relaxed mb-8">
          AIHQ is currently in open beta — fully free for all users. Paid plans are being
          finalized and will launch soon. Stay tuned.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-accent-purple)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
