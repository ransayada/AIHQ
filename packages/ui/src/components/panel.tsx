"use client";

import * as React from "react";
import { cn } from "./utils";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  noPadding?: boolean;
}

export function Panel({
  title,
  actions,
  collapsible = false,
  defaultCollapsed = false,
  noPadding = false,
  children,
  className,
  ...props
}: PanelProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);

  return (
    <div
      className={cn(
        "flex flex-col border border-[var(--color-studio-600)] bg-[var(--color-studio-800)] rounded-[var(--radius-daw)]",
        className
      )}
      {...props}
    >
      {title && (
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-[var(--color-studio-600)] bg-[var(--color-studio-700)] rounded-t-[var(--radius-daw)]">
          <button
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium text-[var(--color-studio-100)] uppercase tracking-widest",
              collapsible && "hover:text-white"
            )}
            onClick={() => collapsible && setCollapsed((c) => !c)}
          >
            {collapsible && (
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className={cn("transition-transform", collapsed && "-rotate-90")}
              >
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            )}
            {title}
          </button>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      {!collapsed && (
        <div className={cn("flex-1 min-h-0", !noPadding && "p-2.5")}>{children}</div>
      )}
    </div>
  );
}
