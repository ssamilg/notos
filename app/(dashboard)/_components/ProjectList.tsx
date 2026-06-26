"use client";

import { useEffect, useRef } from "react";
import type { ProjectWithCount } from "@/data/projects";
import { DateDisplay } from "@/components/DateDisplay";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ProjectListProps = {
  projects: ProjectWithCount[];
  isCreating: boolean;
  draftName: string;
  onCancelCreate: () => void;
  onDraftNameChange: (value: string) => void;
  onSaveCreate: () => void;
  onSelect: (id: string) => void;
};

export function ProjectList({
  projects,
  isCreating,
  draftName,
  onCancelCreate,
  onDraftNameChange,
  onSaveCreate,
  onSelect,
}: ProjectListProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const saveClickedRef = useRef(false);

  useEffect(() => {
    if (isCreating) {
      nameInputRef.current?.focus();
    }
  }, [isCreating]);

  function handleSaveClick() {
    saveClickedRef.current = true;
    onSaveCreate();
  }

  function handleNameBlur() {
    if (saveClickedRef.current) {
      saveClickedRef.current = false;
      return;
    }

    onCancelCreate();
  }

  function handleNameKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveClick();
    }

    if (event.key === "Escape") {
      onCancelCreate();
    }
  }

  let createRow = null;

  if (isCreating) {
    createRow = (
      <li>
        <div className="list-row flex items-center justify-between gap-4">
          <input
            ref={nameInputRef}
            className="input-bare list-row-title min-w-0 flex-1"
            value={draftName}
            onChange={(event) => onDraftNameChange(event.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            placeholder="Project name"
            aria-label="New project name"
          />
          <GlowButton
            type="button"
            className="shrink-0"
            onMouseDown={() => {
              saveClickedRef.current = true;
            }}
            onClick={handleSaveClick}
          >
            Save
          </GlowButton>
        </div>
      </li>
    );
  }

  let listBody = (
    <ul className="list-none p-0">
      {createRow}
      {projects.map((project) => (
        <li key={project.id}>
          <button
            type="button"
            className="list-row list-row-interactive flex items-center justify-between gap-4"
            onClick={() => onSelect(project.id)}
          >
            <span className="list-row-title">{project.name}</span>
            <div className="text-caption flex shrink-0 items-center gap-2">
              <span>
                {project.note_count} {project.note_count === 1 ? "Note" : "Notes"}
              </span>
              <span aria-hidden="true">|</span>
              <DateDisplay updatedAt={project.updated_at} createdAt={project.created_at} />
            </div>
          </button>
        </li>
      ))}
    </ul>
  );

  if (projects.length === 0 && !isCreating) {
    listBody = (
      <Alert>
        <AlertDescription className="py-8 text-center">
          No projects yet. Create one to get started.
        </AlertDescription>
      </Alert>
    );
  }

  if (isCreating && projects.length === 0) {
    listBody = <ul className="list-none p-0">{createRow}</ul>;
  }

  return (
    <section aria-label="Projects">{listBody}</section>
  );
}
