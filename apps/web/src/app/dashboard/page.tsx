import Link from "next/link";
import { Plus, Music, Clock } from "lucide-react";

// Auth disabled — static mock for local dev
const MOCK_USER = { firstName: "Dev User" };

async function getProjects() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/projects`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const body = (await res.json()) as { data?: { projects?: unknown[] } };
    return (body.data?.projects ?? []) as Array<{
      id: string;
      name: string;
      bpm: number;
      updatedAt: string;
    }>;
  } catch {
    return [];
  }
}

export default async function DashboardPage() {
  const user = MOCK_USER;
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-[var(--color-studio-900)] text-white">
      {/* Nav */}
      <nav className="border-b border-[var(--color-studio-700)] px-6 h-14 flex items-center justify-between">
        <div className="font-bold tracking-tight">
          <span className="text-[var(--color-accent-purple)]">AI</span>HQ
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--color-studio-300)]">
            {user?.firstName}
          </span>
          <Link
            href="/pricing"
            className="text-sm px-3 py-1 rounded border border-[var(--color-studio-500)] hover:bg-[var(--color-studio-700)] transition-colors"
          >
            Upgrade
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Projects</h1>
            <p className="text-[var(--color-studio-300)] text-sm mt-1">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Link
            href="/studio/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)] transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>

        {/* Projects grid */}
        {projects.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[var(--color-studio-600)] rounded-xl">
            <Music className="w-10 h-10 text-[var(--color-studio-500)] mx-auto mb-4" />
            <p className="text-[var(--color-studio-300)] mb-4">No projects yet</p>
            <Link
              href="/studio/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-[var(--color-accent-purple)] text-white hover:bg-[var(--color-accent-purple-dim)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* New project card */}
            <Link
              href="/studio/new"
              className="flex flex-col items-center justify-center gap-2 h-36 rounded-xl border border-dashed border-[var(--color-studio-600)] hover:border-[var(--color-accent-purple)] hover:bg-[var(--color-studio-800)] transition-all text-[var(--color-studio-400)] hover:text-[var(--color-accent-purple)]"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New Project</span>
            </Link>

            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/studio/${project.id}`}
                className="group flex flex-col h-36 rounded-xl border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] hover:border-[var(--color-studio-400)] hover:bg-[var(--color-studio-700)] transition-all overflow-hidden"
              >
                {/* Color preview */}
                <div className="h-16 bg-gradient-to-br from-[var(--color-accent-purple-dim)] to-[var(--color-studio-700)] flex items-center justify-center">
                  <Music className="w-8 h-8 text-[var(--color-accent-purple)] opacity-60" />
                </div>
                <div className="p-3 flex-1">
                  <p className="font-medium text-sm text-white truncate">{project.name}</p>
                  <div className="flex items-center gap-1 mt-1 text-[var(--color-studio-400)] text-[10px]">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                    <span className="ml-auto daw-readout">{project.bpm} BPM</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
