"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isSignedIn } = useAuthStore();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  useEffect(() => {
    if (isSignedIn) router.replace("/dashboard");
  }, [isSignedIn, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn(email.trim(), password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1 font-bold text-2xl mb-2">
            <span className="text-[var(--color-accent-purple)]">AI</span>HQ
          </div>
          <h1 className="text-xl font-semibold text-white">Sign in to your account</h1>
          <p className="text-sm text-[var(--color-studio-300)] mt-1">Welcome back, producer.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              placeholder="you@example.com"
              data-testid="sign-in-email"
              className="w-full rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] px-3 py-2.5 text-sm text-white placeholder-[var(--color-studio-500)] focus:outline-none focus:border-[var(--color-accent-purple)] transition-colors disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder="••••••••"
                data-testid="sign-in-password"
                className="w-full rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] px-3 py-2.5 pr-10 text-sm text-white placeholder-[var(--color-studio-500)] focus:outline-none focus:border-[var(--color-accent-purple)] transition-colors disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-studio-400)] hover:text-white transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            data-testid="sign-in-submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-accent-purple)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-studio-300)] mt-6">
          No account?{" "}
          <Link href="/sign-up" className="text-[var(--color-accent-purple)] hover:opacity-80 font-medium">
            Create one free
          </Link>
        </p>

        <button
          type="button"
          data-testid="dev-skip"
          onClick={() => {
            void signIn("dev@aihq.local", "devpass").then(() => router.push("/dashboard"));
          }}
          className="mt-4 w-full text-center text-xs text-[var(--color-studio-500)] hover:text-[var(--color-studio-300)] transition-colors"
        >
          Dev mode: skip sign-in →
        </button>
      </div>
    </div>
  );
}
