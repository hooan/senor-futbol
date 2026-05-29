-- Create news_sources table
CREATE TABLE IF NOT EXISTS news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('newsapi', 'gnews')),
  api_endpoint TEXT NOT NULL,
  api_key_env TEXT NOT NULL, -- Environment variable name for API key
  requests_per_day INTEGER NOT NULL DEFAULT 100,
  requests_today INTEGER NOT NULL DEFAULT 0,
  last_request_date DATE,
  search_query TEXT NOT NULL DEFAULT 'FIFA World Cup 2026',
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB DEFAULT '{}', -- Additional source-specific configuration
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create news_fetch_log table to track API usage
CREATE TABLE IF NOT EXISTS news_fetch_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES news_sources(id) ON DELETE CASCADE,
  fetch_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  articles_fetched INTEGER NOT NULL DEFAULT 0,
  articles_saved INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'rate_limited')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_news_sources_active ON news_sources(is_active);
CREATE INDEX IF NOT EXISTS idx_news_sources_last_request ON news_sources(last_request_date);
CREATE INDEX IF NOT EXISTS idx_news_fetch_log_date ON news_fetch_log(fetch_date);
CREATE INDEX IF NOT EXISTS idx_news_fetch_log_source ON news_fetch_log(source_id);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_news_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_sources_updated_at
BEFORE UPDATE ON news_sources
FOR EACH ROW
EXECUTE FUNCTION update_news_sources_updated_at();

-- Insert default news sources
INSERT INTO news_sources (name, source_type, api_endpoint, api_key_env, requests_per_day, search_query, config)
VALUES 
  (
    'NewsAPI',
    'newsapi',
    'https://newsapi.org/v2/everything',
    'NEWSAPI_KEY',
    100,
    'FIFA World Cup 2026 OR World Cup 2026 OR FIFA 2026',
    '{"language": "en", "sortBy": "publishedAt", "pageSize": 20}'::jsonb
  ),
  (
    'GNews',
    'gnews',
    'https://gnews.io/api/v4/search',
    'GNEWS_API_KEY',
    100,
    'FIFA World Cup 2026 OR World Cup 2026',
    '{"lang": "en", "max": 10, "sortby": "publishedAt"}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Add RLS policies
ALTER TABLE news_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_fetch_log ENABLE ROW LEVEL SECURITY;

-- Public read access to news_sources
CREATE POLICY "news_sources_select_all" ON news_sources
  FOR SELECT USING (true);

-- Only admins can modify news_sources
CREATE POLICY "news_sources_admin_all" ON news_sources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Public read access to news_fetch_log
CREATE POLICY "news_fetch_log_select_all" ON news_fetch_log
  FOR SELECT USING (true);

-- Only service role can insert fetch logs (edge function)
CREATE POLICY "news_fetch_log_service_insert" ON news_fetch_log
  FOR INSERT WITH CHECK (true);

COMMENT ON TABLE news_sources IS 'Configuration for news API sources';
COMMENT ON TABLE news_fetch_log IS 'Log of news fetch operations';
COMMENT ON COLUMN news_sources.api_key_env IS 'Name of environment variable containing API key';
COMMENT ON COLUMN news_sources.requests_today IS 'Number of requests made today (resets daily)';
COMMENT ON COLUMN news_sources.config IS 'Source-specific configuration (language, sorting, etc)';
