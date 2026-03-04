<div align="center">

# ⚡ AIHQ

**A browser-based AI music production studio**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tone.js](https://img.shields.io/badge/Tone.js-15-FF6B6B?style=flat-square)](https://tonejs.github.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/tests-59%20unit%20%2B%2013%20E2E-22C55E?style=flat-square)](#-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

[**Live Demo**](https://aihq-pi.vercel.app) · [**Report Bug**](https://github.com/ransayada/AIHQ/issues) · [**Request Feature**](https://github.com/ransayada/AIHQ/issues)

</div>

---

## ✨ What is AIHQ?

AIHQ is a fully browser-based Digital Audio Workstation (DAW) powered by the Web Audio API and AI-assisted music generation. No plugins, no downloads — just open it and make music.

```
🎹  Piano Roll       — Draw, drag & resize MIDI notes on a canvas grid
🥁  Step Sequencer   — 16-step drum programming with 16 synthesized EDM sounds
🎛️  Mixer            — Per-track volume, pan, mute, and solo
🎸  Synth Editor     — Oscillator, ADSR envelope, filter + 6 EDM preset sounds
🔊  Effects Rack     — Reverb, Delay, EQ, Compressor, Distortion per track
🤖  AI Panel         — Magenta.js-powered drum pattern and melody generation
```

---

## 🎵 Sounds & Instruments

### 16 Synthesized Drum Pads

| Pad | Sound | Character |
|-----|-------|-----------|
| 0 | **Kick** | Standard 4/4 kick |
| 1 | **Snare** | White noise snap |
| 2 | **HH Closed** | Tight metallic hat |
| 3 | **HH Open** | Long metallic hat |
| 4 | **Tom 1** | Mid-low tom |
| 5 | **Tom 2** | Low tom |
| 6 | **Crash** | Wide cymbal crash |
| 7 | **Ride** | Sustained ride bell |
| 8 | **Clap** | EDM clap |
| 9 | **808 Kick** | Long sub-bass sweep |
| 10 | **Rim** | Snappy rimshot |
| 11 | **Shaker** | High-frequency tick |
| 12 | **Tom Hi** | Bright high tom |
| 13 | **HH Pedal** | Ultra-short hat |
| 14 | **Stab** | Bright metallic zap |
| 15 | **Cowbell** | EDM cowbell |

### 6 One-Click Synth Presets

| Preset | Character |
|--------|-----------|
| **Supersaw** | 7-voice fat sawtooth — classic EDM lead |
| **Sub Bass** | Pure sine, filtered low — deep rumble |
| **Pluck** | Fast-decay sawtooth — percussive melodic |
| **Pad** | Slow-attack fat saw — ambient wash |
| **Acid** | Square + bandpass — 303-style bassline |
| **Bell** | Triangle, long ring — melodic accent |

All presets set the full oscillator, ADSR, and filter — tweak any knob after applying.

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
├── e2e/              # Playwright end-to-end tests (13 tests)
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

### Piano Roll

| Action | How |
|--------|-----|
| **Draw a note** | Left-click on empty space |
| **Extend note length** | Click and drag right while drawing |
| **Move a note** | Click and drag an existing note |
| **Delete a note** | Right-click on a note |
| **Preview a pitch** | Click a piano key on the left |
| **Zoom** | Drag the Zoom slider in the toolbar |

### Step Sequencer & Drums

| Action | How |
|--------|-----|
| **Add a drum sound** | Click `+ Add drum track` — each track = one sound |
| **Toggle a step** | Click a step button to on/off |
| **Choose a sound** | Pad index = track position (1st track = Kick, 2nd = Snare…) |
| **Mute a drum track** | Click the 🔊 icon next to the track name |

### Synth Editor

| Action | How |
|--------|-----|
| **Load a preset** | Click any preset button at the top (Supersaw, Sub Bass, etc.) |
| **Change oscillator** | Click a waveform button (sine / triangle / sawtooth / square / fat saw) |
| **Tune ADSR** | Drag the A / D / S / R knobs |
| **Shape filter** | Set type, cutoff freq, Q, and envelope amount |
| **Preview notes** | Click piano keys in the mini keyboard |

### Transport

| Action | How |
|--------|-----|
| **Play / Stop** | `Space` or the ▶ button |
| **Adjust BPM** | Click the BPM display and type, or scroll the mouse wheel on it |

---

## 🛠️ Development

### Build all packages

```bash
pnpm build
```

### Run unit tests (59 tests)

```bash
pnpm test
```

### Run E2E tests (13 tests — requires Chromium)

```bash
# Install browser once
npx playwright install chromium

# Run E2E tests (starts dev server automatically)
cd e2e && npx playwright test
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

## 🧪 Testing

| Suite | Runner | Count | What it covers |
|-------|--------|-------|----------------|
| `@aihq/shared` | Vitest | 11 | Zod schema validation |
| `@aihq/audio-engine` | Vitest | 38 | MIDI utils, Sequencer |
| `@aihq/api` | Vitest | 3 | REST endpoints (Prisma mocked) |
| `@aihq/web` | Vitest + RTL | 5 | Transport bar component |
| `@aihq/ui` | Vitest | 2 | Panel component stories |
| E2E | Playwright | 13 | Auth flows, studio navigation, transport |

Run everything:

```bash
pnpm test          # unit tests
cd e2e && npx playwright test  # E2E tests
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
| **Drums** | 16 synthesized pads via MembraneSynth, NoiseSynth, MetalSynth |
| **Synth** | PolySynth with full ADSR + filter + 6 EDM presets |
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
vercel --prod   # run from monorepo root
```

Vercel auto-detects Next.js. The root `vercel.json` configures:
- Root directory: `apps/web`
- Build command: `pnpm turbo build --filter=@aihq/web`
- COOP/COEP headers (required for Web Audio `SharedArrayBuffer`)

---

## 🗺️ Roadmap

- [x] Step Sequencer with 16 synthesized EDM drum sounds
- [x] Polyphonic synthesizer with ADSR + filter
- [x] 6 one-click EDM synth presets (Supersaw, Sub Bass, Pluck, Pad, Acid, Bell)
- [x] Effects rack (Reverb, Delay, EQ, Compressor, Distortion)
- [x] Mixer with volume, pan, mute, solo
- [x] Piano Roll with drag & drop note editing
- [x] AI panel (Magenta.js integration)
- [x] 59 unit tests + 13 Playwright E2E tests
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
