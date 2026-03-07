"use client";
import { useState } from "react";
import { X, Download, Mic, Square, Loader2 } from "lucide-react";
import { StemExporter, audioEngine, type ExportProgress } from "@aihq/audio-engine";

interface ExportDialogProps {
  onClose: () => void;
}

export function ExportDialog({ onClose }: ExportDialogProps) {
  const [exporter] = useState(() => new StemExporter((p) => setProgress(p)));
  const [progress, setProgress]   = useState<ExportProgress>({ state: "idle", duration: 0, message: "" });
  const [projectName, setProjectName] = useState("My Project");

  async function handleStartRecord() {
    try {
      if (!audioEngine.isInitialized) await audioEngine.initialize();
      // Get AudioContext via the audio engine's transport
      const ctx = (audioEngine.transport as unknown as { getAudioContext?: () => AudioContext }).getAudioContext?.();
      if (ctx) {
        await exporter.start(ctx);
      } else {
        // Fallback: create a new AudioContext for recording
        const fallbackCtx = new AudioContext();
        await exporter.start(fallbackCtx);
      }
      audioEngine.transport.play();
    } catch (err) {
      setProgress({ state: "error", duration: 0, message: `Failed to start: ${String(err)}` });
    }
  }

  async function handleStop() {
    audioEngine.transport.stop();
    const blob = await exporter.stop();
    const ext  = blob.type.includes("ogg") ? "ogg" : "webm";
    StemExporter.download(blob, `${projectName || "export"}.${ext}`);
  }

  function handleCancel() {
    exporter.cancel();
    audioEngine.transport.stop();
    onClose();
  }

  const isRecording  = progress.state === "recording";
  const isProcessing = progress.state === "processing";
  const isDone       = progress.state === "done";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-[var(--color-accent-cyan)]" />
            Export Audio
          </h2>
          <button onClick={handleCancel} className="p-1 rounded text-[var(--color-studio-400)] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File name */}
        <label className="block text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1.5">
          File name
        </label>
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-900)] px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--color-accent-cyan)] mb-4"
        />

        {/* Info */}
        <div className="rounded-lg bg-[var(--color-studio-900)] border border-[var(--color-studio-700)] p-3 mb-4 text-xs text-[var(--color-studio-300)] space-y-1">
          <p>Format: WebM/Opus (supported in all modern browsers)</p>
          <p>How it works: Press Record, play your project, then press Stop to download the captured audio.</p>
        </div>

        {/* Progress */}
        {progress.message && (
          <div className={`rounded-lg p-3 mb-4 text-xs font-medium ${
            progress.state === "error" ? "bg-red-900/40 text-red-300" :
            progress.state === "done"  ? "bg-green-900/40 text-green-300" :
            "bg-[var(--color-accent-purple-dim)] text-[var(--color-accent-purple)]"
          }`}>
            {progress.message}
            {isRecording && <span className="ml-2 opacity-70">({progress.duration.toFixed(1)}s)</span>}
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-3">
          {!isRecording && !isProcessing && !isDone && (
            <button
              onClick={handleStartRecord}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
            >
              <Mic className="w-4 h-4" />
              Record
            </button>
          )}

          {isRecording && (
            <button
              onClick={handleStop}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[var(--color-accent-cyan)] text-[var(--color-studio-900)] text-sm font-bold transition-colors animate-pulse"
            >
              <Square className="w-4 h-4" />
              Stop &amp; Download
            </button>
          )}

          {isProcessing && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[var(--color-studio-400)] text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </div>
          )}

          {isDone && (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              Done
            </button>
          )}

          <button
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-studio-600)] text-[var(--color-studio-300)] hover:text-white text-sm transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
