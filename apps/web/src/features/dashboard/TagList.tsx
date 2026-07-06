"use client";

import { useEffect, useRef, useState } from "react";
import type { TagWithCount } from "@/types/domain";
import { DashboardListItem } from "@/features/dashboard/DashboardListItem";
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
  const createSaveClickedRef = useRef(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);

  useEffect(() => {
    if (isCreating) {
      createInputRef.current?.focus();
    }
  }, [isCreating]);

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
    const noteLabel = tag.note_count === 1 ? "note" : "notes";
    const meta = (
      <p className="text-caption mt-2 text-muted-foreground">
        {tag.note_count} {noteLabel}
      </p>
    );

    return (
      <DashboardListItem
        key={tag.id}
        name={tag.name}
        isEditing={editingTagId === tag.id}
        editInputLabel="Edit tag name"
        meta={meta}
        renderTitle={(tagName) => `#${tagName}`}
        onStartEdit={() => setEditingTagId(tag.id)}
        onCancelEdit={() => setEditingTagId(null)}
        onSave={(name) => onUpdateTag(tag.id, name)}
        onDelete={() => onDelete(tag)}
      />
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
