"use client";
import { useEffect, useRef, useState } from "react";
import { useSamplesStore } from "@/stores/samplesStore";
import { Upload, Trash2, Play, Pause, Loader2, Music2, Search } from "lucide-react";

export function SampleBrowser() {
  const { samples, loading, uploading, fetchSamples, uploadSample, deleteSample, previewSample } =
    useSamplesStore();
  const [search, setSearch]       = useState("");
  const [playing, setPlaying]     = useState<string | null>(null);
  const fileInputRef              = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchSamples(); }, [fetchSamples]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadSample(file);
    e.target.value = "";
  }

  function handlePlay(id: string) {
    previewSample(id);
    setPlaying((prev) => (prev === id ? null : id));
  }

  const filtered = samples.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[var(--color-studio-900)] text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-studio-700)]">
        <Music2 className="w-4 h-4 text-[var(--color-accent-cyan)]" />
        <span className="text-sm font-semibold flex-1">Sample Library</span>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={handleUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-accent-cyan)] text-[var(--color-studio-900)] text-[11px] font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          Upload
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-[var(--color-studio-700)]">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-studio-800)] border border-[var(--color-studio-600)] px-2">
          <Search className="w-3.5 h-3.5 text-[var(--color-studio-400)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search samples…"
            className="flex-1 bg-transparent py-1.5 text-xs text-white placeholder-[var(--color-studio-500)] focus:outline-none"
          />
        </div>
      </div>

      {/* Sample list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-studio-500)]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-studio-400)] text-xs px-4">
            {samples.length === 0
              ? "No samples yet. Upload audio files to build your library."
              : "No samples match your search."}
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-studio-700)]">
            {filtered.map((sample) => (
              <li
                key={sample.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--color-studio-800)] group transition-colors cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData("application/aihq-sample", sample.id);
                  e.dataTransfer.setData("text/plain", sample.name);
                }}
              >
                {/* Play button */}
                <button
                  onClick={() => handlePlay(sample.id)}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-[var(--color-studio-700)] text-[var(--color-accent-cyan)] hover:bg-[var(--color-studio-600)] flex-shrink-0"
                >
                  {playing === sample.id
                    ? <Pause className="w-2.5 h-2.5" />
                    : <Play className="w-2.5 h-2.5" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{sample.name}</p>
                  <p className="text-[10px] text-[var(--color-studio-400)]">
                    {(sample.fileSize / 1024).toFixed(0)} KB
                    {sample.duration ? ` · ${sample.duration.toFixed(1)}s` : ""}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={() => deleteSample(sample.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-studio-400)] hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-center text-[9px] text-[var(--color-studio-600)] py-1">
        Drag samples onto tracks to use them
      </p>
    </div>
  );
}
