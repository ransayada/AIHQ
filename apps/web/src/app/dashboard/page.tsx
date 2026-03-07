"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Music, Clock, Trash2, Loader2, X, Check, Pencil } from "lucide-react";
import { UserMenu } from "@/components/layout/UserMenu";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { TemplateSelector } from "@/components/daw/templates/TemplateSelector";
import { useAuthStore } from "@/stores/authStore";

type Project = {
  id: string;
  name: string;
  bpm: number;
  key?: string;
  scale?: string;
  updatedAt: string;
  lastOpenedAt?: string;
};

type AIUsage = {
  used: number;
  limit: number;
  resetAt: string | null;
};

// ── Create project modal ──────────────────────────────────────────────────────
function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, templateId: string | null) => Promise<void>;
}) {
  const [name,       setName]       = useState("Untitled Project");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading,    setLoading]    = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.select(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    await onCreate(name.trim(), templateId);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-white">New Project</h2>
          <button onClick={onClose} className="p-1 rounded text-[var(--color-studio-400)] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1.5">
            Project Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="w-full rounded-lg border border-[var(--color-studio-600)] bg-[var(--color-studio-900)] px-3 py-2 text-sm text-white placeholder-[var(--color-studio-500)] focus:outline-none focus:border-[var(--color-accent-purple)] transition-colors mb-5"
            placeholder="My Project"
            disabled={loading}
          />

          <TemplateSelector selected={templateId} onChange={setTemplateId} />

          <div className="flex gap-3 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-[var(--color-studio-600)] py-2 text-sm text-[var(--color-studio-300)] hover:text-white hover:border-[var(--color-studio-400)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[var(--color-accent-purple)] py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Inline rename input ───────────────────────────────────────────────────────
function RenameInput({
  initial,
  onSave,
  onCancel,
}: {
  initial: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.select();
  }, []);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); if (value.trim()) onSave(value.trim()); }
    if (e.key === "Escape") onCancel();
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        maxLength={100}
        className="flex-1 min-w-0 rounded bg-[var(--color-studio-900)] border border-[var(--color-accent-purple)] px-1.5 py-0.5 text-xs text-white focus:outline-none"
      />
      <button
        onClick={() => value.trim() && onSave(value.trim())}
        className="p-0.5 rounded text-green-400 hover:text-green-300 transition-colors"
      >
        <Check className="w-3 h-3" />
      </button>
      <button
        onClick={onCancel}
        className="p-0.5 rounded text-[var(--color-studio-400)] hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ── Deterministic gradient from project data ─────────────────────────────────
const GRADIENT_PAIRS = [
  ["#7c4dff", "#00d4ff"], // purple → cyan
  ["#f50057", "#ff6d00"], // pink → orange
  ["#00e676", "#00d4ff"], // green → cyan
  ["#ff6d00", "#ffea00"], // orange → yellow
  ["#7c4dff", "#f50057"], // purple → pink
  ["#00d4ff", "#00e676"], // cyan → green
  ["#ff1744", "#7c4dff"], // red → purple
  ["#ffea00", "#00e676"], // yellow → green
] as const;

function projectGradient(name: string, bpm: number): [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  h = (h + bpm * 7) >>> 0;
  return (GRADIENT_PAIRS[h % GRADIENT_PAIRS.length] ?? GRADIENT_PAIRS[0]) as [string, string];
}

