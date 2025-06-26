
-- Enable the required extensions if not already enabled
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Remove existing cron job if it exists
select cron.unschedule('google-fit-sync');

-- Schedule new cron job to run every 10 minutes
select cron.schedule(
  'google-fit-sync',
  '*/10 * * * *',
  $$
  select
    net.http_post(
      url:='https://tmffcijysdajfwyoqvuh.supabase.co/functions/v1/google-fit-cron',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.settings.service_role_key') || '"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);
