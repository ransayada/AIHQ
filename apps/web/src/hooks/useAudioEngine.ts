"use client";

import { useCallback } from "react";
import { audioEngine } from "@aihq/audio-engine";
import { useTransportStore } from "@/stores/transportStore";

/**
 * Hook that connects Zustand stores to the AudioEngine singleton.
 * This is the "bridge" between React state and Web Audio.
 */
export function useAudioEngine() {
  const {
    bpm,
    metronomeEnabled,
    isPlaying,
    setIsPlaying,
    setEngineInitialized,
    setPosition,
    setBpm: setStoreBpm,
    toggleMetronome: storeToggleMetronome,
    setTimeSignature: storeSetTimeSignature,
  } = useTransportStore();

  const play = useCallback(async () => {
    await audioEngine.initialize();
    setEngineInitialized(true);

    // Register position tracking
    audioEngine.transport.onPositionChange((pos) => setPosition(pos));

    audioEngine.transport.play();
    setIsPlaying(true);
  }, [setEngineInitialized, setIsPlaying, setPosition]);

  const stop = useCallback(() => {
    audioEngine.transport.stop();
    setIsPlaying(false);
    setPosition("0:0:0");
  }, [setIsPlaying, setPosition]);

  const pause = useCallback(() => {
    audioEngine.transport.pause();
    setIsPlaying(false);
  }, [setIsPlaying]);

  const setBpm = useCallback(
    (newBpm: number) => {
      audioEngine.setBpm(newBpm);
      setStoreBpm(newBpm);
    },
    [setStoreBpm]
  );

  const setTimeSignature = useCallback(
    (num: number, den: number) => {
      audioEngine.setTimeSignature(num, den);
      storeSetTimeSignature(num, den);
    },
    [storeSetTimeSignature]
  );

  const toggleMetronome = useCallback(() => {
    const next = !metronomeEnabled;
    audioEngine.transport.enableMetronome(next);
    storeToggleMetronome();
  }, [metronomeEnabled, storeToggleMetronome]);

  return {
    play,
    stop,
    pause,
    setBpm,
    setTimeSignature,
    toggleMetronome,
    isPlaying,
    bpm,
  };
}
