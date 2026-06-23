"use client";

import Link from "next/link";
import type { Note } from "@/data/notes";
import { formatDate } from "@/utils/formatDate";
import { GlowButton } from "@/components/glow-button";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type NoteListProps = {
  projectName: string;
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onOpenCanvas: () => void;
  onDeleteNote: (noteId: string) => void;
};

export function NoteList({
  projectName,
  notes,
  onSelectNote,
  onOpenCanvas,
  onDeleteNote,
}: NoteListProps) {
  let listBody = (
    <ul className="list-none p-0">
      {notes.map((note) => (
        <li
          key={note.id}
          className="list-row flex items-center justify-between gap-4"
        >
          <button
            type="button"
            className="list-row-button"
            onClick={() => onSelectNote(note.id)}
          >
            {note.title}
          </button>
          <div className="text-caption flex shrink-0 items-center gap-5">
            {note.tag ? <span>[ {note.tag} ]</span> : null}
            <time dateTime={note.updated_at}>{formatDate(note.updated_at)}</time>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="text-destructive hover:text-destructive"
              aria-label={`Delete ${note.title}`}
              onClick={() => onDeleteNote(note.id)}
            >
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );

  if (notes.length === 0) {
    listBody = (
      <Alert>
        <AlertDescription className="py-8 text-center">
          No notes yet. Add one to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        className="text-label mb-6 inline-block text-muted-foreground hover:text-foreground"
      >
        ← Back to Projects
      </Link>

      <div className="list-header">
        <h1 className="text-heading glow-text">{projectName}</h1>
        <div className="flex gap-2">
          <GlowButton type="button" onClick={onOpenCanvas}>
            + New Note
          </GlowButton>
        </div>
      </div>

      <section aria-label={`Notes in ${projectName}`}>{listBody}</section>
    </div>
  );
}
