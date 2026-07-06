import type { NoteFilters } from "@/lib/query/keys";

export type DashboardView =
  | { type: "projects" }
  | { type: "notes"; projectId: string }
  | { type: "note"; noteId: string };

export function parseDashboardPath(pathname: string): DashboardView {
  const noteMatch = pathname.match(/^\/note\/([^/]+)$/);

  if (noteMatch) {
    return {
      type: "note",
      noteId: noteMatch[1],
    };
  }

  const legacyNoteMatch = pathname.match(/^\/project\/([^/]+)\/note\/([^/]+)$/);

  if (legacyNoteMatch) {
    return {
      type: "note",
      noteId: legacyNoteMatch[2],
    };
  }

  const projectMatch = pathname.match(/^\/project\/([^/]+)$/);

  if (projectMatch) {
    return {
      type: "notes",
      projectId: projectMatch[1],
    };
  }

  return { type: "projects" };
}

export function buildDashboardPath(view: DashboardView): string {
  if (view.type === "note") {
    return `/note/${view.noteId}`;
  }

  if (view.type === "notes") {
    return `/project/${view.projectId}`;
  }

  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const tab = params?.get("tab");

  if (tab === "tags") {
    return "/dashboard?tab=tags";
  }

  return "/dashboard";
}

export function readNoteFiltersFromLocation(): NoteFilters {
  if (typeof window === "undefined") {
    return {};
  }

  const params = new URLSearchParams(window.location.search);
  const search = params.get("search")?.trim();
  const tagId = params.get("tag_id");

  return {
    search: search || undefined,
    tagId: tagId || undefined,
  };
}

export function writeNoteFiltersToLocation(projectId: string, filters: NoteFilters) {
  const params = new URLSearchParams();

  if (filters.search) {
    params.set("search", filters.search);
  }

  if (filters.tagId) {
    params.set("tag_id", filters.tagId);
  }

  const query = params.toString();
  const path = query ? `/project/${projectId}?${query}` : `/project/${projectId}`;
  window.history.replaceState(null, "", path);
}
