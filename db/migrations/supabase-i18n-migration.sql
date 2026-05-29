-- Add language support to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'en';
CREATE INDEX IF NOT EXISTS idx_news_language ON news(language);
CREATE INDEX IF NOT EXISTS idx_news_published_language ON news(is_published, language, published_at DESC);

-- Update news_sources to add language parameter
ALTER TABLE news_sources ADD COLUMN IF NOT EXISTS language VARCHAR(2) DEFAULT 'en';

-- Add some Spanish news sources
INSERT INTO news_sources (name, source_type, api_endpoint, api_key_env, requests_per_day, search_query, language, config)
VALUES 
  (
    'NewsAPI (Spanish)',
    'newsapi',
    'https://newsapi.org/v2/everything',
    'NEWSAPI_KEY',
    100,
    'Copa Mundial 2026 OR Mundial de Fútbol 2026 OR FIFA 2026',
    'es',
    '{"language": "es", "sortBy": "publishedAt", "pageSize": 20}'::jsonb
  ),
  (
    'GNews (Spanish)',
    'gnews',
    'https://gnews.io/api/v4/search',
    'GNEWS_API_KEY',
    100,
    'Copa Mundial 2026 OR Mundial FIFA 2026',
    'es',
    '{"lang": "es", "max": 10, "sortby": "publishedAt"}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;

-- Update existing English sources to mark them as English
UPDATE news_sources 
SET language = 'en'
WHERE name IN ('NewsAPI', 'GNews');

COMMENT ON COLUMN news.language IS 'Article language: en (English) or es (Spanish)';
COMMENT ON COLUMN news_sources.language IS 'Source language: en (English) or es (Spanish)';
