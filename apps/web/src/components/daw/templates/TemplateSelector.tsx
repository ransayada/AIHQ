"use client";
import { PROJECT_TEMPLATES, type ProjectTemplate } from "@aihq/shared";
import { useState } from "react";
import { Check } from "lucide-react";

interface TemplateSelectorProps {
  selected: string | null;
  onChange:  (id: string | null) => void;
}

export function TemplateSelector({ selected, onChange }: TemplateSelectorProps) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[var(--color-studio-300)] uppercase tracking-widest mb-2">
        Start from template <span className="normal-case font-normal opacity-60">(optional)</span>
      </p>

      {/* Blank option */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <TemplateCard
          template={null}
          active={selected === null}
          onClick={() => onChange(null)}
        />
        {PROJECT_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            active={selected === t.id}
            onClick={() => onChange(t.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({
  template,
  active,
  onClick,
}: {
  template: ProjectTemplate | null;
  active:   boolean;
  onClick:  () => void;
}) {
  const border = active
    ? "border-[var(--color-accent-purple)] bg-[var(--color-accent-purple-dim)]"
    : "border-[var(--color-studio-600)] bg-[var(--color-studio-900)] hover:border-[var(--color-studio-400)]";

  if (!template) {
    return (
      <button
        onClick={onClick}
        className={`relative flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center transition-all ${border}`}
        style={{ minHeight: 64 }}
      >
        {active && <AbsCheck />}
        <span className="text-lg">✨</span>
        <span className="text-[10px] font-semibold text-[var(--color-studio-100)]">Blank</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 rounded-lg border p-2 text-center transition-all ${border}`}
      style={{ minHeight: 64 }}
    >
      {active && <AbsCheck />}
      <span className="text-lg">{template.emoji}</span>
      <span className="text-[10px] font-semibold text-[var(--color-studio-100)] leading-tight">{template.name}</span>
      <span className="text-[9px] text-[var(--color-studio-400)]">{template.bpm} BPM</span>
    </button>
  );
}

function AbsCheck() {
  return (
    <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[var(--color-accent-purple)] flex items-center justify-center">
      <Check className="w-2 h-2 text-white" />
    </span>
  );
}
