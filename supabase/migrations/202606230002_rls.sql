ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY projects_select_own ON public.projects
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY projects_insert_own ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_update_own ON public.projects
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY projects_delete_own ON public.projects
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

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

CREATE POLICY notes_insert_own ON public.notes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = notes.project_id
        AND projects.user_id = auth.uid()
        AND projects.deleted_at IS NULL
    )
  );

CREATE POLICY notes_update_own ON public.notes
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY notes_delete_own ON public.notes
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
