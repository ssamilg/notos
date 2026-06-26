"use client";

import { useEffect, useRef, useState } from "react";
import type { TagWithCount } from "@/data/tags";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type TagListProps = {
  tags: TagWithCount[];
  isCreating: boolean;
  draftName: string;
  onCancelCreate: () => void;
  onDraftNameChange: (value: string) => void;
  onSaveCreate: () => void;
  onUpdateTag: (id: string, name: string) => void;
  onDelete: (tag: TagWithCount) => void;
};

export function TagList({
  tags,
  isCreating,
  draftName,
  onCancelCreate,
  onDraftNameChange,
  onSaveCreate,
  onUpdateTag,
  onDelete,
}: TagListProps) {
  const createInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const createSaveClickedRef = useRef(false);
  const editSaveClickedRef = useRef(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const activeEditingId =
    editingTagId && tags.some((tag) => tag.id === editingTagId) ? editingTagId : null;

  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus();
    }
  }, [isCreating]);

  useEffect(() => {
    if (activeEditingId) {
      editInputRef.current?.focus();
      editInputRef.current?.select();
    }
  }, [activeEditingId]);

  function handleCreateSaveClick() {
    createSaveClickedRef.current = true;
    onSaveCreate();
  }

  function handleCreateBlur() {
    if (createSaveClickedRef.current) {
      createSaveClickedRef.current = false;
      return;
    }

    onCancelCreate();
  }

  function handleCreateKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCreateSaveClick();
    }

    if (event.key === "Escape") {
      onCancelCreate();
    }
  }

  function startEditing(tag: TagWithCount) {
    setEditingTagId(tag.id);
    setEditDraft(tag.name);
  }

  function cancelEditing() {
    setEditingTagId(null);
    setEditDraft("");
  }

  function handleEditSaveClick() {
    if (!activeEditingId) {
      return;
    }

    const trimmed = editDraft.trim();

    if (!trimmed) {
      cancelEditing();
      return;
    }

    editSaveClickedRef.current = true;
    onUpdateTag(activeEditingId, trimmed);
    cancelEditing();
  }

  function handleEditBlur() {
    if (editSaveClickedRef.current) {
      editSaveClickedRef.current = false;
      return;
    }

    cancelEditing();
  }

  function handleEditKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleEditSaveClick();
    }

    if (event.key === "Escape") {
      cancelEditing();
    }
  }

  let createRow = null;

  if (isCreating) {
    createRow = (
      <li>
        <div className="list-row flex items-center justify-between gap-4">
          <input
            ref={createInputRef}
            className="input-bare list-row-title min-w-0 flex-1"
            value={draftName}
            onChange={(event) => onDraftNameChange(event.target.value)}
            onBlur={handleCreateBlur}
            onKeyDown={handleCreateKeyDown}
            placeholder="Tag name"
            aria-label="New tag name"
            tabIndex={0}
          />
          <GlowButton
            type="button"
            className="shrink-0"
            onMouseDown={() => {
              createSaveClickedRef.current = true;
            }}
            onClick={handleCreateSaveClick}
            tabIndex={0}
          >
            Save
          </GlowButton>
        </div>
      </li>
    );
  }

  const tagRows = tags.map((tag) => {
    if (activeEditingId === tag.id) {
      return (
        <li key={tag.id}>
          <div className="list-row flex items-center justify-between gap-4">
            <input
              ref={editInputRef}
              className="input-bare list-row-title min-w-0 flex-1"
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              onBlur={handleEditBlur}
              onKeyDown={handleEditKeyDown}
              aria-label="Edit tag name"
              tabIndex={0}
            />


            <div className="flex shrink-0 items-center gap-2">
              <GlowButton type="button" onClick={cancelEditing} tabIndex={0}>
                Cancel
              </GlowButton>
              <GlowButton type="button" onClick={() => onDelete(tag)} tabIndex={0}>
                Delete
              </GlowButton>
              <GlowButton
                type="button"
                onMouseDown={() => {
                  editSaveClickedRef.current = true;
                }}
                onClick={handleEditSaveClick}
                tabIndex={0}
              >
                Save
              </GlowButton>
            </div>
          </div>
        </li>
      );
    }

    return (
      <li key={tag.id} className="list-row list-row-interactive flex items-center justify-between gap-4">
        <div>
          <span className="list-row-title">[ {tag.name} ]</span>
          <p className="text-caption text-muted-foreground">
            {tag.note_count} {tag.note_count === 1 ? "note" : "notes"}
          </p>
        </div>
        <GlowButton type="button" onClick={() => startEditing(tag)} tabIndex={0}>
          Edit
        </GlowButton>
      </li>
    );
  });

  let listBody = (
    <ul className="list-none p-0">
      {createRow}
      {tagRows}
    </ul>
  );

  if (tags.length === 0 && !isCreating) {
    listBody = (
      <Alert>
        <AlertDescription className="py-8 text-center">
          No tags yet. Add one to get started.
        </AlertDescription>
      </Alert>
    );
  }

  if (isCreating && tags.length === 0) {
    listBody = <ul className="list-none p-0">{createRow}</ul>;
  }

  return <section aria-label="Tags">{listBody}</section>;
}
