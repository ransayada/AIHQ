<div align="center">

# AIHQ

**A browser-based AI music production studio**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tone.js](https://img.shields.io/badge/Tone.js-15-FF6B6B?style=flat-square)](https://tonejs.github.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.x-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-workspaces-F69220?style=flat-square&logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Tests](https://img.shields.io/badge/tests-120%20unit%20%2B%2055%20E2E-22C55E?style=flat-square)](#-testing)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)](LICENSE)

[**Live Demo**](https://aihq-pi.vercel.app) · [**Report Bug**](https://github.com/ransayada/AIHQ/issues) · [**Request Feature**](https://github.com/ransayada/AIHQ/issues)

</div>

---

## What is AIHQ?

AIHQ is a fully browser-based Digital Audio Workstation (DAW) powered by the Web Audio API and AI-assisted music generation. No plugins, no downloads — just open it and make music.

```
Piano Roll          — Draw, drag & resize MIDI notes on a canvas grid
Step Sequencer      — 16-step drum programming with 16 synthesized EDM sounds
Mixer               — Per-track volume, pan, mute, and solo
Synth Editor        — Oscillator, ADSR envelope, filter + 6 EDM preset sounds
Effects Rack        — Reverb, Delay, EQ, Compressor, Distortion per track
AI Panel            — Magenta.js drum/melody generation + Claude AI chat
Real-time Collab    — Yjs CRDT-based live multi-user editing
Sample Library      — Upload, search, preview, drag-to-track
MIDI Controller     — Web MIDI API learn mode with persistent mappings
Stem Export         — Export individual stems via MediaRecorder
AI Mastering        — Claude API streaming mastering settings
Project Templates   — 6 genre presets (EDM, Hip-Hop, Ambient, etc.)
Version History     — Snapshots + restore via API
Plugin Browser      — 8 built-in audio plugins
Live Performance    — Fullscreen 8-pad + keyboard + MIDI launch mode
Sharing & Embeds    — Public share tokens + embeddable /share/[token] pages
DJ Mode             — Dual deck crossfade + BPM sync deck controls
Light / Dark Mode   — System-aware theme toggle persisted to localStorage
```

---

## What's New

| Feature | Description |
|---------|-------------|
| **2026 UI Redesign** | Warm color palette, 3D card depth, glass panels, gradient logo, light/dark mode |
| **Light / Dark Mode** | System-aware theme toggle — persists to localStorage, no flash on load |
| **New Logo** | SVG hexagon mark with waveform bars and gradient fill |
| **User Auth** | localStorage-based sign-up/sign-in/sign-out with profile storage. Clerk-ready for production. |
| **Real-time Collaboration** | Yjs CRDT + WebSocket at `/collab` — multiple users edit the same project live |
| **Sample Library** | Upload audio files, search by tag/BPM, drag to any track |
| **MIDI Controller Mapping** | Web MIDI API device detection, learn mode, persisted mappings per project |
| **Stem Export** | Capture individual track audio with MediaRecorder API |
| **AI Mastering** | Ask Claude for streaming mastering settings for your mix |
| **Project Templates** | 6 genre presets: EDM Drop, Lo-Fi Hip-Hop, Ambient Drone, Techno, House, Trap |
| **Version History** | Create named snapshots and restore any previous state |
| **Plugin Browser** | 8 built-in plugins browser (Chorus, Phaser, Bitcrusher, etc.) |
| **Live Performance Mode** | Fullscreen 8-pad triggering with keyboard and MIDI |
| **Sharing & Embeds** | One-click public share links + embeddable read-only player |
| **DJ Mode** | Dual-deck mixer with crossfader and BPM sync |

---

## Monorepo Structure

```
aihq/
├── apps/
│   ├── web/          # Next.js 15 frontend (DAW UI + auth)
│   └── api/          # Hono.js REST API + WebSocket collab server
├── packages/
│   ├── audio-engine/ # Tone.js wrapper — instruments, sequencer, effects, DJ, MIDI, export
│   ├── shared/       # Zod schemas + TypeScript types + project templates
│   └── ui/           # Design system — components + Storybook + Tailwind v4 tokens
├── e2e/              # Playwright end-to-end tests
├── scripts/          # Utility scripts
├── turbo.json        # Turborepo pipeline
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | >= 20 |
| pnpm | >= 9 |

### 1 — Clone & install

```bash
git clone https://github.com/ransayada/AIHQ.git
cd AIHQ
pnpm install
```

### 2 — Environment variables

```bash
cp .env.example apps/web/.env
cp .env.example apps/api/.env
```

The app runs fully in local dev **without any API keys**. Optional keys unlock production features.

### 3 — Run the dev servers

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web (DAW) | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger UI | http://localhost:3001/docs |

Open **http://localhost:3000/studio/test** to launch the DAW immediately.

---

## Authentication

AIHQ ships with a built-in dev-mode auth system (localStorage-based) and is pre-wired for [Clerk](https://clerk.com) in production.

### Dev mode (default — no keys needed)

- Visit `/sign-up` to register a local account (stored in browser localStorage)
- Visit `/sign-in` to log back in
- Click "Dev mode: skip sign-in →" to bypass auth entirely
- User profiles persist across browser sessions

### Production (Clerk)

Add your Clerk keys to `apps/web/.env`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

Add to `apps/api/.env`:

```env
CLERK_SECRET_KEY=sk_live_...
```

The API auth middleware automatically upgrades to real JWT validation when `CLERK_SECRET_KEY` is set.

---

## Using the DAW

### Piano Roll

| Action | How |
|--------|-----|
| Draw a note | Left-click empty space |
| Extend note | Click + drag right while drawing |
| Move a note | Click + drag an existing note |
| Delete a note | Right-click on a note |
| Preview pitch | Click a piano key on the left |
| Zoom | Drag the Zoom slider |

### Step Sequencer

| Action | How |
|--------|-----|
| Add drum track | Click `+ Add drum track` |
| Toggle step | Click a step button |
| Mute track | Click the speaker icon |

### Synth Editor

| Action | How |
|--------|-----|
| Load preset | Click Supersaw / Sub Bass / Pluck / Pad / Acid / Bell |
| Change oscillator | Click a waveform button |
| Tune ADSR | Drag A / D / S / R knobs |
| Shape filter | Set type, cutoff, Q, envelope amount |

### Transport

| Action | How |
|--------|-----|
| Play / Stop | `Space` or the play button |
| Adjust BPM | Click BPM display and type, or scroll mouse wheel |

### Collaboration

| Action | How |
|--------|-----|
| Start session | Open same project URL in multiple browsers |
| See cursors | Collaborator cursors shown in real-time |
| Undo/Redo | `Ctrl+Z` / `Ctrl+Y` — synced across all users |

### Sample Library

| Action | How |
|--------|-----|
| Upload | Click Upload in the Samples panel |
| Preview | Click the play button on any sample |
| Add to track | Drag sample tile onto a track |

### Live Performance Mode

| Action | How |
|--------|-----|
| Open | Click Performance in the toolbar |
| Trigger pad | Click pad or press `Q W E R A S D F` |
| Exit | Press `Escape` |

---

## Sounds & Instruments

### 16 Synthesized Drum Pads

| Pad | Sound |
|-----|-------|
| 0 | Kick |
| 1 | Snare |
| 2 | HH Closed |
| 3 | HH Open |
| 4 | Tom 1 |
| 5 | Tom 2 |
| 6 | Crash |
| 7 | Ride |
| 8 | Clap |
| 9 | 808 Kick |
| 10 | Rim |
| 11 | Shaker |
| 12 | Tom Hi |
| 13 | HH Pedal |
| 14 | Stab |
| 15 | Cowbell |

### 6 One-Click Synth Presets

| Preset | Character |
|--------|-----------|
| Supersaw | 7-voice fat sawtooth — classic EDM lead |
| Sub Bass | Pure sine, filtered low — deep rumble |
| Pluck | Fast-decay sawtooth — percussive melodic |
| Pad | Slow-attack fat saw — ambient wash |
| Acid | Square + bandpass — 303-style bassline |
| Bell | Triangle, long ring — melodic accent |

### 6 Project Templates

| Template | Genre |
|----------|-------|
| EDM Drop | 128 BPM, supersaw lead, 4-on-the-floor kick |
| Lo-Fi Hip-Hop | 85 BPM, jazz chords, vinyl crackle |
| Ambient Drone | 72 BPM, pad wash, reverb-heavy |
| Techno | 140 BPM, minimal kick, acid bassline |
| House | 124 BPM, piano chords, soulful |
| Trap | 140 BPM (half-time), 808 sub, hi-hat rolls |

---

## Development

### Build all packages

```bash
pnpm build
```

### Run unit tests (120 tests)

```bash
pnpm test
```

### Run E2E tests (requires Chromium)

```bash
# Install browser once
npx playwright install chromium

# Run (auto-starts dev server)
cd e2e && npx playwright test
```

### Storybook (component development)

```bash
cd packages/ui && pnpm storybook
```

### Type checking

```bash
pnpm type-check
```

### Lint

```bash
pnpm lint
```

---

## Testing

| Suite | Runner | Count | Coverage |
|-------|--------|-------|----------|
| `@aihq/shared` | Vitest | 11 | Zod schema validation |
| `@aihq/audio-engine` | Vitest | 38 | MIDI utils, Sequencer, DJ engine |
| `@aihq/api` | Vitest | 27 | REST endpoints, auth, share/snapshot |
| `@aihq/web` | Vitest + RTL | 44 | Components, stores, new features |
| E2E | Playwright | 55 | Auth flows, studio, transport, collab, instruments |

---

## Tech Stack

### Frontend (`apps/web`)

| | |
|--|--|
| Framework | Next.js 15 — App Router, React 19 |
| Styling | Tailwind CSS v4 with custom DAW tokens |
| State | Zustand 5 with Immer + devtools |
| Audio | Tone.js 15 via `@aihq/audio-engine` |
| Auth | localStorage dev auth + Clerk (production) |
| Collab | Yjs CRDT over WebSocket |
| Icons | Lucide React |

### Audio Engine (`packages/audio-engine`)

| | |
|--|--|
| Core | Tone.js 15 (Web Audio API) |
| Drums | 16 synthesized pads via MembraneSynth, NoiseSynth, MetalSynth |
| Synth | PolySynth with full ADSR + filter + 6 EDM presets |
| Effects | Reverb, FeedbackDelay, EQ3, Compressor, Distortion |
| MIDI | Web MIDI API input mapping + learn mode |
| Export | MediaRecorder-based stem capture |
| DJ | Dual deck crossfade + BPM detection |

### Backend (`apps/api`)

| | |
|--|--|
| Framework | Hono.js v4 on Node.js |
| Database | PostgreSQL via Prisma |
| Cache | Redis (Upstash) |
| Auth | Dev passthrough + Clerk JWT (production) |
| Collab | Yjs WebSocket server at `/collab` |
| Docs | Swagger UI at `/docs` |

### Shared Infrastructure

| | |
|--|--|
| Monorepo | Turborepo 2 + pnpm workspaces |
| Types | Zod schemas shared across all packages |
| UI Library | `@aihq/ui` — Storybook 8 + Tailwind |
| Testing | Vitest + React Testing Library + Playwright |
| CI | GitHub Actions |
| Observability | Sentry + ELK stack (Docker Compose) |

---

## Environment Variables

### `apps/web/.env`

```env
# Clerk Auth (optional in dev — app works without it)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# API
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `apps/api/.env`

```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
CLERK_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=aihq-samples
```

---

## Deploying to Vercel

```bash
npm i -g vercel
vercel --prod
```

Vercel auto-detects Next.js. The root `vercel.json` configures:
- Root directory: `apps/web`
- Build command: `pnpm turbo build --filter=@aihq/web`
- COOP/COEP headers (required for `SharedArrayBuffer`)

---

## Docker / Microservices

Run everything locally with Docker Compose:

```bash
docker-compose up
```

For production Kubernetes deployment, see `scripts/k8s/` for Helm charts and pod specs. Estimated infra cost: **$210–$445/month** on AWS EKS (web + api + collab + PostgreSQL + Redis + S3 + ALB).

---

## Roadmap

- [x] Step Sequencer with 16 synthesized EDM drum sounds
- [x] Polyphonic synthesizer with ADSR + filter + 6 presets
- [x] Effects rack (Reverb, Delay, EQ, Compressor, Distortion)
- [x] Mixer with volume, pan, mute, solo
- [x] Piano Roll with drag & drop note editing
- [x] AI panel (Magenta.js + Claude AI chat)
- [x] Real-time collaboration (Yjs CRDT)
- [x] Sample Library with upload/search/preview
- [x] MIDI Controller Mapping (Web MIDI API)
- [x] Stem Export (MediaRecorder)
- [x] AI Mastering (Claude streaming)
- [x] Project Templates (6 genres)
- [x] Version History + Snapshots
- [x] Plugin Browser (8 built-in plugins)
- [x] Live Performance Mode (8-pad)
- [x] Sharing & Embeds (public tokens)
- [x] DJ Mode (dual deck)
- [x] User auth with profile storage
- [x] 120 unit tests + 55 Playwright E2E tests
- [x] Warm 2026 UI redesign with light/dark mode
- [x] New SVG logo with gradient hexagon mark
- [ ] Mobile touch support
- [ ] VST-style plugin API
- [ ] Audio sample time-stretching
- [ ] Cloud project sync (multi-device)
- [ ] Public project gallery

---

## Contributing

```bash
git checkout -b feature/my-feature
pnpm install
pnpm dev
# make changes
pnpm test && pnpm type-check
git commit -m "feat: my feature"
git push origin feature/my-feature
# open a PR
```

---

## License

MIT © [ransayada](https://github.com/ransayada/ransayada)

---

<div align="center">
Built with Next.js, Tone.js, and Turborepo
</div>
