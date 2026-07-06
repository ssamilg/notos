"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export type TagOption = {
  id: string;
  name: string;
};

type TagInputBaseProps = {
  options: TagOption[];
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

type TagInputMultiProps = TagInputBaseProps & {
  mode?: "multi";
  value: string[];
  onChange: (tags: string[]) => void;
};

type TagInputSingleProps = TagInputBaseProps & {
  mode: "single";
  value: string | null;
  onChange: (tagId: string | null) => void;
  clearLabel?: string;
};

export type TagInputProps = TagInputMultiProps | TagInputSingleProps;

function isSingleMode(props: TagInputProps): props is TagInputSingleProps {
  return props.mode === "single";
}

export function TagInput(props: TagInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const mode = props.mode ?? "multi";
  const disabled = props.disabled ?? false;
  const placeholder = props.placeholder ?? (mode === "single" ? "[Filter by tag]" : undefined);
  const ariaLabel = props["aria-label"] ?? (mode === "single" ? "Filter by tag" : "Note tags");
  const clearLabel = isSingleMode(props) ? (props.clearLabel ?? "All tags") : "All tags";

  const selectedTag = isSingleMode(props)
    ? (props.options.find((tag) => tag.id === props.value) ?? null)
    : null;

  const normalizedQuery = query.trim().toLowerCase();

  let filteredOptions = props.options;

  if (mode === "multi" && !isSingleMode(props)) {
    filteredOptions = props.options.filter((item) => !props.value.includes(item.name));
  }

  if (normalizedQuery.length > 0) {
    filteredOptions = filteredOptions.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }

  const showClearOption = mode === "single" && isSingleMode(props) && props.value !== null;
  const optionCount = filteredOptions.length + (showClearOption ? 1 : 0);

  const singleInputValue = isOpen ? query : (selectedTag?.name ?? query);

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

  function openDropdown() {
    setIsOpen(true);
    setHighlightIndex(0);
  }

  function closeDropdown() {
    setIsOpen(false);
    setQuery("");
  }

  function addTag(name: string) {
    if (!isSingleMode(props)) {
      const trimmed = name.trim();

      if (!trimmed || props.value.includes(trimmed)) {
        closeDropdown();
        return;
      }

      props.onChange([...props.value, trimmed]);
      closeDropdown();
    }
  }

  function removeLastTag() {
    if (!isSingleMode(props) && props.value.length > 0) {
      props.onChange(props.value.slice(0, -1));
    }
  }

  function selectTag(tagId: string | null) {
    if (isSingleMode(props)) {
      props.onChange(tagId);
      closeDropdown();
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    openDropdown();

    if (isSingleMode(props) && props.value !== null) {
      props.onChange(null);
    }
  }

  function handleInputFocus() {
    if (isSingleMode(props)) {
      setQuery(selectedTag?.name ?? "");
    }

    openDropdown();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) => (current + 1) % Math.max(optionCount, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      setHighlightIndex((current) =>
        current <= 0 ? Math.max(optionCount - 1, 0) : current - 1
      );
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (isSingleMode(props)) {
        if (!isOpen || optionCount === 0) {
          return;
        }

        if (showClearOption && highlightIndex === 0) {
          selectTag(null);
          return;
        }

        const tagIndex = showClearOption ? highlightIndex - 1 : highlightIndex;
        const tag = filteredOptions[tagIndex];

        if (tag) {
          selectTag(tag.id);
        }

        return;
      }

      if (isOpen && filteredOptions.length > 0) {
        const selected = filteredOptions[highlightIndex];

        if (selected) {
          addTag(selected.name);
          return;
        }
      }

      addTag(query);
      return;
    }

    if (event.key === "Backspace" && query.length === 0 && !isSingleMode(props)) {
      event.preventDefault();
      removeLastTag();
      return;
    }

    if (event.key === "Escape") {
      closeDropdown();
      inputRef.current?.blur();
    }
  }

  let dropdown = null;

  if (isOpen) {
    if (mode === "multi" && filteredOptions.length === 0) {
      dropdown = null;
    } else if (mode === "single") {
      let options = filteredOptions.map((tag, index) => {
        const optionIndex = showClearOption ? index + 1 : index;
        const isHighlighted = highlightIndex === optionIndex;

        return (
          <li key={tag.id}>
            <button
              type="button"
              role="option"
              aria-selected={isSingleMode(props) ? props.value === tag.id : false}
              className={cn(
                "text-body w-full px-3 py-2 text-left text-lg transition-colors",
                isHighlighted
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
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
                "text-body w-full px-3 py-2 text-left text-lg transition-colors",
                highlightIndex === 0
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60"
              )}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onClick={() => selectTag(null)}
              tabIndex={-1}
            >
              {clearLabel}
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
    } else {
      dropdown = (
        <div className="absolute top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          <ul id={listboxId} role="listbox" className="max-h-48 list-none overflow-y-auto p-1">
            {filteredOptions.map((item, index) => (
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
  }

  let content = null;

  if (mode === "single") {
    content = (
      <div ref={containerRef} className={cn("relative min-w-[180px]", props.className)}>
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          className={cn("input-bare text-body w-full", props.inputClassName)}
          value={singleInputValue}
          placeholder={placeholder}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleInputKeyDown}
          aria-label={ariaLabel}
          disabled={disabled}
          tabIndex={0}
        />
        {dropdown}
      </div>
    );
  } else if (!isSingleMode(props)) {
    content = (
      <div ref={containerRef} className={cn("relative min-w-0 flex-1", props.className)}>
        <div className="input-edit flex flex-wrap items-center gap-2 py-1">
          {props.value.map((tag) => (
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
            className={cn(
              "input-bare text-caption min-w-[120px] flex-1 text-muted-foreground",
              props.inputClassName
            )}
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleInputKeyDown}
            placeholder={props.value.length === 0 ? (placeholder ?? "Add tags…") : ""}
            aria-label={ariaLabel}
            disabled={disabled}
            tabIndex={0}
          />
        </div>
        {dropdown}
      </div>
    );
  }

  return content;
}
