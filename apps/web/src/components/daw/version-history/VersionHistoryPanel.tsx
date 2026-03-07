"use client";
import { useEffect, useState } from "react";
import { useVersionStore } from "@/stores/versionStore";
import { useTracksStore } from "@/stores/tracksStore";
import type { Track } from "@aihq/shared";
import { useTransportStore } from "@/stores/transportStore";
import { RotateCcw, Save, Trash2, Clock, Loader2 } from "lucide-react";

interface VersionHistoryPanelProps {
  projectId: string;
}

export function VersionHistoryPanel({ projectId }: VersionHistoryPanelProps) {
  const { snapshots, loading, saving, fetchSnapshots, saveSnapshot, restoreSnapshot, deleteSnapshot } =
    useVersionStore();
  const [saveName, setSaveName] = useState("");
  const [restoring, setRestoring] = useState<string | null>(null);

  useEffect(() => {
    fetchSnapshots(projectId);
  }, [projectId, fetchSnapshots]);

  async function handleSave() {
    const tracks    = useTracksStore.getState().tracks;
    const transport = useTransportStore.getState();
    const name      = saveName.trim() || `Snapshot ${new Date().toLocaleTimeString()}`;
    await saveSnapshot(projectId, name, { tracks, bpm: transport.bpm });
    setSaveName("");
  }

  async function handleRestore(snapshotId: string) {
    setRestoring(snapshotId);
    const state = await restoreSnapshot(projectId, snapshotId);
    if (state && typeof state === "object") {
      const s = state as { tracks?: unknown[]; bpm?: number };
      if (Array.isArray(s.tracks)) {
        useTracksStore.getState().loadTracks(s.tracks as Track[]);
      }
      if (s.bpm) useTransportStore.getState().setBpm(s.bpm);
    }
    setRestoring(null);
  }

  return (
    <div className="flex flex-col h-full bg-[var(--color-studio-900)] text-white">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-studio-700)]">
        <Clock className="w-4 h-4 text-[var(--color-accent-purple)]" />
        <span className="text-sm font-semibold">Version History</span>
      </div>

      {/* Save new snapshot */}
      <div className="flex gap-2 p-3 border-b border-[var(--color-studio-700)]">
        <input
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Snapshot name…"
          className="flex-1 min-w-0 rounded-lg bg-[var(--color-studio-800)] border border-[var(--color-studio-600)] px-2 py-1.5 text-xs text-white placeholder-[var(--color-studio-500)] focus:outline-none focus:border-[var(--color-accent-purple)]"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-accent-purple)] text-white text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </div>

      {/* Snapshots list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-studio-500)]" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="text-center py-8 text-[var(--color-studio-400)] text-xs">
            No snapshots saved yet.<br />Save one to track your progress.
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-studio-700)]">
            {snapshots.map((snap) => (
              <li key={snap.id} className="flex items-center gap-2 px-3 py-2.5 hover:bg-[var(--color-studio-800)] group transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">{snap.name}</p>
                  <p className="text-[10px] text-[var(--color-studio-400)]">
                    {new Date(snap.createdAt).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleRestore(snap.id)}
                  disabled={restoring === snap.id}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded bg-[var(--color-studio-700)] text-[var(--color-accent-purple)] hover:bg-[var(--color-studio-600)] text-[10px] font-medium transition-all"
                  title="Restore this snapshot"
                >
                  {restoring === snap.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                  Restore
                </button>

                <button
                  onClick={() => deleteSnapshot(projectId, snap.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-studio-400)] hover:text-red-400 transition-all"
                  title="Delete snapshot"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
