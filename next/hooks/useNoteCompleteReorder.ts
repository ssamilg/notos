"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { finalizeNoteListReorder } from "@/lib/query/noteCache";
import {
  NOTE_COMPLETE_REORDER_DELAY_MS,
  NOTE_ROW_EXIT_DURATION_MS,
} from "@/utils/notesCursor";

export function useNoteCompleteReorder(projectId: string) {
  const queryClient = useQueryClient();
  const [exitingNoteId, setExitingNoteId] = useState<string | null>(null);
  const [hiddenNoteId, setHiddenNoteId] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const exitHandledRef = useRef<string | null>(null);

  useEffect(() => {
    const timeouts = timeoutsRef.current;

    return () => {
      timeouts.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  const clearScheduledExit = useCallback(() => {
    timeoutsRef.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutsRef.current = [];
  }, []);

  const cancelScheduledExit = useCallback(() => {
    clearScheduledExit();
    exitHandledRef.current = null;
    setExitingNoteId(null);
    setHiddenNoteId(null);
  }, [clearScheduledExit]);

  const handleExitAnimationComplete = useCallback(
    (noteId: string) => {
      if (exitHandledRef.current === noteId) {
        return;
      }

      exitHandledRef.current = noteId;
      clearScheduledExit();
      setExitingNoteId(null);
      setHiddenNoteId(noteId);

      finalizeNoteListReorder(queryClient, projectId);
      setHiddenNoteId(null);
      exitHandledRef.current = null;
    },
    [clearScheduledExit, projectId, queryClient]
  );

  const scheduleExitAndReorder = useCallback(
    (noteId: string) => {
      clearScheduledExit();
      exitHandledRef.current = null;
      setExitingNoteId(null);
      setHiddenNoteId(null);

      const strikethroughTimeout = window.setTimeout(() => {
        setExitingNoteId(noteId);

        const fallbackTimeout = window.setTimeout(() => {
          handleExitAnimationComplete(noteId);
        }, NOTE_ROW_EXIT_DURATION_MS + 100);

        timeoutsRef.current.push(fallbackTimeout);
      }, NOTE_COMPLETE_REORDER_DELAY_MS);

      timeoutsRef.current.push(strikethroughTimeout);
    },
    [clearScheduledExit, handleExitAnimationComplete]
  );

  return {
    exitingNoteId,
    hiddenNoteId,
    scheduleExitAndReorder,
    cancelScheduledExit,
    handleExitAnimationComplete,
  };
}
