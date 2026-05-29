-- =====================================================
-- Señor Fútbol — Database Structure
-- Apply once on a fresh Supabase project.
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =====================================================
-- TABLES (dependency order)
-- =====================================================

CREATE TABLE IF NOT EXISTS tournaments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_league_id INTEGER NOT NULL,
  season        INTEGER NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  start_date    DATE,
  end_date      DATE,
  logo_url      TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(api_league_id, season)
);

CREATE TABLE IF NOT EXISTS teams (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  api_team_id   INTEGER,
  name          TEXT NOT NULL,
  code          TEXT NOT NULL,  -- 3-letter code, e.g. USA, MEX, ARG
  logo_url      TEXT,
  created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fixtures (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  api_fixture_id  INTEGER UNIQUE,
  home_team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id    UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date      TIMESTAMP WITH TIME ZONE NOT NULL,
  venue           TEXT,
  referee         TEXT,
  status          TEXT DEFAULT 'NS',  -- NS, LIVE, HT, FT, PST, CANC
  home_score      INTEGER,
  away_score      INTEGER,
  round           TEXT NOT NULL,      -- 'Group Stage', 'Round of 16', etc.
  group_name      TEXT,               -- 'A', 'B', 'C', ... (null for knockouts)
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS standings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id   UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id         UUID REFERENCES teams(id) ON DELETE CASCADE,
  group_name      TEXT NOT NULL,
  rank            INTEGER NOT NULL,
  points          INTEGER DEFAULT 0,
  played          INTEGER DEFAULT 0,
  wins            INTEGER DEFAULT 0,
  draws           INTEGER DEFAULT 0,
  losses          INTEGER DEFAULT 0,
  goals_for       INTEGER DEFAULT 0,
  goals_against   INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, group_name)
);

CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_admin   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS news (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  excerpt         TEXT,
  author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  published_at    TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published    BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS quinielas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public  BOOLEAN DEFAULT TRUE,
  share_code TEXT UNIQUE NOT NULL,
  deadline   TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiniela_predictions (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiniela_id          UUID REFERENCES quinielas(id) ON DELETE CASCADE,
  user_id              UUID REFERENCES users(id) ON DELETE CASCADE,
  fixture_id           UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points_earned        INTEGER DEFAULT 0,
  created_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at           TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiniela_id, user_id, fixture_id)
);

