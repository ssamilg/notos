"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectWithCount } from "@/data/projects";
import { DashboardListItem } from "@/next/app/(dashboard)/_components/DashboardListItem";
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
  onUpdateProject: (id: string, name: string) => void;
  onDeleteRequest: (project: ProjectWithCount) => void;
};

export function ProjectList({
  projects,
  isCreating,
  draftName,
  onCancelCreate,
  onDraftNameChange,
  onSaveCreate,
  onSelect,
  onUpdateProject,
  onDeleteRequest,
}: ProjectListProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
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

  const projectRows = projects.map((project) => {
    const noteLabel = project.note_count === 1 ? "Note" : "Notes";
    const meta = (
      <div className="text-caption mt-2 flex items-center gap-2">
        <span>
          {project.note_count} {noteLabel}
        </span>
        <span className="text-muted-foreground" aria-hidden="true">
          |
        </span>
        <DateDisplay updatedAt={project.updated_at} createdAt={project.created_at} />
      </div>
    );

    return (
      <DashboardListItem
        key={project.id}
        name={project.name}
        isEditing={editingProjectId === project.id}
        editInputLabel="Edit project name"
        meta={meta}
        onStartEdit={() => setEditingProjectId(project.id)}
        onCancelEdit={() => setEditingProjectId(null)}
        onSelect={() => onSelect(project.id)}
        onSave={(name) => onUpdateProject(project.id, name)}
        onDelete={() => onDeleteRequest(project)}
      />
    );
  });

  let listBody = (
    <ul className="list-none p-0">
      {createRow}
      {projectRows}
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

  return <section aria-label="Projects">{listBody}</section>;
}
