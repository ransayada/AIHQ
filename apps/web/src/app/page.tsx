import Link from "next/link";
import { ArrowRight, Music, Cpu, Wand2, Layers } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)]">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-[var(--color-studio-700)] bg-[var(--color-studio-900)]/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <span className="text-[var(--color-accent-purple)]">AI</span>HQ
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="text-sm text-[var(--color-studio-200)] hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/sign-in" className="text-sm text-[var(--color-studio-200)] hover:text-white transition-colors">
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)] transition-colors"
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-studio-700)] border border-[var(--color-studio-500)] text-[var(--color-accent-cyan)] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-cyan)] animate-pulse" />
            Chromium-powered — no downloads required
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-tight mb-6">
            Music production,
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent-purple)] to-[var(--color-accent-cyan)]">
              supercharged by AI
            </span>
          </h1>

          <p className="text-xl text-[var(--color-studio-200)] max-w-2xl mx-auto mb-10">
            A full-featured DAW in your browser. Step sequencer, piano roll, mixer, synths —
            plus AI that generates drum patterns, melodies, and gives expert production advice.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)] transition-all hover:scale-105"
            >
              Start making music — free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-base font-semibold border border-[var(--color-studio-500)] text-[var(--color-studio-100)] hover:bg-[var(--color-studio-700)] transition-colors"
            >
              See pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Music,
                title: "Full DAW",
                description: "Step sequencer, piano roll, mixer, synths, effects — everything in the browser.",
                color: "var(--color-accent-cyan)",
              },
              {
                icon: Cpu,
                title: "AI Drum Generation",
                description: "Magenta.js runs in-browser to generate unique drum patterns on demand.",
                color: "var(--color-accent-purple)",
              },
              {
                icon: Wand2,
                title: "AI Melody Creation",
                description: "Seed a melody and let AI continue it in your key and style.",
                color: "var(--color-accent-green)",
              },
              {
                icon: Layers,
                title: "Claude AI Chat",
                description: "Ask an expert music producer anything — chord progressions, mixing, sound design.",
                color: "var(--color-accent-orange)",
              },
            ].map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="p-6 rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] hover:border-[var(--color-studio-400)] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${color}22` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-studio-200)] leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--color-studio-700)] py-8 px-6 text-center text-sm text-[var(--color-studio-300)]">
        © 2025 AIHQ — AI Music Production Platform
      </footer>
    </div>
  );
}