CREATE TABLE IF NOT EXISTS quiniela_participants (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiniela_id UUID REFERENCES quinielas(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name  TEXT,
  joined_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  UNIQUE(quiniela_id, user_id),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_name IS NULL) OR
    (user_id IS NULL AND guest_name IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS api_request_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint       TEXT NOT NULL,
  request_date   DATE NOT NULL,
  request_count  INTEGER DEFAULT 1,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(endpoint, request_date)
);

CREATE TABLE IF NOT EXISTS match_events (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id           UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id              UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  time_elapsed         INTEGER NOT NULL,
  time_extra           INTEGER,
  player_name          TEXT NOT NULL,
  api_player_id        INTEGER,
  assist_name          TEXT,
  assist_api_player_id INTEGER,
  event_type           TEXT NOT NULL,  -- 'goal', 'card', 'subst', 'var'
  detail               TEXT,           -- e.g. 'Normal Goal', 'Yellow Card'
  comments             TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_lineups (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id    UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  formation     TEXT,
  player_name   TEXT NOT NULL,
  player_number INTEGER,
  api_player_id INTEGER,
  position      TEXT NOT NULL,  -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
  grid_position TEXT,           -- e.g. '1:1'
  is_starter    BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS match_statistics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  stat_type  TEXT NOT NULL,  -- e.g. 'Shots on Goal', 'Ball Possession'
  stat_value TEXT NOT NULL,  -- stored as text: '65%', '12', etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS players (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_player_id INTEGER NOT NULL,
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  age           INTEGER,
  number        INTEGER,
  position      TEXT,  -- 'Goalkeeper', 'Defender', 'Midfielder', 'Attacker'
  photo_url     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(api_player_id, team_id)
);


-- =====================================================
-- INDEXES
-- =====================================================

-- Unique: one team api_id per tournament
CREATE UNIQUE INDEX IF NOT EXISTS idx_teams_api_tournament
  ON teams(api_team_id, tournament_id)
  WHERE api_team_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tournaments_season          ON tournaments(season DESC);
CREATE INDEX IF NOT EXISTS idx_teams_tournament            ON teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_tournament         ON fixtures(tournament_id);
CREATE INDEX IF NOT EXISTS idx_fixtures_match_date         ON fixtures(match_date);
CREATE INDEX IF NOT EXISTS idx_fixtures_status             ON fixtures(status);
CREATE INDEX IF NOT EXISTS idx_fixtures_round              ON fixtures(round);
CREATE INDEX IF NOT EXISTS idx_standings_tournament        ON standings(tournament_id);
CREATE INDEX IF NOT EXISTS idx_standings_group             ON standings(group_name);
CREATE INDEX IF NOT EXISTS idx_standings_rank              ON standings(rank);
CREATE INDEX IF NOT EXISTS idx_news_published              ON news(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_quinielas_share_code        ON quinielas(share_code);
CREATE INDEX IF NOT EXISTS idx_quiniela_predictions_user   ON quiniela_predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_quiniela_participants_quiniela ON quiniela_participants(quiniela_id);
CREATE INDEX IF NOT EXISTS idx_match_events_fixture        ON match_events(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_events_team           ON match_events(team_id);
CREATE INDEX IF NOT EXISTS idx_match_events_type           ON match_events(event_type);
CREATE INDEX IF NOT EXISTS idx_match_lineups_fixture       ON match_lineups(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_lineups_team          ON match_lineups(team_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_fixture    ON match_statistics(fixture_id);
CREATE INDEX IF NOT EXISTS idx_match_statistics_team       ON match_statistics(team_id);
CREATE INDEX IF NOT EXISTS idx_players_team                ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_api_id              ON players(api_player_id);


-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE tournaments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams                ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures             ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE news                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE quinielas            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiniela_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiniela_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_log      ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_lineups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_statistics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE players              ENABLE ROW LEVEL SECURITY;

-- Tournaments
CREATE POLICY "Tournaments viewable by everyone" ON tournaments
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournaments" ON tournaments
  FOR ALL USING (
    (SELECT is_admin FROM users WHERE id = auth.uid()) = true
  );

-- Teams / Fixtures / Standings: public read
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);
CREATE POLICY "Fixtures are viewable by everyone" ON fixtures
  FOR SELECT USING (true);
CREATE POLICY "Standings are viewable by everyone" ON standings
  FOR SELECT USING (true);

-- Users
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- News
CREATE POLICY "Published news viewable by everyone" ON news
  FOR SELECT USING (
    is_published = true OR
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
CREATE POLICY "Admins can insert news" ON news
  FOR INSERT WITH CHECK (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
CREATE POLICY "Admins can update news" ON news
  FOR UPDATE USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );
CREATE POLICY "Admins can delete news" ON news
  FOR DELETE USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Quinielas
CREATE POLICY "Public quinielas viewable by everyone" ON quinielas
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());
CREATE POLICY "Authenticated users can create quinielas" ON quinielas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creators can update their quinielas" ON quinielas
  FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creators can delete their quinielas" ON quinielas
  FOR DELETE USING (auth.uid() = creator_id);

-- Quiniela Predictions
CREATE POLICY "Users can view predictions in joined quinielas" ON quiniela_predictions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quiniela_participants
      WHERE quiniela_id = quiniela_predictions.quiniela_id
        AND (user_id = auth.uid() OR quiniela_predictions.quiniela_id IN (
          SELECT id FROM quinielas WHERE is_public = true
        ))
    )
  );
CREATE POLICY "Users can insert their own predictions" ON quiniela_predictions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own predictions" ON quiniela_predictions
  FOR UPDATE USING (auth.uid() = user_id);

-- Quiniela Participants
CREATE POLICY "Participants viewable in public quinielas" ON quiniela_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quinielas
      WHERE id = quiniela_participants.quiniela_id AND is_public = true
    ) OR user_id = auth.uid()
  );
CREATE POLICY "Users can join quinielas" ON quiniela_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR guest_name IS NOT NULL);

-- API Request Log
CREATE POLICY "Admins can view API logs" ON api_request_log
  FOR SELECT USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Match Events
CREATE POLICY "Match events viewable by everyone" ON match_events
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert match events" ON match_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can update match events" ON match_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can delete match events" ON match_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Match Lineups
CREATE POLICY "Match lineups viewable by everyone" ON match_lineups
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert match lineups" ON match_lineups
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can update match lineups" ON match_lineups
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can delete match lineups" ON match_lineups
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Match Statistics
CREATE POLICY "Match statistics viewable by everyone" ON match_statistics
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert match statistics" ON match_statistics
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can update match statistics" ON match_statistics
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can delete match statistics" ON match_statistics
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );

