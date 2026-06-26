"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Note } from "@/data/notes";
import type { NoteFilters } from "@/lib/query/keys";
import { useTagsQuery } from "@/hooks/queries/useTagsQuery";
import { DateDisplay } from "@/components/DateDisplay";
import { TagAutocomplete } from "@/components/TagAutocomplete";
import { TagLabel } from "@/components/TagLabel";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { truncateText } from "@/utils/truncateText";

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

  let headerTitle = (
    <button
      type="button"
      className="text-heading glow-text cursor-pointer text-left"
      onClick={startEditingName}
      tabIndex={0}
    >
      {projectName}
    </button>
  );

  if (isEditingName) {
    headerTitle = (
      <input
        ref={nameInputRef}
        className="input-bare text-heading glow-text w-full"
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={saveProjectName}
        onKeyDown={handleNameKeyDown}
        aria-label="Project name"
        tabIndex={0}
      />
    );
  }

  let listBody = (
    <ul className="list-none p-0">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            type="button"
            className="list-row list-row-interactive"
            onClick={() => onSelectNote(note.id)}
            tabIndex={0}
          >
            <div className="flex items-center justify-between gap-4">
              <span
                className={`list-row-title ${
                  note.is_completed ? "text-muted-foreground line-through" : ""
                }`}
              >
                {note.title}
              </span>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {note.tags.map((tag) => (
                  <TagLabel key={`${note.id}-${tag}`} name={tag} />
                ))}
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span
                className={`text-caption truncate ${
                  note.is_completed ? "text-muted-foreground line-through" : "text-muted-foreground"
                }`}
              >
                {note.text.trim() ? truncateText(note.text, 120) : "No content"}
              </span>
              <DateDisplay
                updatedAt={note.updated_at}
                createdAt={note.created_at}
                className="shrink-0"
              />
            </div>
          </button>
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

  let loadMoreIndicator = null;

  if (loadingMore) {
    loadMoreIndicator = (
      <p className="text-caption py-4 text-center text-muted-foreground">Loading more notes…</p>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard"
        prefetch={false}
        className="text-label mb-6 inline-block cursor-pointer text-muted-foreground hover:text-foreground"
        onClick={(event) => {
          event.preventDefault();
          onBack();
        }}
        tabIndex={0}
      >
        ← Back to Projects
      </Link>

      <div className="list-header">
        {headerTitle}
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
          placeholder="Search notes…"
          aria-label="Search notes"
          tabIndex={0}
        />

        <TagAutocomplete
          tags={tags.map((tag) => ({ id: tag.id, name: tag.name }))}
          value={urlTagId ?? null}
          onValueChange={(tagId) => {
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
