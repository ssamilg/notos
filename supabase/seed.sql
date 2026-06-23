INSERT INTO public.projects (id, user_id, name, created_at, updated_at)
SELECT
  '11111111-1111-1111-1111-111111111101'::uuid,
  id,
  'Default',
  now(),
  now()
FROM auth.users
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (id, user_id, name, created_at, updated_at)
SELECT
  '11111111-1111-1111-1111-111111111102'::uuid,
  id,
  'Work & Engineering',
  now() - interval '2 days',
  now()
FROM auth.users
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notes (id, project_id, user_id, title, text, tag, created_at, updated_at)
SELECT
  '22222222-2222-2222-2222-222222222201'::uuid,
  '11111111-1111-1111-1111-111111111102'::uuid,
  u.id,
  'System Design Draft',
  'Offline-first architecture with optimistic UI and background sync.',
  'architecture',
  now(),
  now()
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notes (id, project_id, user_id, title, text, tag, created_at, updated_at)
SELECT
  '22222222-2222-2222-2222-222222222202'::uuid,
  '11111111-1111-1111-1111-111111111102'::uuid,
  u.id,
  'Meeting Notes: API Integration',
  'Discussed REST envelope and v1 route structure.',
  'meeting',
  now() - interval '1 day',
  now() - interval '1 day'
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;
