"use client";

import { useEffect, useState } from "react";
import { ProjectDashboard } from "@/next/app/(dashboard)/_components/ProjectDashboard";
import { ProjectNotesView } from "@/next/app/(dashboard)/_components/ProjectNotesView";
import { NoteDetailView } from "@/next/app/(dashboard)/_components/NoteDetailView";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";

export function DashboardViewHost() {
  const { view } = useDashboardNavigation();
  const [visitedProjects, setVisitedProjects] = useState<string[]>([]);

  useEffect(() => {
    if (view.type !== "notes") {
      return;
    }

    setVisitedProjects((current) => {
      if (current.includes(view.projectId)) {
        return current;
      }

      return [...current, view.projectId];
    });
  }, [view]);

  let projectsPanel = (
    <div className={view.type === "projects" ? undefined : "hidden"} aria-hidden={view.type !== "projects"}>
      <ProjectDashboard />
    </div>
  );

  const notesPanels = visitedProjects.map((projectId) => {
    const isActive = view.type === "notes" && view.projectId === projectId;

    return (
      <div
        key={projectId}
        className={isActive ? undefined : "hidden"}
        aria-hidden={!isActive}
      >
        <ProjectNotesView projectId={projectId} />
      </div>
    );
  });

  let notePanel = null;

  if (view.type === "note") {
    notePanel = <NoteDetailView noteId={view.noteId} />;
  }

  return (
    <>
      {projectsPanel}
      {notesPanels}
      {notePanel}
    </>
  );
}
