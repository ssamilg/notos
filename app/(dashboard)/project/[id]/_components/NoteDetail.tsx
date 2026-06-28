"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { TagDisplay } from "@/components/TagDisplay";
import { TagInput } from "@/components/TagInput";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { SaveSplitButton } from "@/components/SaveSplitButton";
import { GlowButton } from "@/components/glow-button";

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
  onToggleComplete: () => void;
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
  onToggleComplete,
  onSaveAndExit,
  onSaveAndNew,
}: NoteDetailProps) {
  const { data: tagSuggestions = [] } = useTagsQuery();
  const [isEditing, setIsEditing] = useState(isDraft);
  const [draft, setDraft] = useState<NoteDraft>(() => noteToDraft(note));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  function handleDeleteRequest() {
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    setIsDeleting(true);
    onDelete();
  }

  let headerActions = (
    <>
      <GlowButton type="button" onClick={handleDeleteRequest} disabled={isDeleting} tabIndex={0}>
        Delete
      </GlowButton>

      <GlowButton type="button" onClick={onToggleComplete} disabled={isDeleting} tabIndex={0}>
        {note.is_completed ? "Mark Incomplete" : "Mark Done"}
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

        <SaveSplitButton
          disabled={isSaving}
          saving={isSaving}
          onSave={handleSave}
          onSaveAndExit={handleSaveAndExit}
          onSaveAndNew={handleSaveAndNew}
        />
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

  let tagRowStart = <TagDisplay tags={note.tags} />;

  if (isEditing) {
    tagRowStart = (
      <TagInput
        tags={draft.tags}
        onChange={(tags) => setDraft({ ...draft, tags })}
        suggestions={tagSuggestions.map((tag) => ({ id: tag.id, name: tag.name }))}
        disabled={isSaving}
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

      <div className="mt-6">{bodyContent}</div>

      <ConfirmationModal
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete note?"
        description={`Are you sure you want to delete "${note.title}"? This cannot be undone immediately.`}
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </article>
  );
}
