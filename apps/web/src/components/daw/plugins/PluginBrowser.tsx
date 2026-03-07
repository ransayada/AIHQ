"use client";
import { useState } from "react";
import { BUILTIN_PLUGINS, usePluginStore } from "@/stores/pluginStore";
import { Puzzle, CheckCircle, Circle, Search, Zap } from "lucide-react";
import { cn } from "@aihq/ui";

const CATEGORY_COLORS: Record<string, string> = {
  dynamics:  "text-blue-400 bg-blue-900/30",
  fx:        "text-purple-400 bg-purple-900/30",
  utility:   "text-cyan-400 bg-cyan-900/30",
  creative:  "text-orange-400 bg-orange-900/30",
};

const CATEGORIES = ["all", "dynamics", "fx", "utility", "creative"] as const;

export function PluginBrowser() {
  const { activePluginIds, activatePlugin, deactivatePlugin } = usePluginStore();
  const [search,   setSearch]   = useState("");
  const [category, setCategory] = useState<typeof CATEGORIES[number]>("all");

  const filtered = BUILTIN_PLUGINS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search.toLowerCase()));
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="flex flex-col h-full bg-[var(--color-studio-900)] text-white text-xs">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-studio-700)]">
        <Puzzle className="w-4 h-4 text-[var(--color-accent-purple)]" />
        <span className="text-sm font-semibold flex-1">Plugin Marketplace</span>
        <span className="text-[10px] text-[var(--color-studio-400)]">
          {activePluginIds.length} active
        </span>
      </div>

      {/* Search */}
      <div className="px-3 pt-2 pb-1 space-y-2">
        <div className="flex items-center gap-2 rounded-lg bg-[var(--color-studio-800)] border border-[var(--color-studio-600)] px-2">
          <Search className="w-3.5 h-3.5 text-[var(--color-studio-400)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plugins…"
            className="flex-1 bg-transparent py-1.5 text-xs text-white placeholder-[var(--color-studio-500)] focus:outline-none"
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-1 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize transition-colors",
                category === cat
                  ? "bg-[var(--color-accent-purple)] text-white"
                  : "bg-[var(--color-studio-800)] text-[var(--color-studio-300)] hover:text-white"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Plugin list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {filtered.map((plugin) => {
          const active = activePluginIds.includes(plugin.id);
          return (
            <div
              key={plugin.id}
              className={cn(
                "rounded-xl border p-3 transition-all",
                active
                  ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple-dim)]"
                  : "border-[var(--color-studio-600)] bg-[var(--color-studio-800)]"
              )}
            >
              <div className="flex items-start gap-2">
                {/* Toggle */}
                <button
                  onClick={() => active ? deactivatePlugin(plugin.id) : activatePlugin(plugin.id)}
                  className="mt-0.5 flex-shrink-0"
                >
                  {active
                    ? <CheckCircle className="w-4 h-4 text-[var(--color-accent-purple)]" />
                    : <Circle className="w-4 h-4 text-[var(--color-studio-500)]" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-white text-[11px]">{plugin.name}</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-medium capitalize", CATEGORY_COLORS[plugin.category])}>
                      {plugin.category}
                    </span>
                  </div>
                  <p className="text-[var(--color-studio-300)] leading-relaxed mb-1.5">{plugin.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {plugin.tags.map((tag) => (
                      <span key={tag} className="text-[9px] text-[var(--color-studio-500)] bg-[var(--color-studio-700)] px-1.5 py-0.5 rounded">
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[9px] text-[var(--color-studio-600)] ml-auto">v{plugin.version}</span>
                  </div>
                </div>
              </div>

              {active && (
                <div className="mt-2 pt-2 border-t border-[var(--color-accent-purple)]/30 flex items-center gap-1.5 text-[10px] text-[var(--color-accent-purple)]">
                  <Zap className="w-2.5 h-2.5" />
                  Active — applied to master output
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
