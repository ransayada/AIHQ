import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIHQ — AI Music Production Studio",
  description: "Browser-based DAW with AI-powered music generation. Compose, sequence, and mix in your browser.",
  keywords: ["DAW", "music production", "AI music", "browser DAW", "sequencer"],
  authors: [{ name: "AIHQ" }],
  openGraph: {
    title: "AIHQ — AI Music Production Studio",
    description: "Browser-based DAW with AI-powered music generation.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
