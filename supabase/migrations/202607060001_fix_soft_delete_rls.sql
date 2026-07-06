-- Fix SELECT policies so soft delete UPDATE can complete.
-- PostgreSQL requires SELECT policies to pass on the row after UPDATE;
-- deleted_at IS NULL in SELECT blocked setting deleted_at.

DROP POLICY notes_select_own ON public.notes;

CREATE POLICY notes_select_own ON public.notes
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = notes.project_id
        AND projects.user_id = auth.uid()
        AND (
          projects.deleted_at IS NULL
          OR notes.deleted_at IS NOT NULL
        )
    )
  );

DROP POLICY projects_select_own ON public.projects;

CREATE POLICY projects_select_own ON public.projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
