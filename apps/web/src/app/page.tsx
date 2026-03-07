import Link from "next/link";
import {
  ArrowRight, Music2, Cpu, Wand2, Layers, Zap,
  Users, GitBranch, Share2, Mic, Piano, Sliders,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-[var(--color-studio-50)] overflow-x-hidden">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b border-[var(--color-studio-700)]">
        <div className="max-w-7xl mx-auto px-6 h-15 flex items-center justify-between" style={{ height: 60 }}>
          <Logo size="md" />

          <div className="hidden md:flex items-center gap-8 text-sm">
            {[
              { label: "Features", href: "#features" },
              { label: "Pricing",  href: "/pricing"  },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-[var(--color-studio-200)] hover:text-[var(--color-studio-50)] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/sign-in"
              className="text-sm text-[var(--color-studio-200)] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold gradient-border"
              style={{
                background: "linear-gradient(135deg, #6b3fcf, #9b6dff)",
                color: "white",
              }}
            >
              Get Started Free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 px-6 text-center overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(155,109,255,0.12) 0%, rgba(155,109,255,0.04) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute top-32 right-10 w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse, rgba(245,166,35,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Status badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8 border"
            style={{
              background: "rgba(155,109,255,0.08)",
              borderColor: "rgba(155,109,255,0.3)",
              color: "var(--color-accent-purple)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-purple)] animate-pulse" />
            AI-powered · Real-time collaboration · No downloads
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            The music studio
            <br />
            <span
              className="animate-gradient-x"
              style={{
                background: "linear-gradient(135deg, #c4a8ff, #9b6dff, #f5a623, #22d3ee, #9b6dff, #c4a8ff)",
                backgroundSize: "300% 300%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              that thinks with you
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[var(--color-studio-200)] max-w-2xl mx-auto mb-10 leading-relaxed">
            A full-featured DAW in your browser — step sequencer, piano roll, mixer, synths.
            Plus Claude AI that generates patterns, masters your tracks, and gives expert production advice.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 glow-purple"
              style={{ background: "linear-gradient(135deg, #6b3fcf 0%, #9b6dff 60%, #b58aff 100%)" }}
            >
              Start making music — free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold border border-[var(--color-studio-600)] text-[var(--color-studio-100)] hover:border-[var(--color-studio-400)] hover:bg-[var(--color-studio-800)] transition-all"
            >
              Open Studio
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-[var(--color-studio-300)]">
            {[
              { value: "10+", label: "AI features" },
              { value: "6",   label: "genre templates" },
              { value: "∞",   label: "creativity" },
            ].map(({ value, label }) => (
              <div key={label} className="flex items-baseline gap-1.5">
                <span className="font-bold text-[var(--color-studio-50)] text-lg">{value}</span>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ─────────────────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything a producer needs
            </h2>
            <p className="text-[var(--color-studio-200)] text-lg max-w-xl mx-auto">
              From first idea to mastered track — all in your browser, all in one place.
            </p>
          </div>

          {/* Primary feature cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
            {/* Big card — AI */}
            <div
              className="lg:col-span-2 p-8 rounded-2xl border border-[var(--color-studio-600)] relative overflow-hidden card-elevated group"
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 70% 50%, rgba(155,109,255,0.4) 0%, transparent 70%)",
                }}
              />
              <Cpu
                className="w-8 h-8 mb-5 relative"
                style={{ color: "var(--color-accent-purple)" }}
              />
              <h3 className="text-xl font-bold text-white mb-3 relative">Claude AI Integration</h3>
              <p className="text-[var(--color-studio-200)] leading-relaxed relative max-w-md">
                Chat with an expert music producer built on Claude. Generate drum patterns, compose melodies,
                get real-time mixing advice, and master your tracks with AI-optimised EQ and compression settings.
              </p>
              <div className="flex flex-wrap gap-2 mt-6 relative">
                {["Drum generation", "Melody AI", "AI mastering", "Production chat"].map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{
                      background: "rgba(155,109,255,0.15)",
                      color: "var(--color-accent-purple)",
                      border: "1px solid rgba(155,109,255,0.25)",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Tall card — collab */}
            <div className="p-8 rounded-2xl border border-[var(--color-studio-600)] relative overflow-hidden card-elevated">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  background: "radial-gradient(circle at 30% 60%, rgba(34,211,238,0.4) 0%, transparent 70%)",
                }}
              />
              <Users
                className="w-8 h-8 mb-5 relative"
                style={{ color: "var(--color-accent-cyan)" }}
              />
              <h3 className="text-xl font-bold text-white mb-3 relative">Real-time Collab</h3>
              <p className="text-[var(--color-studio-200)] leading-relaxed relative">
                Work together on the same project simultaneously via Yjs CRDT — your changes merge automatically,
                no conflicts.
              </p>
            </div>
          </div>

          {/* Secondary grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Music2, color: "var(--color-accent-cyan)",
                title: "Full DAW",
                desc: "Step sequencer, piano roll, mixer, 16-voice synths and FX chain.",
              },
              {
                icon: Piano, color: "var(--color-accent-purple)",
                title: "Piano Roll",
                desc: "Draw, drag and velocity-edit MIDI notes on a canvas-rendered roll.",
              },
              {
                icon: Sliders, color: "var(--color-accent-amber)",
                title: "DJ Deck",
                desc: "Two decks with crossfader, BPM sync, hot cues and low/mid/hi EQ.",
              },
              {
                icon: Mic, color: "var(--color-accent-green)",
                title: "Sample Library",
                desc: "Upload, search, preview and drag samples directly onto tracks.",
              },
              {
                icon: GitBranch, color: "var(--color-accent-orange)",
                title: "Version History",
                desc: "Snapshot your project at any point and restore previous states.",
              },
              {
                icon: Zap, color: "var(--color-accent-pink)",
                title: "Live Performance",
                desc: "8-pad fullscreen mode with keyboard and MIDI controller support.",
              },
              {
                icon: Layers, color: "var(--color-accent-cyan)",
                title: "Plugin Browser",
                desc: "8 built-in audio plugins — reverb, delay, distortion, chorus and more.",
              },
              {
                icon: Share2, color: "var(--color-accent-purple)",
                title: "Sharing & Embeds",
                desc: "Generate a public share link or embed your project anywhere.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] hover:border-[var(--color-studio-400)] hover:bg-[var(--color-studio-700)] transition-all group cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3.5 transition-transform group-hover:scale-110 duration-200"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color, width: 18, height: 18 }} />
                </div>
                <h3 className="font-semibold text-[var(--color-studio-50)] mb-1.5 text-sm">{title}</h3>
                <p className="text-xs text-[var(--color-studio-200)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="rounded-2xl p-12 relative overflow-hidden border border-[var(--color-studio-600)]"
            style={{
              background: "linear-gradient(135deg, rgba(107,63,207,0.2) 0%, rgba(18,15,13,0) 50%, rgba(245,166,35,0.1) 100%)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "radial-gradient(ellipse at 50% 0%, rgba(155,109,255,0.15) 0%, transparent 60%)",
              }}
            />
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 relative">
              Ready to make something great?
            </h2>
            <p className="text-[var(--color-studio-200)] mb-8 relative text-lg">
              Free forever for solo producers. Upgrade when you need more AI power.
            </p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl text-base font-semibold text-white transition-all hover:scale-105 relative glow-purple"
              style={{ background: "linear-gradient(135deg, #6b3fcf, #9b6dff)" }}
            >
              Create your free account
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-studio-700)] py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo size="sm" />
          <div className="flex items-center gap-6 text-sm text-[var(--color-studio-300)]">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/sign-in" className="hover:text-white transition-colors">Sign in</Link>
          </div>
          <p className="text-xs text-[var(--color-studio-400)]">
            © 2026 AIHQ — AI Music Production Platform
          </p>
        </div>
      </footer>
    </div>
  );
}
