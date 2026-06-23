"use client";

import Link from "next/link";
import type { Note } from "@/data/notes";
import { formatDate } from "@/utils/formatDate";
import { GlowButton } from "@/components/glow-button";
import { Button } from "@/components/ui/button";

type NoteDetailProps = {
  note: Note;
  projectId: string;
  onEdit: () => void;
  onDelete: () => void;
};

export function NoteDetail({ note, projectId, onEdit, onDelete }: NoteDetailProps) {
  return (
    <article>
      <Link
        href={`/project/${projectId}`}
        className="text-label mb-8 inline-block text-muted-foreground hover:text-foreground"
      >
        ← Back to Notes
      </Link>

      <header className="mb-10">
        <h1 className="text-heading mb-2 glow-text-intense">{note.title}</h1>
        <p className="text-caption">
          {note.tag ? `[ ${note.tag} ] · ` : null}
          <time dateTime={note.updated_at}>Updated {formatDate(note.updated_at)}</time>
        </p>
      </header>

      <div className="text-body max-w-3xl whitespace-pre-wrap">
        {note.text}
      </div>

      <div className="mt-10 flex gap-3">
        <GlowButton type="button" onClick={onEdit}>
          Edit in Canvas
        </GlowButton>
        <Button type="button" variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </article>
  );
}
