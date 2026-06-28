export type SaveAction = "save" | "save-and-exit" | "save-and-new";

const STORAGE_KEY = "notos:note-save-action";
const DEFAULT_ACTION: SaveAction = "save";

function isSaveAction(value: string): value is SaveAction {
  return value === "save" || value === "save-and-exit" || value === "save-and-new";
}

export function readSavePreference(): SaveAction {
  if (typeof window === "undefined") {
    return DEFAULT_ACTION;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);

  if (stored && isSaveAction(stored)) {
    return stored;
  }

  return DEFAULT_ACTION;
}

export function writeSavePreference(action: SaveAction) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, action);
}

export function getSaveActionLabel(action: SaveAction) {
  if (action === "save-and-exit") {
    return "Save & Exit";
  }

  if (action === "save-and-new") {
    return "Save & New Note";
  }

  return "Save";
}
