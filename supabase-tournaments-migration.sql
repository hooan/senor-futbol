-- =====================================================
-- TOURNAMENT MANAGEMENT - Database Migration
-- Adds tournament support to Señor Fútbol
-- =====================================================

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_league_id INTEGER NOT NULL,
  season INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_league_id, season)
);

-- Add tournament_id to existing tables
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE fixtures ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;
ALTER TABLE standings ADD COLUMN IF NOT EXISTS tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_tournament ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament ON fixtures(tournament_id);
CREATE INDEX IF NOT EXISTS idx_standings_tournament ON standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_tournaments_season ON tournaments(season DESC);

-- Add unique constraint for teams (api_team_id + tournament_id must be unique)
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_api_tournament ON teams(api_team_id, tournament_id) WHERE api_team_id IS NOT NULL;

-- RLS Policies for tournaments table
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Tournaments viewable by everyone" ON tournaments
  FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Admins can manage tournaments" ON tournaments
  FOR ALL USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

-- Function to get active tournament (most recent by season)
CREATE OR REPLACE FUNCTION get_active_tournament()
RETURNS UUID AS $$
  SELECT id 
  FROM tournaments 
  ORDER BY season DESC, created_at DESC 
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to update tournament timestamp
CREATE OR REPLACE FUNCTION update_tournament_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS tournament_updated_at
BEFORE UPDATE ON tournaments
FOR EACH ROW
EXECUTE FUNCTION update_tournament_timestamp();

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Tournament management migration complete!';
  RAISE NOTICE 'Tables updated: tournaments, teams, fixtures, standings';
  RAISE NOTICE 'Next: Import tournament data with CLI tool';
END $$;
