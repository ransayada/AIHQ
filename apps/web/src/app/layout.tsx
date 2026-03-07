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

// Inline script that runs before React hydration to prevent theme flash
const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('aihq:theme');
    if (!t) t = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
  } catch(e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Theme initialiser — must run before first paint */}
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
