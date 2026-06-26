"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TagOption = {
  id: string;
  name: string;
};

type TagAutocompleteProps = {
  tags: TagOption[];
  value: string | null;
  onValueChange: (tagId: string | null) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
};

export function TagAutocomplete({
  tags,
  value,
  onValueChange,
  placeholder = "[Filter by tag]",
  className,
  inputClassName,
}: TagAutocompleteProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const selectedTag = tags.find((tag) => tag.id === value) ?? null;
  const inputValue = isOpen ? query : (selectedTag?.name ?? query);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  let filteredTags = tags;

  if (normalizedQuery.length > 0) {
    filteredTags = tags.filter((tag) => tag.name.toLowerCase().includes(normalizedQuery));
  }

  const showClearOption = value !== null;
  const optionCount = filteredTags.length + (showClearOption ? 1 : 0);

  function openDropdown() {
    setIsOpen(true);
    setHighlightIndex(0);
  }

  function selectTag(tagId: string | null) {
    onValueChange(tagId);
    setIsOpen(false);
    setQuery("");
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    openDropdown();

    if (value !== null) {
      onValueChange(null);
    }
  }

  function handleInputFocus() {
    setQuery(selectedTag?.name ?? "");
    openDropdown();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) => (current + 1) % Math.max(optionCount, 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) =>
        current <= 0 ? Math.max(optionCount - 1, 0) : current - 1
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (!isOpen || optionCount === 0) {
        return;
      }

      if (showClearOption && highlightIndex === 0) {
        selectTag(null);
        return;
      }

      const tagIndex = showClearOption ? highlightIndex - 1 : highlightIndex;
      const tag = filteredTags[tagIndex];

      if (tag) {
        selectTag(tag.id);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }

  let dropdown = null;

  if (isOpen) {
    let options = filteredTags.map((tag, index) => {
      const optionIndex = showClearOption ? index + 1 : index;
      const isHighlighted = highlightIndex === optionIndex;

      return (
        <li key={tag.id}>
          <button
            type="button"
            role="option"
            aria-selected={value === tag.id}
            className={cn(
              "text-body w-full px-3 py-2 text-left transition-colors",
              isHighlighted ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
            )}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => selectTag(tag.id)}
            tabIndex={-1}
          >
            {tag.name}
          </button>
        </li>
      );
    });

    if (showClearOption) {
      options = [
        <li key="clear">
          <button
            type="button"
            role="option"
            aria-selected={false}
            className={cn(
              "text-body w-full px-3 py-2 text-left transition-colors",
              highlightIndex === 0 ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60"
            )}
            onMouseDown={(event) => {
              event.preventDefault();
            }}
            onClick={() => selectTag(null)}
            tabIndex={-1}
          >
            All tags
          </button>
        </li>,
        ...options,
      ];
    }

    if (options.length === 0) {
      dropdown = (
        <div className="absolute top-full z-20 mt-1 w-full rounded-lg border border-border bg-background p-3 shadow-lg">
          <p className="text-caption text-muted-foreground">No matching tags</p>
        </div>
      );
    } else {
      dropdown = (
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          <ul id={listboxId} role="listbox" className="max-h-88 list-none overflow-y-auto p-1">
            {options}
          </ul>
        </div>
      );
    }
  }

  return (
    <div ref={containerRef} className={cn("relative min-w-[180px]", className)}>
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-autocomplete="list"
        className={cn("input-bare text-body w-full border-b! border-b-white/60! focus-visible:border-b-white!", inputClassName)}
        value={inputValue}
        placeholder={placeholder}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleInputKeyDown}
        aria-label="Filter by tag"
        tabIndex={0}
      />
      {dropdown}
    </div>
  );
}
