"use client";

import Link from "next/link";

interface LogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 24, text: "text-base" },
  md: { icon: 30, text: "text-xl"  },
  lg: { icon: 40, text: "text-3xl" },
};

export function Logo({ href = "/", size = "md", className = "" }: LogoProps) {
  const { icon, text } = sizes[size];

  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 group select-none ${className}`}
      aria-label="AIHQ — go to home"
    >
      {/* SVG mark */}
      <div className="relative flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* Outer hexagon frame */}
          <path
            d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
            fill="url(#logo-bg)"
            stroke="url(#logo-border)"
            strokeWidth="0.5"
          />
          {/* Waveform bars */}
          <rect x="9"  y="17" width="3" height="6"  rx="1.5" fill="white" opacity="0.6"  />
          <rect x="14" y="13" width="3" height="14" rx="1.5" fill="white" opacity="0.85" />
          <rect x="19" y="10" width="3" height="20" rx="1.5" fill="white" />
          <rect x="24" y="14" width="3" height="12" rx="1.5" fill="white" opacity="0.85" />
          <rect x="29" y="18" width="3" height="4"  rx="1.5" fill="white" opacity="0.6"  />
          {/* AI sparkle dot */}
          <circle cx="31" cy="10" r="2.5" fill="url(#logo-spark)" />

          <defs>
            <linearGradient id="logo-bg" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="#6b3fcf" />
              <stop offset="60%"  stopColor="#9b6dff" />
              <stop offset="100%" stopColor="#f5a623" />
            </linearGradient>
            <linearGradient id="logo-border" x1="4" y1="2" x2="36" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%"   stopColor="rgba(155,109,255,0.8)" />
              <stop offset="100%" stopColor="rgba(245,166,35,0.5)"  />
            </linearGradient>
            <radialGradient id="logo-spark" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f5a623" />
            </radialGradient>
          </defs>
        </svg>

        {/* Glow ring on hover */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: "0 0 16px rgba(155,109,255,0.5)" }}
        />
      </div>

      {/* Logotype */}
      <span
        className={`font-bold tracking-tight leading-none ${text}`}
        style={{
          background: "linear-gradient(135deg, #c4a8ff 0%, #9b6dff 50%, #f5a623 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        AIHQ
      </span>
    </Link>
  );
}
