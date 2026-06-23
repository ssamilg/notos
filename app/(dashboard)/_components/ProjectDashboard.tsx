"use client";

import { useLayoutEffect, useState } from "react";
import { useProjects } from "@/context/ProjectProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { ProjectList } from "@/app/(dashboard)/_components/ProjectList";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProjectDashboard() {
  const {
    projects,
    ready,
    error,
    failedSync,
    createProject,
    retrySync,
  } = useProjects();
  const { navigateToProject, isPendingProjects, clearPending } = useNavigation();
  const [isCreating, setIsCreating] = useState(false);
  const [draftName, setDraftName] = useState("");

  useLayoutEffect(() => {
    if (ready) {
      clearPending();
    }
  }, [ready, clearPending]);

  function handleStartCreate() {
    setDraftName("");
    setIsCreating(true);
  }

  function handleCancelCreate() {
    setDraftName("");
    setIsCreating(false);
  }

  function handleSaveCreate() {
    const trimmed = draftName.trim();

    if (!trimmed) {
      handleCancelCreate();
      return;
    }

    createProject(trimmed);
    setDraftName("");
    setIsCreating(false);
  }

  const showSkeleton = isPendingProjects || !ready;

  let content = (
    <div>
      {failedSync > 0 ? (
        <Alert className="mb-4">
          <AlertTitle>Sync pending</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-4">
            <span>{failedSync} changes could not sync.</span>
            <Button type="button" size="sm" variant="outline" onClick={retrySync}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      <ProjectList
        projects={projects}
        isCreating={isCreating}
        draftName={draftName}
        onStartCreate={handleStartCreate}
        onCancelCreate={handleCancelCreate}
        onDraftNameChange={setDraftName}
        onSaveCreate={handleSaveCreate}
        onSelect={(id) => navigateToProject(id)}
      />
    </div>
  );

  if (showSkeleton) {
    content = <ProjectListSkeleton />;
  }

  if (error && projects.length === 0 && ready) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return content;
}
