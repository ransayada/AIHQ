<div align="center">

# ⚡ AIHQ

**A browser-based AI music production studio**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tone.js](https://img.shields.io/badge/Tone.js-15-FF6B6B?style=flat-square)](https://tonejs.github.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

[**Live Demo**](https://aihq-pi.vercel.app) · [**Report Bug**](https://github.com/ransayada/AIHQ/issues) · [**Request Feature**](https://github.com/ransayada/AIHQ/issues)

</div>

---

## ✨ What is AIHQ?

AIHQ is a fully browser-based Digital Audio Workstation (DAW) powered by the Web Audio API and AI-assisted music generation. No plugins, no downloads — just open it and make music.

```
🎹  Piano Roll       — Draw and edit MIDI notes on a canvas-based grid
🥁  Step Sequencer   — 16-step drum programming with synthesized sounds
🎛️  Mixer            — Per-track volume, pan, mute, and solo
🎸  Synth Editor     — Oscillator, ADSR envelope, and filter controls
🔊  Effects Rack     — Reverb, Delay, EQ, Compressor, Distortion per track
🤖  AI Panel         — Magenta.js-powered drum pattern and melody generation
```

---

## 🏗️ Monorepo Structure

```
aihq/
├── apps/
│   ├── web/          # Next.js 15 frontend (the DAW UI)
│   └── api/          # Hono.js REST API (Node.js)
├── packages/
│   ├── audio-engine/ # Tone.js wrapper — instruments, sequencer, effects
│   ├── shared/       # Zod schemas + TypeScript types (shared by all)
│   └── ui/           # Design system — components + Tailwind v4 tokens
├── e2e/              # Playwright end-to-end tests
├── turbo.json        # Turborepo pipeline
└── pnpm-workspace.yaml
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org/) |
| pnpm | ≥ 9 | `npm i -g pnpm` |

### 1 — Clone & install

```bash
git clone https://github.com/ransayada/AIHQ.git
cd AIHQ
pnpm install
```

### 2 — Environment variables

```bash
cp .env.example apps/web/.env
```

> The app runs fully in local dev **without any API keys**. The only required key for production is Clerk (auth) — see `.env.example` for the full list.

### 3 — Run the dev servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (DAW) | http://localhost:3000 |
| API | http://localhost:3001 |

Open **http://localhost:3000/studio/test** to launch the DAW.

---

## 🎛️ Using the DAW

| Action | How |
|--------|-----|
| **Add a drum track** | Click `+ Add drum track` in the Sequencer tab |
| **Add a synth track** | Click `+` in the Session View |
| **Toggle steps** | Click squares in the Step Sequencer |
| **Edit synth** | Select a synth track → click **Synth** tab |
| **Add effects** | Select any track → click **Effects** tab |
| **Play / Stop** | `Space` or the ▶ button in the transport bar |
| **Adjust BPM** | Scroll on the BPM display in the transport bar |

---

## 🛠️ Development

### Build all packages

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Type checking

```bash
pnpm type-check
```

### Lint

```bash
pnpm lint
```

### Package scripts (run one package)

```bash
# Build only the audio engine
pnpm turbo build --filter=@aihq/audio-engine

# Dev only the web app
pnpm turbo dev --filter=@aihq/web
```

---

## 🧩 Tech Stack

### Frontend (`apps/web`)
| | |
|--|--|
| **Framework** | Next.js 15 — App Router, React 19, Server Components |
| **Styling** | Tailwind CSS v4 with custom DAW design tokens |
| **State** | Zustand 5 with Immer + devtools |
| **Audio** | Tone.js 15 via `@aihq/audio-engine` |
| **Auth** | Clerk (optional in local dev) |
| **Icons** | Lucide React |

### Audio Engine (`packages/audio-engine`)
| | |
|--|--|
| **Core** | Tone.js 15 (Web Audio API) |
| **Drums** | Synthesized via MembraneSynth, NoiseSynth, MetalSynth |
| **Synth** | PolySynth with full ADSR + filter |
| **Effects** | Reverb, FeedbackDelay, EQ3, Compressor, Distortion |
| **Signal chain** | Instrument → EffectsChain → Mixer → Destination |
| **AI** | Magenta.js MusicRNN for pattern generation |

### Backend (`apps/api`)
| | |
|--|--|
| **Framework** | Hono.js v4 on Node.js |
| **Database** | PostgreSQL via Prisma |
| **Cache** | Redis (Upstash) |
| **Auth** | Clerk JWT validation |
| **Billing** | Stripe |

### Shared Infrastructure
| | |
|--|--|
| **Monorepo** | Turborepo 2 + pnpm workspaces |
| **Types** | Zod schemas shared across all packages |
| **Testing** | Vitest + React Testing Library + Playwright |
| **CI** | GitHub Actions |

---

## 📦 Environment Variables

Create `apps/web/.env` from `.env.example`:

```env
# Clerk Auth (optional — app works without it in dev)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Create `apps/api/.env` for the backend:

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

---

## 🌐 Deploying to Vercel

The web app is pre-configured for Vercel deployment.

### One-click deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ransayada/AIHQ&root=apps/web)

### Manual deploy via CLI

```bash
npm i -g vercel
cd apps/web
vercel --prod
```

Vercel will auto-detect Next.js. The `apps/web/vercel.json` already configures:
- Build command: `pnpm turbo build --filter=@aihq/web`
- COOP/COEP headers (required for Web Audio SharedArrayBuffer)

---

## 🗺️ Roadmap

- [x] Step Sequencer with synthesized drums
- [x] Polyphonic synthesizer with ADSR + filter
- [x] Effects rack (Reverb, Delay, EQ, Compressor, Distortion)
- [x] Mixer with volume, pan, mute, solo
- [x] Piano Roll (canvas-based)
- [x] AI panel (Magenta.js integration)
- [ ] Audio sample import & playback
- [ ] Export to WAV / MP3
- [ ] Project save/load to cloud
- [ ] Collaborative editing (CRDTs)
- [ ] VST-style plugin API
- [ ] Mobile touch support

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, then:
git checkout -b feature/my-feature
pnpm install
pnpm dev
# make your changes
pnpm test && pnpm type-check
git commit -m "feat: my feature"
git push origin feature/my-feature
# open a PR
```

---

## 📄 License

MIT © [ransayada](https://github.com/ransayada/ransayada)

---

<div align="center">

Built with ❤️ using [Next.js](https://nextjs.org/), [Tone.js](https://tonejs.github.io/), and [Turborepo](https://turbo.build/)

</div>
