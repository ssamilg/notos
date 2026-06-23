"use client";

import { useEffect, useId } from "react";
import type { ProjectWithCount } from "@/data/projects";
import { DateDisplay } from "@/components/DateDisplay";
import { GlowButton } from "@/components/glow-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ProjectListProps = {
  projects: ProjectWithCount[];
  showCreateForm: boolean;
  newName: string;
  onToggleCreate: () => void;
  onNameChange: (value: string) => void;
  onCreate: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancelCreate: () => void;
  onSelect: (id: string) => void;
};

export function ProjectList({
  projects,
  showCreateForm,
  newName,
  onToggleCreate,
  onNameChange,
  onCreate,
  onCancelCreate,
  onSelect,
}: ProjectListProps) {
  const headingId = useId();
  const createFormId = useId();
  const nameInputId = useId();

  useEffect(() => {
    if (showCreateForm) {
      document.getElementById(nameInputId)?.focus();
    }
  }, [showCreateForm, nameInputId]);

  let listBody = (
    <ul className="list-none p-0">
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

  if (projects.length === 0) {
    listBody = (
      <Alert>
        <AlertDescription className="py-8 text-center">
          No projects yet. Create one to get started.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <div className="list-header">
        <h1 id={headingId} className="text-heading glow-text">
          Projects
        </h1>
        <GlowButton type="button" aria-expanded={showCreateForm} aria-controls={createFormId} onClick={onToggleCreate}>
          {showCreateForm ? "Cancel" : "+ New Project"}
        </GlowButton>
      </div>

      {showCreateForm ? (
        <form
          id={createFormId}
          onSubmit={onCreate}
          className="mb-6 flex flex-col gap-3 border border-border bg-card p-4"
          aria-labelledby={headingId}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor={nameInputId}>Project name</Label>
            <Input
              id={nameInputId}
              value={newName}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="Enter project name"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" onClick={onCancelCreate}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      <section aria-labelledby={headingId}>{listBody}</section>
    </div>
  );
}
