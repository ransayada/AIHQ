"use client";

import { useEffect } from "react";
import { useAudioEngine } from "./useAudioEngine";
import { useUIStore } from "@/stores/uiStore";

export function useKeyboardShortcuts() {
  const { play, stop, isPlaying } = useAudioEngine();
  const { setBottomPanel } = useUIStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (isPlaying) {
            stop();
          } else {
            void play();
          }
          break;

        case "Digit1":
          if (!e.metaKey && !e.ctrlKey) setBottomPanel("sequencer");
          break;

        case "Digit2":
          if (!e.metaKey && !e.ctrlKey) setBottomPanel("piano-roll");
          break;

        case "Digit3":
          if (!e.metaKey && !e.ctrlKey) setBottomPanel("mixer");
          break;

        case "Digit4":
          if (!e.metaKey && !e.ctrlKey) setBottomPanel("synth");
          break;

        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [play, stop, isPlaying, setBottomPanel]);
}
