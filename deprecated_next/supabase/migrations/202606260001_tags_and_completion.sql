ALTER TABLE public.notes
  ADD COLUMN is_completed BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE public.note_tags (
  note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON public.note_tags(tag_id);

INSERT INTO public.tags (user_id, name)
SELECT DISTINCT n.user_id, TRIM(n.tag)
FROM public.notes n
WHERE n.tag IS NOT NULL
  AND TRIM(n.tag) <> '';

INSERT INTO public.note_tags (note_id, tag_id)
SELECT n.id, t.id
FROM public.notes n
INNER JOIN public.tags t
  ON t.user_id = n.user_id
  AND t.name = TRIM(n.tag)
WHERE n.tag IS NOT NULL
  AND TRIM(n.tag) <> '';

ALTER TABLE public.notes DROP COLUMN tag;

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY tags_select_own ON public.tags
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY tags_insert_own ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tags_update_own ON public.tags
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY tags_delete_own ON public.tags
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY note_tags_select_own ON public.note_tags
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
        AND notes.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM public.tags
      WHERE tags.id = note_tags.tag_id
        AND tags.user_id = auth.uid()
    )
  );

CREATE POLICY note_tags_insert_own ON public.note_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
        AND notes.deleted_at IS NULL
    )
    AND EXISTS (
      SELECT 1
      FROM public.tags
      WHERE tags.id = note_tags.tag_id
        AND tags.user_id = auth.uid()
    )
  );

CREATE POLICY note_tags_delete_own ON public.note_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.notes
      WHERE notes.id = note_tags.note_id
        AND notes.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM public.tags
      WHERE tags.id = note_tags.tag_id
        AND tags.user_id = auth.uid()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.note_tags TO authenticated;
GRANT ALL ON TABLE public.tags TO service_role;
GRANT ALL ON TABLE public.note_tags TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.note_tags TO anon;