// ── Project card ──────────────────────────────────────────────────────────────
function ProjectCard({
  project,
  onDelete,
  onRename,
}: {
  project: Project;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
}) {
  const router = useRouter();
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="group relative flex flex-col h-36 rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] hover:border-[var(--color-studio-400)] hover:bg-[var(--color-studio-700)] transition-all overflow-hidden cursor-pointer"
      onClick={() => !renaming && router.push(`/studio/${project.id}`)}
    >
      {/* Color preview */}
      {(() => {
        const [from, to] = projectGradient(project.name, project.bpm);
        return (
          <div
            className="h-16 flex items-center justify-center flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${from}55 0%, ${to}33 100%)` }}
          >
            <Music className="w-8 h-8 opacity-60" style={{ color: from }} />
          </div>
        );
      })()}

      {/* Card body */}
      <div className="p-3 flex flex-col flex-1 min-h-0">
        {renaming ? (
          <RenameInput
            initial={project.name}
            onSave={(name) => { setRenaming(false); onRename(project.id, name); }}
            onCancel={() => setRenaming(false)}
          />
        ) : (
          <div className="flex items-center gap-1">
            <p className="font-medium text-sm text-white truncate flex-1">{project.name}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setRenaming(true); }}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-[var(--color-studio-400)] hover:text-white transition-all flex-shrink-0"
              title="Rename"
            >
              <Pencil className="w-3 h-3" />
            </button>
          </div>
        )}

        <div className="flex items-center gap-1 mt-auto text-[var(--color-studio-400)] text-[10px]">
          <Clock className="w-2.5 h-2.5 flex-shrink-0" />
          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          <span className="ml-auto daw-readout flex-shrink-0">{project.bpm} BPM</span>
        </div>
      </div>

      {/* Delete button */}
      {confirmDelete ? (
        <div
          className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-white font-medium">Delete project?</p>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(project.id)}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-1 rounded border border-[var(--color-studio-500)] text-[var(--color-studio-300)] hover:text-white text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-black/40 text-[var(--color-studio-400)] hover:text-red-400 hover:bg-black/60 transition-all"
          title="Delete project"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ── Dashboard page ────────────────────────────────────────────────────────────
const DEV_USER = { firstName: "Dev User", email: "dev@aihq.local", plan: "Studio", storageLimitGb: 5 };

export default function DashboardPage() {
  const router = useRouter();
  const storeUser = useAuthStore((s) => s.user);
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const user = storeUser
    ? { firstName: storeUser.firstName, email: storeUser.email, plan: storeUser.plan, storageLimitGb: 5 }
    : DEV_USER;

  useEffect(() => {
    // Redirect to sign-in if not signed in and no dev user
    if (!isSignedIn && typeof window !== "undefined" && !localStorage.getItem("aihq:dev-bypass")) {
      // Allow access in dev for ease — comment this out to enforce auth
    }
  }, [isSignedIn, router]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [aiUsage, setAiUsage] = useState<AIUsage>({ used: 0, limit: 50, resetAt: null });
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      if (!res.ok) return;
      const body = await res.json() as { data?: { projects?: Project[] } };
      setProjects(body.data?.projects ?? []);
    } catch {
      // silently ignore
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    // Fetch AI usage
    fetch("/api/ai/usage")
      .then((r) => r.json())
      .then((body) => {
        if (body.data) setAiUsage(body.data as AIUsage);
      })
      .catch(() => {});
  }, [fetchProjects]);

  async function handleCreate(name: string, templateId: string | null) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, templateId }),
    });
    if (!res.ok) return;
    const body = await res.json() as { data?: { project?: { id: string } } };
    const id = body.data?.project?.id;
    if (id) router.push(`/studio/${id}`);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  async function handleRename(id: string, name: string) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) return;
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  const aiLimit = aiUsage.limit === -1 ? Infinity : aiUsage.limit;
  const aiPercent = aiLimit === Infinity ? 0 : Math.min(100, Math.round((aiUsage.used / aiLimit) * 100));
  const storagePercent = Math.min(100, Math.round((user.storageLimitGb * 0.16 / user.storageLimitGb) * 100));

  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-white">
      {/* Nav */}
      <nav className="border-b border-[var(--color-studio-700)] px-6 h-14 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu name={user.firstName} email={user.email} plan={user.plan} />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-[var(--color-studio-300)] text-sm mt-1">
              {loadingProjects ? "Loading…" : `${projects.length} project${projects.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-purple)] text-white hover:opacity-90 transition-opacity font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {/* Account overview */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Plan */}
          <div className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-4">
            <div className="text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1">
              Plan
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white">{user.plan}</span>
              <span className="text-xs text-[var(--color-studio-400)]">Beta (Free)</span>
            </div>
            <p className="mt-2 text-xs text-[var(--color-studio-300)]">
              {projects.length} project{projects.length !== 1 ? "s" : ""} · unlimited storage
            </p>
          </div>

          {/* AI Generations */}
          <div className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-4">
            <div className="text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1">
              AI Generations
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {aiLimit === Infinity ? `${aiUsage.used} used` : `${aiUsage.used} / ${aiUsage.limit}`}
              </span>
              <span className="text-[11px] text-[var(--color-studio-400)]">this month</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-studio-700)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-purple)] transition-all"
                style={{ width: aiLimit === Infinity ? "0%" : `${aiPercent}%` }}
              />
            </div>
            {aiUsage.resetAt && (
              <p className="mt-1.5 text-[10px] text-[var(--color-studio-500)]">
                Resets {new Date(aiUsage.resetAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Storage */}
          <div className="rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] p-4">
            <div className="text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-1">
              Storage
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-white">
                {(user.storageLimitGb * 0.16).toFixed(1)} GB / {user.storageLimitGb} GB
              </span>
              <span className="text-[11px] text-[var(--color-studio-400)]">samples & projects</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--color-studio-700)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent-cyan)] transition-all"
                style={{ width: `${storagePercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Projects grid */}
        {loadingProjects ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[var(--color-studio-500)]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--color-studio-600)] rounded-xl">
            <Music className="w-10 h-10 text-[var(--color-studio-500)] mx-auto mb-4" />
            <p className="text-[var(--color-studio-300)] mb-4">No projects yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-accent-purple)] text-white hover:opacity-90 transition-opacity text-sm"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New project card */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed border-[var(--color-studio-600)] hover:border-[var(--color-accent-purple)] hover:bg-[var(--color-studio-800)] transition-all text-[var(--color-studio-400)] hover:text-[var(--color-accent-purple)]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New Project</span>
            </button>

            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}
