"use client";

import * as React from "react";
import { cn } from "./utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name?: string;
  email?: string;
  imageUrl?: string;
  size?: AvatarSize;
  status?: "online" | "away" | "offline";
  showStatus?: boolean;
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

const statusClasses: Record<NonNullable<AvatarProps["status"]>, string> = {
  online: "bg-[var(--color-accent-green)]",
  away: "bg-[var(--color-accent-yellow)]",
  offline: "bg-[var(--color-studio-400)]",
};

function getInitials(name?: string, email?: string): string {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0] ?? "").toUpperCase() + (parts[1]![0] ?? "").toUpperCase();
  }
  if (email && email.length > 0) {
    return email[0]!.toUpperCase();
  }
  return "?";
}

function getColorVariant(seed: string): string {
  if (!seed) return "from-[var(--color-studio-700)] to-[var(--color-studio-900)]";
  const code = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variant = code % 3;

  switch (variant) {
    case 0:
      return "from-[var(--color-accent-purple)] to-[var(--color-studio-700)]";
    case 1:
      return "from-[var(--color-accent-cyan)] to-[var(--color-studio-700)]";
    default:
      return "from-[var(--color-accent-pink)] to-[var(--color-studio-700)]";
  }
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ name, email, imageUrl, size = "md", status = "online", showStatus = false, className, ...props }, ref) => {
    const initials = getInitials(name, email);
    const seed = name ?? email ?? initials;
    const gradient = getColorVariant(seed);

    return (
      <div
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border border-[var(--color-studio-700)] bg-[var(--color-studio-800)] text-[var(--color-studio-50)] font-semibold uppercase overflow-hidden",
          "bg-gradient-to-br",
          gradient,
          sizeClasses[size],
          className
        )}
        aria-label={name ?? email ?? "User avatar"}
        {...props}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name ?? email ?? "User avatar"} className="h-full w-full object-cover" />
        ) : (
          <span>{initials}</span>
        )}

        {showStatus && (
          <span
            className={cn(
              "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-[var(--color-studio-900)]",
              statusClasses[status]
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

