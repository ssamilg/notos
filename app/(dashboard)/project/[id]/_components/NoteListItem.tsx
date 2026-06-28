"use client";

import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { TagDisplay } from "@/components/TagDisplay";
import { cn } from "@/lib/utils";
import { stripMarkdown } from "@/utils/stripMarkdown";
import { truncateText } from "@/utils/truncateText";

type NoteListItemProps = {
  note: Note;
  onSelect: (noteId: string) => void;
  onToggleComplete: (noteId: string, isCompleted: boolean) => void;
};

export function NoteListItem({ note, onSelect, onToggleComplete }: NoteListItemProps) {
  const excerpt = note.text.trim()
    ? truncateText(stripMarkdown(note.text), 120)
    : "No content";

  let rowClassName = "list-row note-list-row";

  if (note.is_completed) {
    rowClassName = cn(rowClassName, "note-row-completed");
  }

  let completeLabel = "Mark note complete";

  if (note.is_completed) {
    completeLabel = "Mark note incomplete";
  }

  return (
    <li>
      <div className={rowClassName}>
        <div className="note-marker-hover-actions">
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
    </li>
  );
}
