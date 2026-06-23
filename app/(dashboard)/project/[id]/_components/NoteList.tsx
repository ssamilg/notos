"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Note } from "@/data/notes";
import { DateDisplay } from "@/components/DateDisplay";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { truncateText } from "@/utils/truncateText";

type NoteListProps = {
  projectName: string;
  notes: Note[];
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => string | undefined;
  onRenameProject: (name: string) => void;
};

export function NoteList({
  projectName,
  notes,
  onSelectNote,
  onCreateNote,
  onRenameProject,
}: NoteListProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(projectName);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingName) {
      nameInputRef.current?.focus();
      nameInputRef.current?.select();
    }
  }, [isEditingName]);

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
      className="text-heading glow-text text-left"
      onClick={startEditingName}
    >
      {projectName}
    </button>
  );

  if (isEditingName) {
    headerTitle = (
      <input
        ref={nameInputRef}
        className="input-edit text-heading glow-text w-full"
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={saveProjectName}
        onKeyDown={handleNameKeyDown}
        aria-label="Project name"
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
          >
            <div className="flex items-center justify-between gap-4">
              <span className="list-row-title">{note.title}</span>
              <span className="text-caption shrink-0">
                {note.tag ? `[ ${note.tag} ]` : null}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-4">
              <span className="text-caption truncate text-muted-foreground">
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

  return (
    <div>
      <Link
        href="/dashboard"
        className="text-label mb-6 inline-block text-muted-foreground hover:text-foreground"
      >
        ← Back to Projects
      </Link>

      <div className="list-header">
        {headerTitle}
        <GlowButton type="button" onClick={handleNewNote}>
          + New Note
        </GlowButton>
      </div>

      <section aria-label={`Notes in ${projectName}`}>{listBody}</section>
    </div>
  );
}
