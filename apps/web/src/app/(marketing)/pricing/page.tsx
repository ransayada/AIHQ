import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: null,
    description: "For hobbyists and beginners",
    cta: "Get started",
    ctaHref: "/sign-up",
    highlighted: false,
    features: [
      "3 projects",
      "100MB sample storage",
      "Step sequencer + Piano roll",
      "Synths & effects",
      "Export to WAV",
    ],
    missing: ["Cloud save", "AI generation", "Claude chat"],
  },
  {
    name: "Pro",
    price: 12,
    period: "month",
    description: "For serious producers",
    cta: "Start Pro",
    ctaHref: "/sign-up?plan=pro",
    highlighted: true,
    features: [
      "Unlimited projects",
      "5GB sample storage",
      "Cloud save & sync",
      "50 AI generations/month",
      "Claude AI chat",
      "Advanced effects",
      "MIDI export",
    ],
    missing: ["Collaboration"],
  },
  {
    name: "Studio",
    price: 29,
    period: "month",
    description: "For professionals & studios",
    cta: "Start Studio",
    ctaHref: "/sign-up?plan=studio",
    highlighted: false,
    features: [
      "Everything in Pro",
      "50GB sample storage",
      "Unlimited AI generations",
      "Collaboration (coming soon)",
      "Priority support",
      "API access",
    ],
    missing: [],
  },
] as const;

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)] py-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back link */}
        <Link href="/" className="text-sm text-[var(--color-studio-300)] hover:text-white mb-12 inline-block">
          ← Back to AIHQ
        </Link>

        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-[var(--color-studio-200)] text-lg">
            Start free. Upgrade when you need more AI power or storage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 border ${
                plan.highlighted
                  ? "border-[var(--color-accent-purple)] bg-[var(--color-studio-700)]"
                  : "border-[var(--color-studio-600)] bg-[var(--color-studio-800)]"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-accent-purple)] text-white">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
                <p className="text-sm text-[var(--color-studio-200)] mb-4">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.price === 0 ? "Free" : `$${plan.price}`}
                  </span>
                  {plan.period && (
                    <span className="text-[var(--color-studio-300)] text-sm">/{plan.period}</span>
                  )}
                </div>
              </div>

              <Link
                href={plan.ctaHref}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-semibold mb-6 transition-all hover:scale-105 ${
                  plan.highlighted
                    ? "bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)]"
                    : "bg-[var(--color-studio-600)] text-white hover:bg-[var(--color-studio-500)] border border-[var(--color-studio-500)]"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-[var(--color-accent-green)] flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
