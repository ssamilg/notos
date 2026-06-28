"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TagInputOption = {
  id: string;
  name: string;
};

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: TagInputOption[];
  disabled?: boolean;
  className?: string;
};

export function TagInput({
  tags,
  onChange,
  suggestions,
  disabled = false,
  className,
}: TagInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

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
  let filteredSuggestions = suggestions.filter((item) => !tags.includes(item.name));

  if (normalizedQuery.length > 0) {
    filteredSuggestions = filteredSuggestions.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }

  function openDropdown() {
    setIsOpen(true);
    setHighlightIndex(0);
  }

  function addTag(name: string) {
    const trimmed = name.trim();

    if (!trimmed || tags.includes(trimmed)) {
      setQuery("");
      setIsOpen(false);
      return;
    }

    onChange([...tags, trimmed]);
    setQuery("");
    setIsOpen(false);
  }

  function removeLastTag() {
    if (tags.length === 0) {
      return;
    }

    onChange(tags.slice(0, -1));
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
    openDropdown();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();

      if (isOpen && filteredSuggestions.length > 0) {
        const selected = filteredSuggestions[highlightIndex];

        if (selected) {
          addTag(selected.name);
          return;
        }
      }

      addTag(query);
      return;
    }

    if (event.key === "Backspace" && query.length === 0) {
      event.preventDefault();
      removeLastTag();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) => (current + 1) % Math.max(filteredSuggestions.length, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) =>
        current <= 0 ? Math.max(filteredSuggestions.length - 1, 0) : current - 1
      );
      return;
    }

    if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  }

  let dropdown = null;

  if (isOpen && filteredSuggestions.length > 0) {
    dropdown = (
      <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <ul id={listboxId} role="listbox" className="max-h-48 list-none overflow-y-auto p-1">
          {filteredSuggestions.map((item, index) => (
            <li key={item.id}>
              <button
                type="button"
                role="option"
                aria-selected={highlightIndex === index}
                className={cn(
                  "text-body w-full px-3 py-2 text-left transition-colors",
                  highlightIndex === index
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/60"
                )}
                onMouseDown={(event) => {
                  event.preventDefault();
                }}
                onClick={() => addTag(item.name)}
                tabIndex={-1}
              >
                #{item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={cn("relative min-w-0 flex-1", className)}>
      <div className="input-edit flex flex-wrap items-center gap-2 py-1">
        {tags.map((tag) => (
          <span key={tag} className="text-caption text-muted-foreground">
            #{tag}
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className="input-bare text-caption min-w-[120px] flex-1 text-muted-foreground"
          value={query}
          onChange={handleInputChange}
          onFocus={openDropdown}
          onKeyDown={handleInputKeyDown}
          placeholder={tags.length === 0 ? "Add tags…" : ""}
          aria-label="Note tags"
          disabled={disabled}
          tabIndex={0}
        />
      </div>
      {dropdown}
    </div>
  );
}
