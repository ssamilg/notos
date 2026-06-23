CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.unschedule(jobid)
FROM cron.job
WHERE jobname = 'purge_soft_deleted_records';

SELECT cron.schedule(
  'purge_soft_deleted_records',
  '0 3 * * *',
  $$
    DELETE FROM public.notes
    WHERE deleted_at IS NOT NULL
      AND deleted_at < now() - interval '7 days';

    DELETE FROM public.projects
    WHERE deleted_at IS NOT NULL
      AND deleted_at < now() - interval '7 days';
  $$
);
