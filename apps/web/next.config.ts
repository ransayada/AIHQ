import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin file-tracing root to the monorepo root (avoids picking up C:\Users\RS\package-lock.json)
  outputFileTracingRoot: path.join(__dirname, "../../"),

  // Transpile monorepo workspace packages
  transpilePackages: ["@aihq/ui", "@aihq/shared", "@aihq/audio-engine"],

  // Required for SharedArrayBuffer (Tone.js audio scheduling)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
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

export default nextConfig;
