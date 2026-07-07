import { useEffect, useRef, useState } from "react";
import type { Note } from "@/types/domain";
import type { NoteFilters } from "@/lib/query/keys";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { NoteListItem } from "@/features/project/NoteListItem";
import { TagInput } from "@/components/TagInput";
import { BreadcrumbHeader } from "@/components/BreadcrumbHeader";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type NoteListProps = {
  projectName: string;
  notes: Note[];
  filters: NoteFilters;
  loadingMore: boolean;
  hasMore: boolean;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => string | undefined;
  onRenameProject: (name: string) => void;
  onBack: () => void;
  onLoadMore: () => void;
  onApplyFilters: (search: string, tagId: string | null) => void;
  exitingNoteId?: string | null;
  hiddenNoteId?: string | null;
  onExitAnimationComplete: (noteId: string) => void;
  onToggleComplete: (noteId: string, isCompleted: boolean) => void;
};

export function NoteList({
  projectName,
  notes,
  filters,
  loadingMore,
  hasMore,
  onSelectNote,
  onCreateNote,
  onRenameProject,
  onBack,
  onLoadMore,
  onApplyFilters,
  exitingNoteId,
  hiddenNoteId,
  onExitAnimationComplete,
  onToggleComplete,
}: NoteListProps) {
  const urlSearch = filters.search ?? "";
  const urlTagId = filters.tagId;
  const { data: tags = [] } = useTagsQuery();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApplyFilters(searchInputRef.current?.value ?? "", urlTagId ?? null);
  }

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !loadingMore) {
          onLoadMore();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, onLoadMore]);

  function startEditingName() {
    setDraftName(projectName);
    setIsEditingName(true);
  }

  function saveProjectName() {
    const trimmed = draftName.trim();

    if (trimmed && trimmed !== projectName) {
      onRenameProject(trimmed);
    } else {
      setDraftName(projectName);
    }

    setIsEditingName(false);
  }

  function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      saveProjectName();
    }

    if (event.key === "Escape") {
      setDraftName(projectName);
      setIsEditingName(false);
    }
  }

  function handleNewNote() {
    const noteId = onCreateNote();

    if (noteId) {
      onSelectNote(noteId);
    }
  }

  let listBody = (
    <ul className="note-list list-none p-0">
      {notes
        .filter((note) => note.id !== hiddenNoteId)
        .map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            isExiting={exitingNoteId === note.id}
            onSelect={onSelectNote}
            onToggleComplete={onToggleComplete}
            onExitAnimationComplete={onExitAnimationComplete}
          />
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

  let loadMoreIndicator = null;

  if (loadingMore) {
    loadMoreIndicator = (
      <p className="text-caption py-4 text-center text-muted-foreground">Loading more notes…</p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <BreadcrumbHeader
          parentLabel="projects"
          title={projectName}
          onParentClick={onBack}
          isEditing={isEditingName}
          titleValue={draftName}
          onTitleChange={setDraftName}
          onTitleClick={startEditingName}
          onTitleBlur={saveProjectName}
          onTitleKeyDown={handleNameKeyDown}
          titleInputRef={nameInputRef}
          titleAriaLabel="Project name"
          className="mb-0 min-w-0 flex-1"
        />
        <GlowButton type="button" onClick={handleNewNote} tabIndex={0}>
          + New Note
        </GlowButton>
      </div>

      <form
        className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center"
        onSubmit={handleSearchSubmit}
      >
        <input
          key={urlSearch}
          ref={searchInputRef}
          className="input-bare text-body flex-1"
          defaultValue={urlSearch}
          placeholder="> Search notes…"
          aria-label="Search notes"
          tabIndex={0}
        />

        <TagInput
          mode="single"
          options={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
          value={urlTagId ?? null}
          onChange={(tagId) => {
            onApplyFilters(searchInputRef.current?.value ?? "", tagId);
          }}
        />

        <GlowButton type="submit" tabIndex={0}>
          Search
        </GlowButton>
      </form>

      <section aria-label={`Notes in ${projectName}`}>
        {listBody}
        <div ref={sentinelRef} aria-hidden="true" />
        {loadMoreIndicator}
      </section>
    </div>
  );
}
