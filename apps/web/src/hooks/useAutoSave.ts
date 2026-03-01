"use client";

import { useEffect, useRef, useCallback } from "react";
import { useTracksStore } from "@/stores/tracksStore";
import { useTransportStore } from "@/stores/transportStore";
import { ProjectDataSchema } from "@aihq/shared";
const AUTOSAVE_DEBOUNCE_MS = 3000;

export function useAutoSave(projectId: string) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastSavedRef = useRef<string>("");

  const save = useCallback(async () => {
    if (isSavingRef.current) return;
    const { tracks } = useTracksStore.getState();
    const { bpm, timeSignatureNumerator, timeSignatureDenominator } = useTransportStore.getState();

    const projectData = ProjectDataSchema.parse({
      version: "1",
      bpm,
      timeSignatureNumerator,
      timeSignatureDenominator,
      tracks,
    });

    const serialized = JSON.stringify(projectData);
    if (serialized === lastSavedRef.current) return; // No changes

    isSavingRef.current = true;
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: projectData }),
      });
      lastSavedRef.current = serialized;
    } catch (err) {
      console.warn("Auto-save failed:", err);
    } finally {
      isSavingRef.current = false;
    }
  }, [projectId]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(save, AUTOSAVE_DEBOUNCE_MS);
  }, [save]);

  useEffect(() => {
    const unsubTracks = useTracksStore.subscribe(scheduleSave);
    const unsubBpm = useTransportStore.subscribe(
      (s) => s.bpm,
      scheduleSave
    );

    return () => {
      unsubTracks();
      unsubBpm();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [scheduleSave]);

  return { save };
}
