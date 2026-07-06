GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO authenticated;
GRANT ALL ON TABLE public.projects TO service_role;
GRANT ALL ON TABLE public.notes TO service_role;
