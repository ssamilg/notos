"use client";

import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { TagDisplay } from "@/components/TagDisplay";
import { cn } from "@/lib/utils";
import { NOTE_ROW_EXIT_DURATION_MS } from "@/utils/notesCursor";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { truncateText } from "@/utils/truncateText";
import { useEffect, useLayoutEffect, useRef } from "react";

type NoteListItemProps = {
  note: Note;
  isExiting?: boolean;
  onSelect: (noteId: string) => void;
  onToggleComplete: (noteId: string, isCompleted: boolean) => void;
  onExitAnimationComplete: (noteId: string) => void;
};

export function NoteListItem({
  note,
  isExiting = false,
  onSelect,
  onToggleComplete,
  onExitAnimationComplete,
}: NoteListItemProps) {
  const itemRef = useRef<HTMLLIElement>(null);
  const exitCompletedRef = useRef(false);

  const excerpt = note.text.trim()
    ? truncateText(stripMarkdown(note.text), 120)
    : "No content";

  let rowClassName = "list-row note-list-row";

  let entryClassName = "note-list-entry";

  if (note.is_completed) {
    entryClassName = cn(entryClassName, "note-row-completed");
  }

  let completeLabel = "Mark note complete";

  if (note.is_completed) {
    completeLabel = "Mark note incomplete";
  }

  let itemClassName = "note-list-item";

  if (isExiting) {
    itemClassName = cn(itemClassName, "note-list-item-exiting");
  }

  useLayoutEffect(() => {
    const node = itemRef.current;

    if (!node) {
      return;
    }

    if (!isExiting) {
      node.style.maxHeight = "";
      return;
    }

    const measuredHeight = node.scrollHeight;
    node.style.maxHeight = `${measuredHeight}px`;

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        node.style.maxHeight = "0px";
      });
    });
  }, [isExiting]);

  useEffect(() => {
    if (!isExiting) {
      exitCompletedRef.current = false;
      return;
    }

    const node = itemRef.current;

    if (!node) {
      return;
    }

    exitCompletedRef.current = false;

    function handleTransitionEnd(event: TransitionEvent) {
      if (exitCompletedRef.current || event.target !== node) {
        return;
      }

      if (event.propertyName !== "max-height") {
        return;
      }

      exitCompletedRef.current = true;
      onExitAnimationComplete(note.id);
    }

    const fallbackTimeout = window.setTimeout(() => {
      if (exitCompletedRef.current) {
        return;
      }

      exitCompletedRef.current = true;
      onExitAnimationComplete(note.id);
    }, NOTE_ROW_EXIT_DURATION_MS + 100);

    node.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      window.clearTimeout(fallbackTimeout);
      node.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [isExiting, note.id, onExitAnimationComplete]);

  return (
    <li ref={itemRef} className={itemClassName}>
      <div className={entryClassName}>
        <div className={rowClassName}>
          <div className="note-marker-gutter">
            <button
              type="button"
              className="note-marker"
              onClick={() => onToggleComplete(note.id, !note.is_completed)}
              aria-label={completeLabel}
              tabIndex={0}
            >
              <svg className="note-noise-svg" viewBox="0 0 48 24" preserveAspectRatio="none" aria-hidden="true">
                <path className="note-wave-path" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            className="list-row-interactive note-list-content"
            onClick={() => onSelect(note.id)}
            tabIndex={0}
          >
            <div className="note-title-row flex items-center justify-between gap-4">
              <span className="list-row-title note-title-text">{note.title}</span>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                <TagDisplay tags={note.tags} />
              </div>
            </div>
            <div className="note-excerpt-row mt-2 flex items-center justify-between gap-4">
              <span className="note-excerpt text-caption truncate text-muted-foreground">{excerpt}</span>
              <DateDisplay updatedAt={note.updated_at} createdAt={note.created_at} />
            </div>
          </button>
        </div>
      </div>
    </li>
  );
}
