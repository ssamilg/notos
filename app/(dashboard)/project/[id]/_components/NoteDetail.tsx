"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { GlowButton } from "@/components/glow-button";
import { Badge } from "@/components/ui/badge";

const MarkdownContent = dynamic(
  () => import("@/components/MarkdownContent").then((module) => module.MarkdownContent),
  {
    loading: () => (
      <p className="text-body text-muted-foreground">Loading preview…</p>
    ),
  }
);

type NoteDraft = {
  title: string;
  text: string;
  tags: string[];
  is_completed: boolean;
};

type NoteDetailProps = {
  note: Note;
  projectId: string;
  isDraft?: boolean;
  onSave: (input: {
    title?: string;
    text?: string;
    tags?: string[];
    is_completed?: boolean;
  }) => void;
  onCancel: () => void;
  onBack: () => void;
  onDelete: () => void;
  onSaveAndExit?: (input: {
    title?: string;
    text?: string;
    tags?: string[];
    is_completed?: boolean;
  }) => void;
  onSaveAndNew?: (input: {
    title?: string;
    text?: string;
    tags?: string[];
    is_completed?: boolean;
  }) => void;
};

function noteToDraft(note: Note): NoteDraft {
  return {
    title: note.title,
    text: note.text,
    tags: note.tags,
    is_completed: note.is_completed,
  };
}

function parseTagsInput(value: string): string[] {
  return [
    ...new Set(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    ),
  ];
}

function formatTagsInput(tags: string[]): string {
  return tags.join(", ");
}

function draftsEqual(a: NoteDraft, b: NoteDraft) {
  return (
    a.title === b.title &&
    a.text === b.text &&
    a.is_completed === b.is_completed &&
    a.tags.join(",") === b.tags.join(",")
  );
}

