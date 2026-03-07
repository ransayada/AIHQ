import * as Tone from "tone";
import { DJDeck, type DeckId } from "./DJDeck";

const DECK_IDS: DeckId[] = ["A", "B", "C", "D"];

/**
 * DJEngine — manages 4 independent DJ decks + a shared master output.
 *
 * Follows the same lazy-singleton pattern as AudioEngine.
 * Must be used only from client-side code (requires AudioContext / browser).
 *
 * Usage:
 *   const engine = getDJEngine();
 *   await engine.getDeck("A").load(objectUrl);
 *   engine.getDeck("A").play();
 */
export class DJEngine {
  private static _instance: DJEngine | null = null;

  private _masterOut: Tone.Channel;
  private _decks:     Map<DeckId, DJDeck>;

  private constructor() {
    // Master output with limiter to prevent clipping from multiple decks
    this._masterOut = new Tone.Channel({ volume: 0 }).toDestination();
    this._decks     = new Map(
      DECK_IDS.map((id) => [id, new DJDeck(id, this._masterOut)])
    );
  }

  static getInstance(): DJEngine {
    if (!DJEngine._instance) {
      DJEngine._instance = new DJEngine();
    }
    return DJEngine._instance;
  }

  /** Get a deck by ID. Throws if id is not one of A/B/C/D. */
  getDeck(id: DeckId): DJDeck {
    const deck = this._decks.get(id);
    if (!deck) throw new Error(`DJEngine: unknown deck "${id}"`);
    return deck;
  }

  /** All deck IDs. */
  get deckIds(): DeckId[] {
    return DECK_IDS;
  }

  /**
   * Master volume in dB, range -60 to 6.
   * Applied after all decks sum into the master bus.
   */
  setMasterVolume(db: number): void {
    this._masterOut.volume.value = Math.max(-60, Math.min(6, db));
  }

  /**
   * Ensure the AudioContext is running (required before first playback).
   * Call this from a user-gesture handler (e.g., click on Play).
   */
  async ensureStarted(): Promise<void> {
    await Tone.start();
  }

  dispose(): void {
    this._decks.forEach((d) => d.dispose());
    this._masterOut.dispose();
    DJEngine._instance = null;
  }
}

/** Singleton DJ engine instance. Initialised lazily on first access. */
export const djEngine = DJEngine.getInstance();