-- Players
CREATE POLICY "Players viewable by everyone" ON players
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert players" ON players
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can update players" ON players
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );
CREATE POLICY "Admins can delete players" ON players
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND is_admin = true)
  );


-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generic updated_at trigger (shared by all tables)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-create user profile on signup (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, username, is_admin, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    false,
    NULL
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    INSERT INTO public.users (id, username, is_admin, avatar_url)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'username', 'user')
        || '_' || substr(gen_random_uuid()::text, 1, 8),
      false,
      NULL
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Quiniela scoring: exact=5, correct result=3, correct diff=+1
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  predicted_home INTEGER,
  predicted_away INTEGER,
  actual_home    INTEGER,
  actual_away    INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  points           INTEGER := 0;
  predicted_result TEXT;
  actual_result    TEXT;
BEGIN
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 5;
  END IF;

  predicted_result := CASE
    WHEN predicted_home > predicted_away THEN 'H'
    WHEN predicted_home < predicted_away THEN 'A'
    ELSE 'D'
  END;

  actual_result := CASE
    WHEN actual_home > actual_away THEN 'H'
    WHEN actual_home < actual_away THEN 'A'
    ELSE 'D'
  END;

  IF predicted_result = actual_result THEN
    points := points + 3;
  END IF;

  IF (predicted_home - predicted_away) = (actual_home - actual_away) THEN
    points := points + 1;
  END IF;

  RETURN points;
END;
$$ LANGUAGE plpgsql;

-- Returns the most recent tournament id
CREATE OR REPLACE FUNCTION get_active_tournament()
RETURNS UUID AS $$
  SELECT id FROM tournaments ORDER BY season DESC, created_at DESC LIMIT 1;
$$ LANGUAGE SQL STABLE;


-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER fixtures_updated_at
  BEFORE UPDATE ON fixtures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER tournaments_updated_at
  BEFORE UPDATE ON tournaments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- =====================================================
-- GRANTS
-- =====================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;


-- =====================================================
-- TABLE COMMENTS
-- =====================================================
COMMENT ON TABLE tournaments          IS 'Leagues and competitions';
COMMENT ON TABLE teams                IS 'Participating teams per tournament';
COMMENT ON TABLE fixtures             IS 'Matches/fixtures';
COMMENT ON TABLE standings            IS 'Group stage standings';
COMMENT ON TABLE users                IS 'Extended user profiles (linked to auth.users)';
COMMENT ON TABLE news                 IS 'News articles (admin created)';
COMMENT ON TABLE quinielas            IS 'Prediction pools';
COMMENT ON TABLE quiniela_predictions IS 'Individual match predictions within a quiniela';
COMMENT ON TABLE quiniela_participants IS 'Users and guests participating in quinielas';
COMMENT ON TABLE api_request_log      IS 'Tracks API-Football requests for rate limiting';
COMMENT ON TABLE match_events         IS 'Goals, cards, substitutions, and VAR events per match';
COMMENT ON TABLE match_lineups        IS 'Starting XI and substitutes per match';
COMMENT ON TABLE match_statistics     IS 'Team-level stats per match (possession, shots, etc.)';
COMMENT ON TABLE players              IS 'Team rosters and squad data';
