"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProjects } from "@/context/ProjectProvider";
import { ProjectList } from "@/app/(dashboard)/_components/ProjectList";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProjectDashboard() {
  const router = useRouter();
  const {
    projects,
    loading,
    error,
    failedSync,
    createProject,
    retrySync,
  } = useProjects();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = newName.trim();

    if (!trimmed) {
      return;
    }

    createProject(trimmed);
    setNewName("");
    setShowCreateForm(false);
  }

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
        showCreateForm={showCreateForm}
        newName={newName}
        onToggleCreate={() => setShowCreateForm((current) => !current)}
        onNameChange={setNewName}
        onCreate={handleCreate}
        onCancelCreate={() => {
          setShowCreateForm(false);
          setNewName("");
        }}
        onSelect={(id) => router.push(`/project/${id}`)}
      />
    </div>
  );

  if (loading && projects.length === 0) {
    content = <ProjectListSkeleton />;
  }

  if (error && projects.length === 0) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return content;
}
