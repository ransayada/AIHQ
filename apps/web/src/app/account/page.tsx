"use client";

import Link from "next/link";
import { Avatar } from "@aihq/ui";
import { useAuthStore } from "@/stores/authStore";

const DEV_USER = {
  firstName: "Dev User", lastName: "Producer",
  email: "dev@aihq.local", plan: "Free",
  aiGenerationsUsed: 0, aiGenerationsLimit: 50,
  storageUsedGb: 0, storageLimitGb: 5, timezone: "UTC",
};

export default function AccountPage() {
  const storeUser = useAuthStore((s) => s.user);
  const user = storeUser
    ? {
        firstName: storeUser.firstName, lastName: storeUser.lastName,
        email: storeUser.email, plan: storeUser.plan,
        aiGenerationsUsed: 0, aiGenerationsLimit: 50,
        storageUsedGb: 0, storageLimitGb: 5,
        timezone: storeUser.timezone,
      }
    : DEV_USER;

  const aiUsagePercent = Math.min(
    100,
    Math.round((user.aiGenerationsUsed / user.aiGenerationsLimit) * 100)
  );
  const storagePercent = Math.min(
    100,
    Math.round((user.storageUsedGb / user.storageLimitGb) * 100)
  );

  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)]">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account</h1>
            <p className="text-sm text-[var(--color-studio-300)] mt-1">
              Manage your profile, plan, and usage.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--color-studio-300)] hover:text-white transition-colors"
          >
            ← Back to dashboard
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,2fr)] gap-6">
          {/* Profile card */}
          <section className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-5">
            <div className="flex items-center gap-4 mb-4">
              <Avatar
                name={`${user.firstName} ${user.lastName}`}
                email={user.email}
                size="lg"
                showStatus
                status="online"
              />
              <div className="flex flex-col">
                <span className="text-base font-semibold">
                  {user.firstName} {user.lastName}
                </span>
                <span className="text-sm text-[var(--color-studio-300)]">{user.email}</span>
                <span className="mt-1 text-[11px] uppercase tracking-widest text-[var(--color-studio-400)]">
                  {user.plan} plan
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[var(--color-studio-400)] mb-0.5">
                  Display name
                </dt>
                <dd className="text-[var(--color-studio-100)]">
                  {user.firstName} {user.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-widest text-[var(--color-studio-400)] mb-0.5">
                  Timezone
                </dt>
                <dd className="text-[var(--color-studio-100)]">{user.timezone}</dd>
              </div>
            </dl>
          </section>

          {/* Plan card */}
          <section className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-semibold text-white">Subscription</h2>
                <p className="text-xs text-[var(--color-studio-300)]">
                  Change your plan or billing details.
                </p>
              </div>
              <span
                className="text-xs px-3 py-1 rounded border border-[var(--color-studio-500)] text-[var(--color-studio-400)] cursor-default"
                title="Plans coming soon"
              >
                Beta (Free)
              </span>
            </div>
            <div className="mt-2">
              <div className="text-sm font-semibold text-white mb-1">{user.plan}</div>
              <p className="text-xs text-[var(--color-studio-300)]">
                Pro includes priority support, AI generations, and expanded storage.
              </p>
            </div>
          </section>
        </div>

        {/* Usage cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-5">
            <h2 className="text-sm font-semibold text-white mb-1">AI generations</h2>
            <p className="text-xs text-[var(--color-studio-300)] mb-3">
              Track how much AI you&apos;ve used this billing period.
            </p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {user.aiGenerationsUsed}/{user.aiGenerationsLimit}
              </span>
              <span className="text-[11px] text-[var(--color-studio-400)]">
                {aiUsagePercent}% used
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-studio-700)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-purple)]"
                style={{ width: `${aiUsagePercent}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-5">
            <h2 className="text-sm font-semibold text-white mb-1">Storage</h2>
            <p className="text-xs text-[var(--color-studio-300)] mb-3">
              Samples and projects stored in the cloud.
            </p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {user.storageUsedGb}GB / {user.storageLimitGb}GB
              </span>
              <span className="text-[11px] text-[var(--color-studio-400)]">
                {storagePercent}% used
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-studio-700)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-cyan)]"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

