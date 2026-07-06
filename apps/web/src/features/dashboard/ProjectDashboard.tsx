"use client";

import { useMemo, useState } from "react";
import type { ProjectWithCount } from "@/types/domain";
import { useDashboardNavigation } from "@/context/DashboardNavigationProvider";
import { DashboardTabHeader } from "@/features/dashboard/DashboardTabHeader";
import { ProjectList } from "@/features/dashboard/ProjectList";
import { TagManager } from "@/features/dashboard/TagManager";
import { ProjectListSkeleton } from "@/components/skeletons/ProjectListSkeleton";
import { ConfirmationModal } from "@/components/ConfirmationModal";
import { SearchInput } from "@/components/SearchInput";
import { GlowButton } from "@/components/glow-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useProjectsQuery } from "@/hooks/queries/useProjectsQuery";
import { useCreateProjectMutation } from "@/hooks/mutations/useCreateProjectMutation";
import { useUpdateProjectMutation } from "@/hooks/mutations/useUpdateProjectMutation";
import { useDeleteProjectMutation } from "@/hooks/mutations/useDeleteProjectMutation";
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

function filterByName<T extends { name: string }>(items: T[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  return items.filter((item) => item.name.toLowerCase().includes(normalized));
}

export function ProjectDashboard() {
  const { navigateToProject } = useDashboardNavigation();
  const { data: projects = [], isLoading: projectsLoading, isError, error } = useProjectsQuery();
  const createProjectMutation = useCreateProjectMutation();
  const updateProjectMutation = useUpdateProjectMutation();
  const deleteProjectMutation = useDeleteProjectMutation();
  const createTagMutation = useCreateTagMutation();
  const [activeTab, setActiveTab] = useState<DashboardTab>(() => readTabFromLocation());
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [projectDraftName, setProjectDraftName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagDraftName, setTagDraftName] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [pendingDeleteProject, setPendingDeleteProject] = useState<ProjectWithCount | null>(null);
  const [projectDeleteDialogOpen, setProjectDeleteDialogOpen] = useState(false);

  const filteredProjects = useMemo(
    () => filterByName(projects, projectSearch),
    [projects, projectSearch]
  );

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

  function handleProjectDeleteRequest(project: ProjectWithCount) {
    setPendingDeleteProject(project);
    setProjectDeleteDialogOpen(true);
  }

  function handleConfirmProjectDelete() {
    if (pendingDeleteProject) {
      deleteProjectMutation.mutate({ id: pendingDeleteProject.id });
      setPendingDeleteProject(null);
    }
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
    <>
      <SearchInput
        value={projectSearch}
        onChange={setProjectSearch}
        placeholder="Search projects…"
        ariaLabel="Search projects"
      />
      <ProjectList
        projects={filteredProjects}
        isCreating={isCreatingProject}
        draftName={projectDraftName}
        onCancelCreate={handleCancelCreateProject}
        onDraftNameChange={setProjectDraftName}
        onSaveCreate={handleSaveCreateProject}
        onSelect={(id) => navigateToProject(id)}
        onUpdateProject={(id, name) => updateProjectMutation.mutate({ id, name })}
        onDeleteRequest={handleProjectDeleteRequest}
      />
    </>
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

  const projectNoteLabel = pendingDeleteProject?.note_count === 1 ? "note" : "notes";
  const projectDeleteDescription = pendingDeleteProject
    ? `Are you sure you want to delete "${pendingDeleteProject.name}"? This affects ${pendingDeleteProject.note_count} ${projectNoteLabel}.`
    : "Are you sure you want to delete this project?";

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

      <ConfirmationModal
        open={projectDeleteDialogOpen}
        onOpenChange={setProjectDeleteDialogOpen}
        title="Delete project?"
        description={projectDeleteDescription}
        confirmLabel="Delete"
        onConfirm={handleConfirmProjectDelete}
      />
    </div>
  );
}
