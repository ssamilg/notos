import { useEffect, useRef, useState } from "react";
import type { Note } from "@/types/domain";
import { BreadcrumbHeader } from "@/components/BreadcrumbHeader";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { NoteActionRail } from "@/components/NoteActionRail";
import { NoteContentFrame } from "@/components/NoteContentFrame";
import { TagDisplay } from "@/components/TagDisplay";
import { TagInput } from "@/components/TagInput";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { SaveSplitButton } from "@/components/SaveSplitButton";
import { GlowButton } from "@/components/glow-button";
import { MarkdownContent } from "@/components/MarkdownContent";

type NoteDraft = {
  title: string;
  text: string;
  tags: string[];
  is_completed: boolean;
};

type NoteDetailProps = {
  note: Note;
  projectName: string;
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
  projectName,
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
  const titleInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<NoteDraft>(() => noteToDraft(note));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const savedSnapshotRef = useRef<NoteDraft>(noteToDraft(note));

  useEffect(() => {
    if (isEditing) {
      titleInputRef.current?.focus();
    }
  }, [isEditing]);

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

  const editTabIndex = isEditing ? { title: 1, tags: 2, content: 3, save: 4 } : null;

  let saveSplitButton = (
    <SaveSplitButton
      disabled={isSaving}
      saving={isSaving}
      onSave={handleSave}
      onSaveAndExit={handleSaveAndExit}
      onSaveAndNew={handleSaveAndNew}
    />
  );

  if (editTabIndex) {
    saveSplitButton = (
      <SaveSplitButton
        disabled={isSaving}
        saving={isSaving}
        primaryTabIndex={editTabIndex.save}
        onSave={handleSave}
        onSaveAndExit={handleSaveAndExit}
        onSaveAndNew={handleSaveAndNew}
      />
    );
  }

  let actionContent = (
    <>
      <GlowButton
        type="button"
        onClick={onToggleComplete}
        disabled={isDeleting}
        tabIndex={0}
      >
        {note.is_completed ? "Mark Incomplete" : "Mark Done"}
      </GlowButton>

      <GlowButton type="button" onClick={startEditing} disabled={isDeleting} tabIndex={0}>
        Edit
      </GlowButton>

      <GlowButton
        type="button"
        className="mt-5"
        onClick={handleDeleteRequest}
        disabled={isDeleting}
        tabIndex={0}
      >
        Delete
      </GlowButton>
    </>
  );

  if (isEditing) {
    actionContent = (
      <>
        <GlowButton type="button" onClick={handleCancel} disabled={isSaving} tabIndex={-1}>
          Cancel
        </GlowButton>

        {saveSplitButton}
      </>
    );
  }

  let tagContent = <TagDisplay tags={note.tags} className="font-mono text-[1.1rem] glow-text" />;

  if (isEditing) {
    tagContent = (
      <TagInput
        variant="inline"
        value={draft.tags}
        onChange={(tags) => setDraft({ ...draft, tags })}
        options={tagSuggestions.map((tag) => ({ id: tag.id, name: tag.name }))}
        disabled={isSaving}
        tabIndex={2}
        className="font-mono text-[1.1rem]"
      />
    );
  }

  let bodyContent = (
    <MarkdownContent content={note.text.trim() ? note.text : "No content"} />
  );

  if (isEditing) {
    bodyContent = (
      <textarea
        className="input-edit-subtle text-body min-h-[50vh] w-full resize-none leading-relaxed"
        value={draft.text}
        placeholder="There should be some text here..."
        onChange={(event) => setDraft({ ...draft, text: event.target.value })}
        aria-label="Note content"
        disabled={isSaving}
        tabIndex={3}
      />
    );
  }

  const breadcrumbHeader = isEditing ? (
    <BreadcrumbHeader
      projectName={projectName}
      title={note.title}
      isEditing={isEditing}
      isCompleted={note.is_completed}
      titleValue={draft.title}
      updatedAt={note.updated_at}
      onProjectClick={onBack}
      onTitleChange={(value) => setDraft({ ...draft, title: value })}
      titleInputRef={titleInputRef}
      titleTabIndex={1}
      disabled={isSaving}
    />
  ) : (
    <BreadcrumbHeader
      projectName={projectName}
      title={note.title}
      isEditing={isEditing}
      isCompleted={note.is_completed}
      titleValue={draft.title}
      updatedAt={note.updated_at}
      onProjectClick={onBack}
      onTitleChange={(value) => setDraft({ ...draft, title: value })}
      titleInputRef={titleInputRef}
      disabled={isSaving}
    />
  );

  return (
    <article className="mx-auto w-full max-w-[950px]">
      {breadcrumbHeader}

      <div className="mb-8 flex flex-wrap gap-4">{tagContent}</div>

      <NoteActionRail variant="mobile">{actionContent}</NoteActionRail>

      <div className="flex flex-col items-start gap-0 md:flex-row md:gap-[60px]">
        <NoteContentFrame>{bodyContent}</NoteContentFrame>
        <NoteActionRail variant="desktop">{actionContent}</NoteActionRail>
      </div>

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
