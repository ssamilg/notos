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

INSERT INTO public.notes (id, project_id, user_id, title, text, is_completed, created_at, updated_at)
SELECT
  '22222222-2222-2222-2222-222222222201'::uuid,
  '11111111-1111-1111-1111-111111111102'::uuid,
  u.id,
  'System Design Draft',
  'Offline-first architecture with optimistic UI and background sync.',
  false,
  now(),
  now()
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.notes (id, project_id, user_id, title, text, is_completed, created_at, updated_at)
SELECT
  '22222222-2222-2222-2222-222222222202'::uuid,
  '11111111-1111-1111-1111-111111111102'::uuid,
  u.id,
  'Meeting Notes: API Integration',
  'Discussed REST envelope and v1 route structure.',
  false,
  now() - interval '1 day',
  now() - interval '1 day'
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tags (id, user_id, name, created_at)
SELECT
  '33333333-3333-3333-3333-333333333301'::uuid,
  u.id,
  'architecture',
  now()
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.tags (id, user_id, name, created_at)
SELECT
  '33333333-3333-3333-3333-333333333302'::uuid,
  u.id,
  'meeting',
  now()
FROM auth.users u
LIMIT 1
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.note_tags (note_id, tag_id)
SELECT
  '22222222-2222-2222-2222-222222222201'::uuid,
  '33333333-3333-3333-3333-333333333301'::uuid
ON CONFLICT (note_id, tag_id) DO NOTHING;

INSERT INTO public.note_tags (note_id, tag_id)
SELECT
  '22222222-2222-2222-2222-222222222202'::uuid,
  '33333333-3333-3333-3333-333333333302'::uuid
ON CONFLICT (note_id, tag_id) DO NOTHING;
