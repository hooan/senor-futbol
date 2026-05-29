-- Migration: Add Match Details and Team Rosters Support
-- This adds tables for match events, lineups, statistics, and player rosters
-- Run this in Supabase SQL Editor after supabase-tournaments-migration.sql

-- ============================================================================
-- 1. ADD REFEREE COLUMN TO FIXTURES
-- ============================================================================

ALTER TABLE fixtures
ADD COLUMN IF NOT EXISTS referee TEXT;

-- ============================================================================
-- 2. MATCH EVENTS TABLE (goals, cards, substitutions, VAR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  time_elapsed INTEGER NOT NULL, -- minute of the event
  time_extra INTEGER, -- extra time (e.g., +2 in 45+2)
  player_name TEXT NOT NULL,
  api_player_id INTEGER, -- nullable, may not be available
  assist_name TEXT, -- for goals
  assist_api_player_id INTEGER, -- nullable
  event_type TEXT NOT NULL, -- 'goal', 'card', 'subst', 'var'
  detail TEXT, -- e.g., 'Normal Goal', 'Yellow Card', 'Substitution 1', 'Goal cancelled'
  comments TEXT, -- additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_match_events_fixture ON match_events(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type ON match_events(event_type);

-- ============================================================================
-- 3. MATCH LINEUPS TABLE (starting XI + substitutes)
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_lineups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  formation TEXT, -- e.g., '4-3-3'
  player_name TEXT NOT NULL,
  player_number INTEGER, -- shirt number
  api_player_id INTEGER, -- nullable
  position TEXT NOT NULL, -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
  grid_position TEXT, -- e.g., '1:1' for goalkeeper
  is_starter BOOLEAN NOT NULL DEFAULT true, -- false for substitutes
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_match_lineups_fixture ON match_lineups(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_team ON match_lineups(team_id);

-- ============================================================================
-- 4. MATCH STATISTICS TABLE (team-level stats like possession, shots)
-- ============================================================================

CREATE TABLE IF NOT EXISTS match_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stat_type TEXT NOT NULL, -- e.g., 'Shots on Goal', 'Ball Possession', 'Corner Kicks'
  stat_value TEXT NOT NULL, -- stored as text because can be '65%', '12', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_match_statistics_fixture ON match_statistics(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_team ON match_statistics(team_id);

-- ============================================================================
-- 5. PLAYERS TABLE (team rosters/squads)
-- ============================================================================

CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_player_id INTEGER NOT NULL,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER,
  number INTEGER, -- shirt number, nullable since some players don't have one
  position TEXT, -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: one player per team (allows same player in different tournaments)
  UNIQUE(api_player_id, team_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_api_id ON players(api_player_id);

-- ============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Public read access for all match details and rosters
CREATE POLICY "Match events viewable by everyone"
  ON match_events FOR SELECT
  USING (true);

CREATE POLICY "Match lineups viewable by everyone"
  ON match_lineups FOR SELECT
  USING (true);

CREATE POLICY "Match statistics viewable by everyone"
  ON match_statistics FOR SELECT
  USING (true);

CREATE POLICY "Players viewable by everyone"
  ON players FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can insert match events"
  ON match_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update match events"
  ON match_events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete match events"
  ON match_events FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Repeat for lineups
CREATE POLICY "Admins can insert match lineups"
  ON match_lineups FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update match lineups"
  ON match_lineups FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete match lineups"
  ON match_lineups FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Repeat for statistics
CREATE POLICY "Admins can insert match statistics"
  ON match_statistics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update match statistics"
  ON match_statistics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete match statistics"
  ON match_statistics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Repeat for players
CREATE POLICY "Admins can insert players"
  ON players FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update players"
  ON players FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete players"
  ON players FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- ============================================================================
-- 7. UPDATED_AT TRIGGER FOR PLAYERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables exist
SELECT 
  'match_events' as table_name, COUNT(*) as row_count FROM match_events
UNION ALL
SELECT 'match_lineups', COUNT(*) FROM match_lineups
UNION ALL
SELECT 'match_statistics', COUNT(*) FROM match_statistics
UNION ALL
SELECT 'players', COUNT(*) FROM players;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Match details and rosters migration completed successfully!';
  RAISE NOTICE 'Tables created: match_events, match_lineups, match_statistics, players';
  RAISE NOTICE 'Column added: fixtures.referee';
  RAISE NOTICE 'RLS policies enabled for all new tables';
END $$;
