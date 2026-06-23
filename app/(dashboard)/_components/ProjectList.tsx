"use client";

import { useEffect, useId, useState } from "react";
import type { ProjectWithCount } from "@/data/projects";
import { formatDate } from "@/utils/formatDate";
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
  onEdit: (id: string, name: string) => void;
  onDelete: (id: string) => void;
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
  onEdit,
  onDelete,
}: ProjectListProps) {
  const headingId = useId();
  const createFormId = useId();
  const nameInputId = useId();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    if (showCreateForm) {
      document.getElementById(nameInputId)?.focus();
    }
  }, [showCreateForm, nameInputId]);

  function startEdit(project: ProjectWithCount) {
    setEditingId(project.id);
    setEditName(project.name);
  }

  function saveEdit(id: string) {
    const trimmed = editName.trim();

    if (!trimmed) {
      return;
    }

    onEdit(id, trimmed);
    setEditingId(null);
    setEditName("");
  }

  let listBody = (
    <ul className="list-none p-0">
      {projects.map((project) => {
        let row = (
          <div className="flex flex-1 cursor-pointer items-center justify-between gap-4">
            <button
              type="button"
              className="list-row-button"
              onClick={() => onSelect(project.id)}
            >
              {project.name}
            </button>
            <div className="text-caption shrink-0 text-right">
              <span className="ml-5 inline-block">
                {project.note_count} {project.note_count === 1 ? "Note" : "Notes"}
              </span>
              <span className="ml-5 inline-block">Updated: {formatDate(project.updated_at)}</span>
            </div>
          </div>
        );

        if (editingId === project.id) {
          row = (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                aria-label={`Edit ${project.name}`}
              />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={() => saveEdit(project.id)}>
                  Save
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          );
        }

        return (
          <li
            key={project.id}
            className="list-row flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            {row}
            {editingId !== project.id ? (
              <div className="flex gap-2 sm:ml-4">
                <Button type="button" variant="ghost" size="xs" onClick={() => startEdit(project)}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(project.id)}
                >
                  Delete
                </Button>
              </div>
            ) : null}
          </li>
        );
      })}
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
          className="mb-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
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
