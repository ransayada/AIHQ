/**
 * Stub for @magenta/music/esm/music_rnn used in Vitest.
 * Prevents Vite from trying to resolve the actual WASM package during tests.
 */
export class MusicRNN {
  constructor(_checkpointUrl: string) {}
  async initialize() {}
  async continueSequence(
    _seq: unknown,
    _steps: number,
    _temperature: number
  ): Promise<{ notes: never[] }> {
    return { notes: [] };
  }
  dispose() {}
}
