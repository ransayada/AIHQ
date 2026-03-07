"use client";
import { useState } from "react";
import { Sparkles, Loader2, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { useTransportStore } from "@/stores/transportStore";
import { useTracksStore } from "@/stores/tracksStore";
import { log } from "@/lib/logger";

interface MasteringSuggestion {
  eqLow:       number;
  eqMid:       number;
  eqHigh:      number;
  compression: { threshold: number; ratio: number; attack: number; release: number };
  loudness:    string;
  tips:        string[];
}

function parseAISuggestion(text: string): MasteringSuggestion {
  // Extract JSON block from AI response if present
  const jsonMatch = text.match(/```json\s*([\s\S]+?)\s*```/) ?? text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] ?? jsonMatch[0]) as MasteringSuggestion;
    } catch { /* fall through */ }
  }
  return {
    eqLow: 0, eqMid: 0, eqHigh: 1,
    compression: { threshold: -18, ratio: 4, attack: 10, release: 200 },
    loudness: "-14 LUFS",
    tips: [text],
  };
}

export function MasteringPanel() {
  const [loading,    setLoading]    = useState(false);
  const [suggestion, setSuggestion] = useState<MasteringSuggestion | null>(null);
  const [rawText,    setRawText]    = useState("");
  const [showTips,   setShowTips]   = useState(true);

  async function handleMaster() {
    const { bpm } = useTransportStore.getState();
    const tracks  = useTracksStore.getState().tracks;
    const genre   = "general";

    setLoading(true);
    log.info("MasteringPanel: requesting AI mastering analysis");

    try {
      const res = await fetch("/api/ai/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `You are a professional audio mastering engineer. Analyze this project and provide mastering settings.

Project: ${tracks.length} tracks, ${bpm} BPM, genre: ${genre}
Tracks: ${tracks.map((t) => t.name).join(", ")}

Respond with ONLY a JSON object in this exact format (no extra text):
\`\`\`json
{
  "eqLow": <number -6 to 3>,
  "eqMid": <number -3 to 2>,
  "eqHigh": <number 0 to 3>,
  "compression": { "threshold": <number -24 to -6>, "ratio": <number 2 to 8>, "attack": <ms 5-30>, "release": <ms 100-400> },
  "loudness": "<target LUFS like -14 LUFS>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
\`\`\``,
          }],
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { error?: { message?: string } };
        throw new Error(err.error?.message ?? `HTTP ${res.status}`);
      }
      if (!res.body) throw new Error("No response body");

      // Read the streaming response (same as ChatInterface)
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let   text    = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
      }
      setRawText(text);
      const parsed = parseAISuggestion(text);
      setSuggestion(parsed);
      log.info("MasteringPanel: AI analysis complete", { parsed });
    } catch (err) {
      log.error("MasteringPanel: AI analysis failed", { error: String(err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-studio-900)] text-white text-xs overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-studio-700)]">
        <Sparkles className="w-4 h-4 text-[var(--color-accent-purple)]" />
        <span className="text-sm font-semibold flex-1">AI Mastering</span>
      </div>

      <div className="p-4 space-y-4">
        {/* Description */}
        <p className="text-[var(--color-studio-300)]">
          Analyzes your project and suggests professional mastering settings for EQ, compression, and loudness targeting.
        </p>

        {/* Analyze button */}
        <button
          onClick={handleMaster}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-purple)] to-[#4f46e5] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Analyzing…" : "Analyze & Master"}
        </button>

        {/* Results */}
        {suggestion && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              Mastering settings ready
            </div>

            {/* EQ */}
            <div className="rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-3 space-y-2">
              <p className="text-[10px] text-[var(--color-studio-400)] uppercase tracking-widest font-medium">Master EQ</p>
              {[
                { label: "Low",  value: suggestion.eqLow },
                { label: "Mid",  value: suggestion.eqMid },
                { label: "High", value: suggestion.eqHigh },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="w-8 text-[var(--color-studio-300)]">{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-[var(--color-studio-700)] relative">
                    <div
                      className="absolute h-full rounded-full bg-[var(--color-accent-purple)]"
                      style={{ width: `${50 + (value / 6) * 50}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-[var(--color-studio-200)] font-mono">
                    {value >= 0 ? "+" : ""}{value.toFixed(1)}dB
                  </span>
                </div>
              ))}
            </div>

            {/* Compression */}
            <div className="rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-3 space-y-1.5">
              <p className="text-[10px] text-[var(--color-studio-400)] uppercase tracking-widest font-medium">Master Compressor</p>
              {Object.entries(suggestion.compression).map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-[var(--color-studio-300)] capitalize">{k}</span>
                  <span className="text-[var(--color-studio-100)] font-mono">
                    {k === "ratio" ? `${v}:1` : k === "threshold" ? `${v}dB` : `${v}ms`}
                  </span>
                </div>
              ))}
            </div>

            {/* Loudness */}
            <div className="flex items-center justify-between rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] px-3 py-2">
              <span className="text-[var(--color-studio-300)]">Target Loudness</span>
              <span className="font-mono font-semibold text-[var(--color-accent-cyan)]">{suggestion.loudness}</span>
            </div>

            {/* Tips */}
            {suggestion.tips.length > 0 && (
              <div className="rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] overflow-hidden">
                <button
                  onClick={() => setShowTips((v) => !v)}
                  className="flex items-center justify-between w-full px-3 py-2 hover:bg-[var(--color-studio-700)] transition-colors"
                >
                  <span className="text-[10px] text-[var(--color-studio-400)] uppercase tracking-widest font-medium">
                    Mixing Tips ({suggestion.tips.length})
                  </span>
                  {showTips ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {showTips && (
                  <ul className="px-3 pb-3 space-y-1.5">
                    {suggestion.tips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-[var(--color-studio-200)]">
                        <span className="text-[var(--color-accent-purple)] flex-shrink-0">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}

        {!suggestion && !loading && (
          <div className="rounded-lg bg-[var(--color-studio-800)] border border-[var(--color-studio-700)] p-3 text-[var(--color-studio-400)] text-center">
            Click Analyze to get AI-powered mastering suggestions based on your current project.
          </div>
        )}
      </div>
    </div>
  );
}
