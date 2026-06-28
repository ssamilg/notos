"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { GlowButton } from "@/components/glow-button";

type DashboardListItemProps = {
  name: string;
  isEditing: boolean;
  editInputLabel: string;
  meta: ReactNode;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (name: string) => void;
  onDelete: () => void;
  onSelect?: () => void;
  renderTitle?: (name: string) => ReactNode;
};

export function DashboardListItem({
  name,
  isEditing,
  editInputLabel,
  meta,
  onStartEdit,
  onCancelEdit,
  onSave,
  onDelete,
  onSelect,
  renderTitle,
}: DashboardListItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const actionClickedRef = useRef(false);
  const [draftName, setDraftName] = useState(name);

  useEffect(() => {
    if (isEditing) {
      setDraftName(name);
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, name]);

  function handleSaveClick() {
    const trimmed = draftName.trim();

    if (!trimmed) {
      onCancelEdit();
      return;
    }

    actionClickedRef.current = true;
    onSave(trimmed);
    onCancelEdit();
  }

  function markActionClick() {
    actionClickedRef.current = true;
  }

  function handleBlur() {
    if (actionClickedRef.current) {
      actionClickedRef.current = false;
      return;
    }

    if (isEditing) {
      onCancelEdit();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveClick();
    }

    if (event.key === "Escape") {
      onCancelEdit();
    }
  }

  let titleNode: ReactNode = null;

  if (renderTitle) {
    titleNode = renderTitle(name);
  } else {
    titleNode = name;
  }

  let metaNode = meta;

  if (onSelect && !isEditing) {
    metaNode = (
      <button
        type="button"
        className="block w-full cursor-pointer border-none bg-transparent p-0 text-left"
        onClick={onSelect}
        tabIndex={0}
      >
        {meta}
      </button>
    );
  }

  let rowContent: ReactNode = null;

  if (isEditing) {
    rowContent = (
      <li className="list-row list-row-editing">
        <div className="list-row-header">
          <input
            ref={inputRef}
            className="input-bare list-row-title min-w-0 flex-1"
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            aria-label={editInputLabel}
            tabIndex={0}
          />
          <div className="list-row-edit-actions">
            <GlowButton
              type="button"
              onMouseDown={markActionClick}
              onClick={onCancelEdit}
              tabIndex={0}
            >
              Cancel
            </GlowButton>
            <GlowButton
              type="button"
              onMouseDown={markActionClick}
              onClick={onDelete}
              tabIndex={0}
            >
              Delete
            </GlowButton>
            <GlowButton
              type="button"
              onMouseDown={markActionClick}
              onClick={handleSaveClick}
              tabIndex={0}
            >
              Save
            </GlowButton>
          </div>
        </div>
        {meta}
      </li>
    );
  } else if (onSelect) {
    rowContent = (
      <li className="list-row">
        <div className="list-row-header">
          <button
            type="button"
            className="list-row-title min-w-0 flex-1 cursor-pointer text-left"
            onClick={onSelect}
            tabIndex={0}
          >
            {titleNode}
          </button>
          <div className="list-row-hover-actions">
            <GlowButton type="button" className="shrink-0" onClick={onStartEdit} tabIndex={0}>
              Edit
            </GlowButton>
          </div>
        </div>
        {metaNode}
      </li>
    );
  } else {
    rowContent = (
      <li className="list-row">
        <div className="list-row-header">
          <span className="list-row-title min-w-0 flex-1">{titleNode}</span>
          <div className="list-row-hover-actions">
            <GlowButton type="button" className="shrink-0" onClick={onStartEdit} tabIndex={0}>
              Edit
            </GlowButton>
          </div>
        </div>
        {meta}
      </li>
    );
  }

  return rowContent;
}
