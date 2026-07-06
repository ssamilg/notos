"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import {
  getSaveActionLabel,
  readSavePreference,
  writeSavePreference,
  type SaveAction,
} from "@/lib/storage/savePreference";
import { cn } from "@/lib/utils";

type SaveSplitButtonProps = {
  disabled?: boolean;
  saving?: boolean;
  onSave: () => void;
  onSaveAndExit: () => void;
  onSaveAndNew: () => void;
};

const MENU_OPTIONS: Array<{ action: SaveAction; label: string }> = [
  { action: "save", label: "Save" },
  { action: "save-and-exit", label: "Save & Exit" },
  { action: "save-and-new", label: "Save & New Note" },
];

export function SaveSplitButton({
  disabled = false,
  saving = false,
  onSave,
  onSaveAndExit,
  onSaveAndNew,
}: SaveSplitButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [preferredAction, setPreferredAction] = useState<SaveAction>("save");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setPreferredAction(readSavePreference());
  }, []);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  function runAction(action: SaveAction) {
    if (action === "save-and-exit") {
      onSaveAndExit();
      return;
    }

    if (action === "save-and-new") {
      onSaveAndNew();
      return;
    }

    onSave();
  }

  function handlePrimaryClick() {
    runAction(preferredAction);
  }

  function handleSelectAction(action: SaveAction) {
    writeSavePreference(action);
    setPreferredAction(action);
    setMenuOpen(false);
    runAction(action);
  }

  const primaryLabel = saving ? "Saving…" : getSaveActionLabel(preferredAction);

  let menu = null;

  if (menuOpen) {
    menu = (
      <div className="absolute top-full right-0 z-20 mt-1 min-w-[180px] overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <ul className="list-none p-1">
          {MENU_OPTIONS.map((option) => (
            <li key={option.action}>
              <button
                type="button"
                className={cn(
                  "text-body w-full px-3 py-2 text-left transition-colors hover:bg-muted/60",
                  preferredAction === option.action ? "text-foreground" : "text-muted-foreground"
                )}
                onClick={() => handleSelectAction(option.action)}
                tabIndex={0}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative inline-flex shrink-0">
      <GlowButton
        type="button"
        className="rounded-r-none border-r border-white/15"
        onClick={handlePrimaryClick}
        disabled={disabled || saving}
        tabIndex={0}
      >
        {primaryLabel}
      </GlowButton>
      <GlowButton
        type="button"
        className="rounded-l-none px-3"
        onClick={() => setMenuOpen((open) => !open)}
        disabled={disabled || saving}
        aria-label="Choose save action"
        aria-expanded={menuOpen}
        tabIndex={0}
      >
        <ChevronDown className="size-4" aria-hidden="true" />
      </GlowButton>
      {menu}
    </div>
  );
}