export function NoteDetail({
  note,
  projectId,
  isDraft = false,
  onSave,
  onCancel,
  onBack,
  onDelete,
  onSaveAndExit,
  onSaveAndNew,
}: NoteDetailProps) {
  const [isEditing, setIsEditing] = useState(isDraft);
  const [draft, setDraft] = useState<NoteDraft>(() => noteToDraft(note));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const savedSnapshotRef = useRef<NoteDraft>(noteToDraft(note));

  function startEditing() {
    setDraft(noteToDraft(note));
    setIsEditing(true);
  }

  function buildSaveInput(): {
    title: string;
    text: string;
    tags: string[];
    is_completed: boolean;
  } {
    const trimmedTitle = draft.title.trim();

    return {
      title: trimmedTitle || "Untitled",
      text: draft.text,
      tags: draft.tags,
      is_completed: draft.is_completed,
    };
  }

  function handleSave() {
    const input = buildSaveInput();

    if (isDraft && !draft.title.trim()) {
      onCancel();
      return;
    }

    if (draftsEqual(draft, savedSnapshotRef.current) && !isDraft) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    onSave(input);
    savedSnapshotRef.current = {
      title: input.title,
      text: input.text,
      tags: input.tags,
      is_completed: input.is_completed,
    };
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleSaveAndExit() {
    const input = buildSaveInput();

    if (isDraft && !draft.title.trim()) {
      onCancel();
      return;
    }

    setIsSaving(true);

    if (onSaveAndExit) {
      onSaveAndExit(input);
    } else {
      onSave(input);
      onBack();
    }

    savedSnapshotRef.current = {
      title: input.title,
      text: input.text,
      tags: input.tags,
      is_completed: input.is_completed,
    };
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleSaveAndNew() {
    const input = buildSaveInput();

    if (isDraft && !draft.title.trim()) {
      onCancel();
      return;
    }

    setIsSaving(true);

    if (onSaveAndNew) {
      onSaveAndNew(input);
    } else {
      onSave(input);
    }

    savedSnapshotRef.current = {
      title: input.title,
      text: input.text,
      tags: input.tags,
      is_completed: input.is_completed,
    };
    setIsSaving(false);
    setIsEditing(false);
  }

  function handleCancel() {
    if (isDraft) {
      onCancel();
      return;
    }

    setDraft(savedSnapshotRef.current);
    setIsEditing(false);
  }

  function handleDelete() {
    setIsDeleting(true);
    onDelete();
  }

  function handleTagsChange(value: string) {
    setDraft({
      ...draft,
      tags: parseTagsInput(value),
    });
  }

  let headerActions = (
    <>
      <GlowButton type="button" onClick={handleDelete} disabled={isDeleting} tabIndex={0}>
        {isDeleting ? "Deleting…" : "Delete"}
      </GlowButton>

      <GlowButton type="button" onClick={startEditing} disabled={isDeleting} tabIndex={0}>
        Edit
      </GlowButton>
    </>
  );

  if (isEditing) {
    headerActions = (
      <>
        <GlowButton type="button" onClick={handleCancel} disabled={isSaving} tabIndex={0}>
          Cancel
        </GlowButton>

        <GlowButton type="button" onClick={handleSaveAndExit} disabled={isSaving} tabIndex={0}>
          {isSaving ? "Saving…" : "Save & Exit"}
        </GlowButton>

        <GlowButton type="button" onClick={handleSaveAndNew} disabled={isSaving} tabIndex={0}>
          {isSaving ? "Saving…" : "Save & New Note"}
        </GlowButton>

        <GlowButton type="button" onClick={handleSave} disabled={isSaving} tabIndex={0}>
          {isSaving ? "Saving…" : "Save"}
        </GlowButton>
      </>
    );
  }

  let titleContent = (
    <h1
      className={`text-heading min-w-0 flex-1 glow-text-intense ${
        note.is_completed ? "text-muted-foreground line-through" : ""
      }`}
    >
      {note.title}
    </h1>
  );

  if (isEditing) {
    titleContent = (
      <input
        className="input-edit text-heading min-w-0 flex-1 glow-text-intense"
        value={draft.title}
        onChange={(event) => setDraft({ ...draft, title: event.target.value })}
        aria-label="Note title"
        disabled={isSaving}
        tabIndex={0}
      />
    );
  }

  let tagRowStart = (
    <div className="flex flex-wrap gap-2">
      {note.tags.length > 0 ? (
        note.tags.map((tag) => (
          <Badge key={tag} variant="outline">
            {tag}
          </Badge>
        ))
      ) : (
        <span className="text-caption text-muted-foreground">No tags</span>
      )}
    </div>
  );

  if (isEditing) {
    tagRowStart = (
      <input
        className="input-edit text-caption min-w-0 flex-1 text-muted-foreground"
        value={formatTagsInput(draft.tags)}
        onChange={(event) => handleTagsChange(event.target.value)}
        placeholder="Tags (comma-separated)"
        aria-label="Note tags"
        disabled={isSaving}
        tabIndex={0}
      />
    );
  }

  let bodyContent = (
    <MarkdownContent content={note.text.trim() ? note.text : "No content"} />
  );

  if (isEditing) {
    bodyContent = (
      <textarea
        className="input-edit text-body min-h-[50vh] resize-none"
        value={draft.text}
        placeholder="There should be some text here..."
        onChange={(event) => setDraft({ ...draft, text: event.target.value })}
        aria-label="Note content"
        disabled={isSaving}
        tabIndex={0}
      />
    );
  }

  let completionRow = null;

  if (isEditing) {
    completionRow = (
      <label className="text-label flex items-center gap-2">
        <input
          type="checkbox"
          checked={draft.is_completed}
          onChange={(event) =>
            setDraft({ ...draft, is_completed: event.target.checked })
          }
          disabled={isSaving}
          tabIndex={0}
        />
        Mark as completed
      </label>
    );
  } else if (note.is_completed) {
    completionRow = (
      <span className="text-caption text-muted-foreground">Completed</span>
    );
  }

  return (
    <article>
      <Link
        href={`/project/${projectId}`}
        prefetch={false}
        className="text-label mb-8 inline-block cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={(event) => {
          event.preventDefault();
          onBack();
        }}
        tabIndex={0}
      >
        ← Back to Notes
      </Link>

      <header className="mb-4 flex items-end justify-between gap-2">
        {titleContent}
        {headerActions}
      </header>

      <div className="mb-4 flex items-center justify-between gap-4">
        {tagRowStart}
        <div className="flex shrink-0 items-center gap-4">
          {isEditing ? null : (
            <DateDisplay updatedAt={note.updated_at} createdAt={note.created_at} />
          )}
        </div>
      </div>

      {completionRow}

      <div className="mt-6">{bodyContent}</div>
    </article>
  );
}
