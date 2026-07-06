-- Rollback: restore original SELECT policies that hide soft-deleted rows.

DROP POLICY notes_select_own ON public.notes;

CREATE POLICY notes_select_own ON public.notes
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = notes.project_id
        AND projects.user_id = auth.uid()
        AND projects.deleted_at IS NULL
    )
  );

DROP POLICY projects_select_own ON public.projects;

CREATE POLICY projects_select_own ON public.projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);
