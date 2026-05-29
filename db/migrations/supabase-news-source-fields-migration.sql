-- Add source information fields to news table
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS source_url TEXT;
ALTER TABLE news ADD COLUMN IF NOT EXISTS author TEXT;
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_source_name ON news(source_name);

-- Add comments
COMMENT ON COLUMN news.source_name IS 'Name of the news source (e.g., NewsAPI, GNews, manual author name)';
COMMENT ON COLUMN news.source_url IS 'Original article URL from the source';
COMMENT ON COLUMN news.author IS 'Author of the news article';
-- Update existing manually created articles to have source_name
-- (Optional: set author username as source for manual articles)
UPDATE news 
SET source_name = 'Manual Entry'
WHERE source_name IS NULL AND author_id IS NOT NULL;
