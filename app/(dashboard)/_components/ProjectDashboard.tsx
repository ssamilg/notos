"use client";

import { useState } from "react";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";
import { DashboardTabHeader } from "@/app/(dashboard)/_components/DashboardTabHeader";
import { ProjectList } from "@/app/(dashboard)/_components/ProjectList";
import { TagManager } from "@/app/(dashboard)/_components/TagManager";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";
import { useCreateProjectMutation } from "@/hooks/mutations/useCreateProjectMutation";
import { useCreateTagMutation } from "@/hooks/mutations/useCreateTagMutation";

type DashboardTab = "projects" | "tags";

function readTabFromLocation(): DashboardTab {
  if (typeof window === "undefined") {
    return "projects";
  }

  const tab = new URLSearchParams(window.location.search).get("tab");
  return tab === "tags" ? "tags" : "projects";
}

function writeTabToLocation(tab: DashboardTab) {
  const url = tab === "tags" ? "/dashboard?tab=tags" : "/dashboard";
  window.history.replaceState(null, "", url);
}

export function ProjectDashboard() {
  const { navigateToProject } = useDashboardNavigation();
  const { data: projects = [], isLoading: projectsLoading, isError, error } = useProjectsQuery();
  const createProjectMutation = useCreateProjectMutation();
  const createTagMutation = useCreateTagMutation();
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => readTabFromLocation());
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectDraftName, setProjectDraftName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagDraftName, setTagDraftName] = useState("");

  function handleStartCreateProject() {
    setProjectDraftName("");
    setIsCreatingProject(true);
  }

  function handleCancelCreateProject() {
    setProjectDraftName("");
    setIsCreatingProject(false);
  }

  function handleSaveCreateProject() {
    const trimmed = projectDraftName.trim();

    if (!trimmed) {
      handleCancelCreateProject();
      return;
    }

    createProjectMutation.mutate({
      id: crypto.randomUUID(),
      name: trimmed,
    });
    setProjectDraftName("");
    setIsCreatingProject(false);
  }

  function handleStartCreateTag() {
    setTagDraftName("");
    setIsCreatingTag(true);
  }

  function handleCancelCreateTag() {
    setTagDraftName("");
    setIsCreatingTag(false);
  }

  function handleSaveCreateTag() {
    const trimmed = tagDraftName.trim();

    if (!trimmed) {
      handleCancelCreateTag();
      return;
    }

    createTagMutation.mutate({ name: trimmed });
    setTagDraftName("");
    setIsCreatingTag(false);
  }

  function handleTabChange(tab: DashboardTab) {
    setActiveTab(tab);
    writeTabToLocation(tab);
  }

  const showProjectSkeleton = activeTab === "projects" && projectsLoading && projects.length === 0;

  let tabAction = null;

  if (activeTab === "projects") {
    tabAction = (
      <GlowButton
        type="button"
        onClick={isCreatingProject ? handleCancelCreateProject : handleStartCreateProject}
      >
        {isCreatingProject ? "Cancel" : "+ New Project"}
      </GlowButton>
    );
  }

  if (activeTab === "tags") {
    tabAction = (
      <GlowButton
        type="button"
        onClick={isCreatingTag ? handleCancelCreateTag : handleStartCreateTag}
      >
        {isCreatingTag ? "Cancel" : "+ Add Tag"}
      </GlowButton>
    );
  }

  let projectsPanel = (
    <ProjectList
      projects={projects}
      isCreating={isCreatingProject}
      draftName={projectDraftName}
      onCancelCreate={handleCancelCreateProject}
      onDraftNameChange={setProjectDraftName}
      onSaveCreate={handleSaveCreateProject}
      onSelect={(id) => navigateToProject(id)}
    />
  );

  if (showProjectSkeleton) {
    projectsPanel = <ProjectListSkeleton />;
  }

  if (isError && projects.length === 0) {
    projectsPanel = (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error?.message ?? "Failed to load projects"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      <DashboardTabHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        action={tabAction}
      />

      <div className={activeTab === "projects" ? undefined : "hidden"} aria-hidden={activeTab !== "projects"}>
        {projectsPanel}
      </div>

      <div className={activeTab === "tags" ? undefined : "hidden"} aria-hidden={activeTab !== "tags"}>
        <TagManager
          isCreating={isCreatingTag}
          draftName={tagDraftName}
          onCancelCreate={handleCancelCreateTag}
          onDraftNameChange={setTagDraftName}
          onSaveCreate={handleSaveCreateTag}
        />
      </div>
    </div>
  );
}
