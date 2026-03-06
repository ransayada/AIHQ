"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Play, Square, Music, Loader2, AlertCircle } from "lucide-react";

interface ShareData {
  name:      string;
  bpm:       number;
  key:       string;
  scale:     string;
  stateJson: unknown;
  createdAt: string;
}

export default function SharePage() {
  const { token }                  = useParams<{ token: string }>();
  const [data,    setData]         = useState<ShareData | null>(null);
  const [loading, setLoading]      = useState(true);
  const [error,   setError]        = useState<string | null>(null);
  const [playing, setPlaying]      = useState(false);
  const [copied,  setCopied]       = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/share/${token}`);
        if (!res.ok) throw new Error(res.status === 404 ? "Share link not found or expired." : `HTTP ${res.status}`);
        const body = await res.json() as { data: ShareData };
        setData(body.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load shared project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handlePlay() {
    const { audioEngine } = await import("@aihq/audio-engine");
    if (!audioEngine.isInitialized) await audioEngine.initialize();
    if (playing) {
      audioEngine.transport.stop();
      setPlaying(false);
    } else {
      audioEngine.transport.play();
      setPlaying(true);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-studio-900)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-studio-400)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-studio-900)] flex flex-col items-center justify-center gap-4 text-white">
        <AlertCircle className="w-10 h-10 text-red-400" />
        <p className="text-lg font-semibold">{error}</p>
        <Link href="/" className="text-[var(--color-accent-purple)] hover:underline text-sm">
          Go to AIHQ
        </Link>
      </div>
    );
  }

  if (!data) return null;

  const state = data.stateJson as { tracks?: Array<{ name: string; type: string; color?: string }> } | null;
  const tracks = state?.tracks ?? [];

  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-white">
      {/* Nav */}
      <nav className="border-b border-[var(--color-studio-700)] px-6 h-14 flex items-center justify-between">
        <div className="font-bold tracking-tight">
          <span className="text-[var(--color-accent-purple)]">AI</span>HQ
        </div>
        <Link
          href="/dashboard"
          className="text-sm px-3 py-1.5 rounded-lg bg-[var(--color-accent-purple)] text-white hover:opacity-90 transition-opacity"
        >
          Open in Studio
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Project header */}
        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-accent-purple-dim)] to-[var(--color-studio-700)] flex items-center justify-center flex-shrink-0">
            <Music className="w-8 h-8 text-[var(--color-accent-purple)]" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">{data.name}</h1>
            <div className="flex items-center gap-3 text-[var(--color-studio-300)] text-sm">
              <span>{data.bpm} BPM</span>
              <span>·</span>
              <span>{data.key} {data.scale}</span>
              <span>·</span>
              <span>{tracks.length} tracks</span>
            </div>
          </div>
        </div>

        {/* Player */}
        <div className="rounded-2xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[var(--color-studio-200)]">Playback</span>
            <span className="text-[11px] text-[var(--color-studio-500)]">
              Shared {new Date(data.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Waveform placeholder — scrolls when playing */}
          <div className="h-12 rounded-lg bg-[var(--color-studio-900)] flex items-center mb-4 overflow-hidden">
            <div className={`flex items-center gap-1 px-4 ${playing ? "animate-waveform-scroll" : ""}`} style={{ width: playing ? "200%" : undefined }}>
              {Array.from({ length: playing ? 120 : 60 }, (_, i) => {
                const h = 20 + Math.sin((i % 60) * 0.7) * 14 + Math.sin((i % 60) * 2.3) * 6;
                return (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-sm transition-colors duration-300"
                    style={{
                      width: 3,
                      height: Math.max(4, h),
                      background: playing ? "var(--color-accent-purple)" : "var(--color-studio-600)",
                      opacity: playing ? 0.8 + Math.sin((i % 60) * 0.4) * 0.2 : 0.5,
                    }}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={handlePlay}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
              playing
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-[var(--color-accent-purple)] hover:opacity-90 text-white"
            }`}
          >
            {playing ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? "Stop" : "Preview"}
          </button>
        </div>

        {/* Track list */}
        {tracks.length > 0 && (
          <div className="rounded-2xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-5 mb-6">
            <p className="text-[11px] font-semibold text-[var(--color-studio-300)] uppercase tracking-widest mb-3">Tracks</p>
            <ul className="space-y-2">
              {tracks.map((t, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: t.color ?? "var(--color-accent-purple)" }}
                  />
                  <span className="text-sm text-[var(--color-studio-100)]">{t.name}</span>
                  <span className="text-[10px] text-[var(--color-studio-500)] uppercase tracking-wide ml-auto">
                    {t.type}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Share / CTA */}
        <div className="flex gap-3">
          <button
            onClick={copyLink}
            className="flex-1 py-2.5 rounded-xl border border-[var(--color-studio-600)] text-[var(--color-studio-200)] hover:text-white hover:border-[var(--color-studio-400)] text-sm transition-colors"
          >
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <a
            href="/dashboard"
            className="flex-1 py-2.5 text-center rounded-xl bg-[var(--color-accent-purple)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Create Your Project
          </a>
        </div>
      </div>
    </div>
  );
}
