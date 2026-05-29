-- Helper function to increment request counter atomically
CREATE OR REPLACE FUNCTION increment_requests_today()
RETURNS INTEGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT requests_today INTO current_count
  FROM news_sources
  WHERE id = NEW.id;
  
  RETURN current_count + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to invoke edge function (for pg_cron)
CREATE OR REPLACE FUNCTION invoke_fetch_news()
RETURNS void AS $$
DECLARE
  request_id bigint;
BEGIN
  -- Call the edge function using pg_net
  SELECT net.http_post(
    url := current_setting('app.supabase_url') || '/functions/v1/fetch-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
    ),
    body := '{}'::jsonb
  ) INTO request_id;
  
  RAISE NOTICE 'News fetch triggered with request_id: %', request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: To enable scheduling, run these commands in Supabase SQL Editor:
-- 
-- 1. Enable pg_cron extension (if not already enabled):
--    CREATE EXTENSION IF NOT EXISTS pg_cron;
--
-- 2. Schedule the job (runs daily at 8 AM UTC):
--    SELECT cron.schedule(
--      'fetch-news-daily',
--      '0 8 * * *',  -- Cron expression: every day at 8:00 AM UTC
--      'SELECT invoke_fetch_news();'
--    );
--
-- 3. To change the schedule, first unschedule the old job:
--    SELECT cron.unschedule('fetch-news-daily');
--
-- 4. Then create a new schedule with your desired timing:
--    Examples:
--    - Every 6 hours: '0 */6 * * *'
--    - Every 12 hours: '0 */12 * * *'
--    - Twice a day (8 AM and 8 PM): '0 8,20 * * *'
--    - Every Monday at 9 AM: '0 9 * * 1'
--
-- 5. To view all scheduled jobs:
--    SELECT * FROM cron.job;
--
-- 6. To view job run history:
--    SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

COMMENT ON FUNCTION invoke_fetch_news() IS 'Triggers the fetch-news edge function for scheduled news updates';
