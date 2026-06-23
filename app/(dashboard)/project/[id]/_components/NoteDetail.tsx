"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { GlowButton } from "@/components/glow-button";
import { Button } from "@/components/ui/button";

type NoteDraft = {
  title: string;
  text: string;
  tag: string | null;
};

type NoteDetailProps = {
  note: Note;
  projectId: string;
  initialEditing?: boolean;
  onSave: (input: { title?: string; text?: string; tag?: string | null }) => void;
  onDelete: () => void;
};

function noteToDraft(note: Note): NoteDraft {
  return {
    title: note.title,
    text: note.text,
    tag: note.tag,
  };
}

function draftsEqual(a: NoteDraft, b: NoteDraft) {
  return a.title === b.title && a.text === b.text && a.tag === b.tag;
}

export function NoteDetail({
  note,
  projectId,
  initialEditing = false,
  onSave,
  onDelete,
}: NoteDetailProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [draft, setDraft] = useState<NoteDraft>(() => noteToDraft(note));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const savedSnapshotRef = useRef<NoteDraft>(noteToDraft(note));

  function startEditing() {
    setDraft(noteToDraft(note));
    setIsEditing(true);
  }

  function handleSave() {
    if (draftsEqual(draft, savedSnapshotRef.current)) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    onSave(draft);
    savedSnapshotRef.current = draft;
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleDelete() {
    setIsDeleting(true);
    onDelete();
  }

  function handleFieldChange(field: keyof NoteDraft, value: string) {
    setDraft({
      ...draft,
      [field]: field === "tag" ? (value.trim() === "" ? null : value) : value,
    });
  }

  let headerActions = (
    <div className="flex shrink-0 gap-2">
      <GlowButton type="button" onClick={startEditing} disabled={isDeleting}>
        Edit
      </GlowButton>
      {/* <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting…" : "Delete"}
      </Button> */}
    </div>
  );

  if (isEditing) {
    headerActions = (
      <GlowButton type="button" onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving…" : "Save"}
      </GlowButton>
    );
  }

  let titleContent = (
    <h1 className="text-heading min-w-0 flex-1 glow-text-intense">{note.title}</h1>
  );

  if (isEditing) {
    titleContent = (
      <input
        className="input-edit text-heading min-w-0 flex-1 glow-text-intense"
        value={draft.title}
        onChange={(event) => handleFieldChange("title", event.target.value)}
        aria-label="Note title"
        disabled={isSaving}
      />
    );
  }

  let tagContent = (
    <span className="text-caption text-muted-foreground">
      {note.tag ? `[ ${note.tag} ]` : "No tag"}
    </span>
  );

  if (isEditing) {
    tagContent = (
      <input
        className="input-edit text-caption w-auto min-w-[6rem] text-muted-foreground"
        value={draft.tag ?? ""}
        onChange={(event) => handleFieldChange("tag", event.target.value)}
        placeholder="Tag"
        aria-label="Note tag"
        disabled={isSaving}
      />
    );
  }

  let bodyContent = (
    <div className="text-body max-w-3xl whitespace-pre-wrap">
      {note.text.trim() ? note.text : "No content"}
    </div>
  );

  if (isEditing) {
    bodyContent = (
      <textarea
        className="input-edit text-body min-h-[50vh] resize-none"
        value={draft.text}
        onChange={(event) => handleFieldChange("text", event.target.value)}
        aria-label="Note content"
        disabled={isSaving}
      />
    );
  }

  return (
    <article>
      <Link
        href={`/project/${projectId}`}
        className="text-label mb-8 inline-block text-muted-foreground hover:text-foreground"
      >
        ← Back to Notes
      </Link>

      <header className="mb-4 flex items-end justify-between gap-4">
        {titleContent}
        {headerActions}
      </header>

      <div className="mb-10 flex items-center justify-between gap-4">
        {tagContent}
        {!isEditing && (
          <DateDisplay updatedAt={note.updated_at} createdAt={note.created_at} />
        )}
      </div>

      {bodyContent}
    </article>
  );
}
