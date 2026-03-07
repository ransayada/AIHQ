import path from "path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const ANALYZE = process.env.ANALYZE === "true";

// Bundle-analyzer: only active when ANALYZE=true
async function getBundleAnalyzer() {
  if (!ANALYZE) return (c: NextConfig) => c;
  const { default: BundleAnalyzer } = await import("@next/bundle-analyzer");
  return BundleAnalyzer({ enabled: true });
}

const nextConfig: NextConfig = {
  // Pin file-tracing root to the monorepo root (avoids picking up C:\Users\RS\package-lock.json)
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Transpile monorepo workspace packages
  transpilePackages: ["@aihq/ui", "@aihq/shared", "@aihq/audio-engine"],

  // Security + SharedArrayBuffer headers
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.accounts.dev https://*.clerk.accounts.dev",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' blob:",
      "connect-src 'self' ws://localhost:3001 wss://localhost:3001 http://localhost:3001 https://api.anthropic.com https://clerk.accounts.dev https://*.clerk.accounts.dev https://o*.ingest.sentry.io",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          // SharedArrayBuffer (required by Tone.js scheduling)
          { key: "Cross-Origin-Opener-Policy",   value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy",  value: "require-corp" },
          // Security hardening
          { key: "X-Content-Type-Options",        value: "nosniff" },
          { key: "X-Frame-Options",               value: "DENY" },
          { key: "X-XSS-Protection",              value: "1; mode=block" },
          { key: "Referrer-Policy",               value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",            value: "microphone=(self), camera=(), geolocation=()" },
          { key: "Strict-Transport-Security",     value: "max-age=31536000; includeSubDomains" },
          // CSP — tightened for audio worklet + Clerk + Sentry
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Content-Security-Policy", value: csp }]
            : []),
        ],
      },
    ];
  },

  // Proxy API requests to Hono backend in development
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/webhooks/:path*",
        destination: `${apiUrl}/webhooks/:path*`,
      },
    ];
  },

  // Suppress Tone.js build warnings
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

// Apply bundle-analyzer then Sentry
export default (async () => {
  const withBundleAnalyzer = await getBundleAnalyzer();
  const analyzed = withBundleAnalyzer(nextConfig);

  return withSentryConfig(analyzed, {
    // Sentry org + project read from environment (SENTRY_ORG, SENTRY_PROJECT)
    silent: !process.env.CI,    // only print in CI
    disableLogger: true,        // trim Sentry logger from client bundle
    sourcemaps: {
      disable: false,           // upload source maps to Sentry
    },
    automaticVercelMonitors: true,
  });
})();
