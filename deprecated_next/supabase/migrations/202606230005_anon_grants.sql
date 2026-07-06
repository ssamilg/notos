GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notes TO anon;
