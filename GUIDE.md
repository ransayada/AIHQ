# AIHQ — User Guide

> **AIHQ** is an AI-powered browser-based Digital Audio Workstation (DAW) and DJ platform. Compose, mix, and produce music directly in your browser — no downloads, no plugins.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard](#dashboard)
3. [Studio — DAW](#studio--daw)
4. [Piano Roll](#piano-roll)
5. [Synth & Instruments](#synth--instruments)
6. [Effects Rack](#effects-rack)
7. [DJ Mode](#dj-mode)
8. [AI Assistant](#ai-assistant)
9. [Transport & Playback](#transport--playback)
10. [Mixer](#mixer)
11. [Account & Settings](#account--settings)
12. [Keyboard Shortcuts](#keyboard-shortcuts)
13. [Logging & Observability](#logging--observability)

---

## Getting Started

### Sign Up / Sign In

1. Navigate to the home page and click **Get Started Free**.
2. Create an account via email or Google OAuth.
3. You are placed on the **Free** plan (3 projects, 50 AI generations/month).
4. Upgrade anytime via **Dashboard → Upgrade Plan**.

### Plans

| Plan    | Projects | AI Generations | Storage |
|---------|----------|----------------|---------|
| Free    | 3        | 50 / month     | 1 GB    |
| Studio  | 20       | 250 / month    | 5 GB    |
| Pro     | Unlimited| 1,000 / month  | 25 GB   |

---

## Dashboard

The Dashboard is your home screen, listing all your projects.

### Creating a Project

1. Click **New Project** (top-right button or the dashed card in the grid).
2. Enter a project name in the modal (default: *Untitled Project*).
3. Click **Create** — you are taken directly into the Studio.

### Renaming a Project

- Hover over any project card — a **pencil icon** appears next to the name.
- Click it to enter inline edit mode.
- Type a new name, then press **Enter** to save or **Esc** to cancel.

### Deleting a Project

- Hover over a project card — a **trash icon** appears (top-right corner of card).
- Click it — a confirmation overlay appears inside the card.
- Click **Delete** to confirm, or **Cancel** to dismiss.

### Account Overview Cards

Three summary cards appear below the header:

- **Plan** — shows your current plan with a link to manage/upgrade.
- **AI Generations** — shows how many AI generations you've used this month, with a progress bar and reset date.
- **Storage** — shows your current storage usage vs. your plan limit.

### Theme Toggle

A **sun / moon icon** appears in the top-right of the nav bar.

- Click to switch between **dark mode** (default warm brown-black palette) and **light mode** (warm off-white palette).
- Your preference is saved to `localStorage` and applied instantly on every page load — no flash.
- Respects your OS preference on first visit.

### User Menu

Click your **avatar / name** in the top-right corner to open the user dropdown:

- **Account** — personal details and email
- **Settings** — preferences and theme
- **Billing** — manage subscription and payment methods
- **Help & Docs** — this guide and support resources
- **Upgrade Plan** — jump to the pricing page
- **Sign Out** — ends your session

---

## Studio — DAW

The Studio is a full multi-track Digital Audio Workstation running entirely in the browser.

### Layout

```
┌──────────────────────────────────────────────────────┐
│  Transport Bar  (Play / Stop / BPM / Time Signature) │
├──────────┬───────────────────────────────────────────┤
│  Track   │  Arrangement / Piano Roll                 │
│  Headers │                                           │
├──────────┴───────────────────────────────────────────┤
│  Mixer Strip + Effects Rack                          │
└──────────────────────────────────────────────────────┘
```

### Adding a Track

1. Click **+ Add Track** at the bottom of the track list.
2. Choose a track type: **Synth**, **Drum Kit**, or **Audio** (sample player).
3. The track appears with a default color and instrument loaded.

### Track Header Controls

Each track has:
- **Mute** (M) — silences the track without removing it from playback.
- **Solo** (S) — isolates this track; all others are muted.
- **Volume** fader and **Pan** knob (right-click to reset to center).
- **Color swatch** — click to change the track accent color.
- **Track name** — double-click to rename inline.

### Arrangement View

- **Bar ruler** — shows bars/beats; click to move the playhead.
- **Zoom** — use **Ctrl + scroll** to zoom in/out on the timeline.
- **Clip** — colored regions on the timeline; drag to move, drag the right edge to resize.

---

## Piano Roll

The Piano Roll editor lets you draw and edit MIDI notes for any synth track.

### Opening the Piano Roll

- Double-click a clip in the Arrangement View, **or**
- Click the **piano icon** in the track header.

### Drawing Notes

- **Left-click** on the grid to draw a new note.
- **Click + drag** to set the note length while drawing.
- **Right-click** a note to delete it.
- **Drag** an existing note to move it (pitch + position).
- **Drag the right edge** of a note to resize its duration.

### Step Recording

1. Enable **Step Record** (the `●` button in the Piano Roll toolbar).
2. Press notes on your MIDI keyboard or the on-screen piano keys — each note is placed at the current step and the cursor advances automatically.
3. Disable Step Record when done.

### Grid Settings

- **Quantize** — snap notes to 1/4, 1/8, 1/16, 1/32 note grid.
- **Velocity** — each note has a velocity bar at the bottom of the roll; drag it to adjust.

---

## Synth & Instruments

### Built-in Synth

Each synth track includes a fully editable synthesiser panel:

- **Oscillator type** — Sine, Square, Sawtooth, Triangle
- **ADSR Envelope** — Attack, Decay, Sustain, Release sliders
- **Filter** — Cutoff frequency and Resonance knobs
- **Presets** — choose from built-in timbres (Lead, Pad, Bass, Keys, Pluck)

### Drum Kit

The Drum Kit is a 9-pad synthesized drum machine:

- Kick, Snare, Hi-Hat (closed/open), Clap, Tom (Hi/Lo), Rim, Crash, Ride
- Each pad has 16 step buttons — click to toggle a hit on that step.
- Right-click a pad to adjust velocity or pitch for that sound.
- All 16 EDM presets available via the **Preset** dropdown.

---

## Effects Rack

Each track has a per-track effects chain accessible from the track header or the mixer strip.

### Available Effects

| Effect       | Parameters                              |
|--------------|-----------------------------------------|
| **Reverb**   | Wet amount, Room size                   |
| **Delay**    | Wet amount, Delay time, Feedback        |
| **EQ (3-band)** | Low, Mid, High gain (dB)            |
| **Compressor** | Threshold, Ratio, Attack, Release    |
| **Distortion** | Drive amount                         |
| **Filter**   | Cutoff frequency, Filter type (LP/HP/BP)|

### Using Effects

1. Click **FX** in the track header.
2. Toggle individual effects on/off with the power button.
3. Adjust knobs by clicking and dragging vertically.
4. Right-click any knob to **Reset to default**.

---

## DJ Mode

DJ Mode provides a 4-deck virtual turntable setup modelled after professional DJ software like Traktor.

### Accessing DJ Mode

- Click the **DJ** tab in the top navigation inside the Studio.

### Loading Tracks

1. Click **LOAD** on any deck (A, B, C, or D).
2. Select an audio file from your computer (MP3, WAV, FLAC, OGG).
3. The waveform displays in the deck's waveform view.

### Deck Controls

| Button  | Action                                      |
|---------|---------------------------------------------|
| **CUE** | Set or jump back to the cue point           |
| **▶ / ⏸** | Play / Pause                             |
| **■**   | Stop and return to cue                      |
| **↺**   | Toggle loop                                 |
| **BPM** | Edit BPM field for pitch-matched beatmixing |

### Per-Deck Parameters

- **Volume** — deck output level (0–100%)
- **Playback Rate** — pitch/speed control (0.5× to 2.0×)
- **EQ Low / Mid / High** — 3-band equalizer (−15 to +6 dB)
- **Filter** — sweepable LP/HP filter
- **Reverb** — wet amount (0–100%)
- **Delay** — wet amount (0–100%)

### Crossfader

- **A/B Crossfader** — blends between Decks A and B.
- **C/D Crossfader** — blends between Decks C and D.
- The Master Volume knob controls the final output level.

---

## AI Assistant

The AI Assistant panel is docked on the right side of the Studio.

### What It Can Do

- **Generate drum patterns** — describe a style ("8-bar trap pattern, hi-hat rolls on 16th notes") and it creates a step-sequencer pattern for your drum track.
- **Generate melodies** — specify a mood, scale, and tempo feel; the AI returns a MIDI melody you can load into any synth track.
- **Suggest chord progressions** — ask for progressions in any key/scale; results load directly into the piano roll.
- **Mix advice** — ask questions about EQ, compression, or arrangement; the AI gives DAW-specific, actionable tips.
- **Explain techniques** — ask "what is sidechaining?" or "how do I make a punchy kick?" and get clear explanations.

### Using the Chat

1. Click the **AI** panel icon on the right sidebar.
2. Type your request in the chat input.
3. Press **Enter** or click **Send**.
4. The AI responds in the chat thread; generated patterns/melodies have an **Insert** button that places them directly into your project.

### Rate Limits

AI generations are counted per calendar month. Your remaining generations are shown in the Dashboard and in the AI panel header.

---

## Transport & Playback

The Transport Bar runs across the top of the Studio.

| Control         | Description                                          |
|-----------------|------------------------------------------------------|
| **▶ Play**      | Start playback from the current playhead position    |
| **⏸ Pause**     | Pause playback (playhead stays in place)             |
| **■ Stop**      | Stop playback and return to bar 1                    |
| **BPM**         | Click and drag (or type) to set the project tempo    |
| **Time Sig**    | Select numerator/denominator (e.g. 4/4, 3/4, 6/8)   |
| **Metronome**   | Toggle click track on/off during playback            |
| **Position**    | Live read-out showing current bar:beat:subdivision   |

---

## Mixer

The Mixer section shows a horizontal strip of channel faders, one per track.

- **Volume fader** — drag up/down to set track level.
- **Pan knob** — drag left/right to position in the stereo field.
- **M / S buttons** — Mute / Solo per channel.
- **FX button** — opens the per-track effects rack.
- **Send level** — route to the master reverb or delay return bus.

---

## Account & Settings

Navigate to **Account** from the user dropdown.

### Profile

- Change display name and profile picture.
- Update email address (requires re-verification).

### Billing

- View your current plan and next billing date.
- Upgrade or downgrade at any time — changes take effect immediately.
- View invoice history and download PDFs.
- Cancel subscription (remains active until the billing period ends).

### Settings

- **Theme** — Dark (default), Light, High Contrast.
- **Audio output device** — select your preferred audio interface.
- **MIDI input** — bind a MIDI keyboard or controller for step recording.
- **Autosave interval** — 30 seconds to 5 minutes (default: 1 minute).

---

## Keyboard Shortcuts

### Transport

| Shortcut     | Action           |
|--------------|------------------|
| `Space`      | Play / Pause     |
| `Shift+Space`| Stop             |
| `Home`       | Return to bar 1  |
| `M`          | Toggle metronome |

### Piano Roll

| Shortcut        | Action                      |
|-----------------|-----------------------------|
| Left-click      | Draw note                   |
| Right-click     | Delete note                 |
| `Ctrl+A`        | Select all notes            |
| `Delete`        | Delete selected notes       |
| `Ctrl+Z`        | Undo                        |
| `Ctrl+Shift+Z`  | Redo                        |
| `Ctrl+C / V`    | Copy / Paste selected notes |
| `Arrow keys`    | Nudge selected notes        |
| `Ctrl+Scroll`   | Zoom in/out (time axis)     |

### Arrangement

| Shortcut     | Action                      |
|--------------|-----------------------------|
| `Ctrl+D`     | Duplicate selected clip     |
| `Delete`     | Delete selected clip        |
| `Ctrl+Scroll`| Zoom in/out on timeline     |

---

## Logging & Observability

AIHQ uses a structured logging system built on **Winston** for the backend and ships frontend logs to the same pipeline.

### Starting the Full Stack with ELK

**Windows (PowerShell):**
```powershell
.\scripts\dev-elk.ps1
```

**macOS / Linux (Bash):**
```bash
bash scripts/dev-elk.sh
```

This opens four terminal windows:
1. **ELK Stack** — Elasticsearch + Kibana via Docker
2. **API Server** — Hono.js on port 3001 (logs ship to ES)
3. **Web Server** — Next.js on port 3000
4. **Log Stream** — live tail of recent log entries from Elasticsearch

### Kibana Dashboard

Once running, open [http://localhost:5601](http://localhost:5601):

1. Go to **Analytics → Discover**.
2. Click **Create data view**.
3. Set the index pattern to `aihq-api-*`.
4. Set the time field to `@timestamp`.
5. Click **Save** — you can now search and filter all API and frontend logs.

### Environment Variables

| Variable       | Description                                    | Default               |
|----------------|------------------------------------------------|-----------------------|
| `ES_URL`       | Elasticsearch URL (API server)                 | *(disabled)*          |
| `LOG_LEVEL`    | Minimum log level (`debug`/`info`/`warn`/`error`) | `debug` in dev     |
| `NODE_ENV`     | `development` or `production`                  | `development`         |

When `ES_URL` is not set, the API logs only to the console. The frontend always ships logs to the API's `/logs` endpoint (which then forwards to ES if configured).

---

*AIHQ — Built with Next.js 15, Tone.js, Turborepo, Hono.js, and Claude AI.*
