-- Señor Fútbol - Supabase Database Schema
-- FIFA World Cup 2026 Application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEAMS TABLE
-- =====================================================
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_team_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  code TEXT NOT NULL, -- 3-letter country code (e.g., USA, MEX, ARG)
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- FIXTURES TABLE
-- =====================================================
CREATE TABLE fixtures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_fixture_id INTEGER UNIQUE,
  home_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  status TEXT DEFAULT 'NS', -- NS, LIVE, HT, FT, PST, CANC
  home_score INTEGER,
  away_score INTEGER,
  round TEXT NOT NULL, -- 'Group Stage', 'Round of 16', etc.
  group_name TEXT, -- 'A', 'B', 'C', etc. (null for knockout rounds)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STANDINGS TABLE
-- =====================================================
CREATE TABLE standings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL, -- 'A', 'B', 'C', etc.
  rank INTEGER NOT NULL,
  points INTEGER DEFAULT 0,
  played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, group_name)
);

-- =====================================================
-- USERS TABLE (extends Supabase Auth)
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- NEWS TABLE
-- =====================================================
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  cover_image_url TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE
);

-- =====================================================
-- QUINIELAS TABLE
-- =====================================================
CREATE TABLE quinielas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  share_code TEXT UNIQUE NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QUINIELA PREDICTIONS TABLE
-- =====================================================
CREATE TABLE quiniela_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiniela_id UUID REFERENCES quinielas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fixture_id UUID REFERENCES fixtures(id) ON DELETE CASCADE,
  predicted_home_score INTEGER NOT NULL,
  predicted_away_score INTEGER NOT NULL,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiniela_id, user_id, fixture_id)
);

-- =====================================================
-- QUINIELA PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE quiniela_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiniela_id UUID REFERENCES quinielas(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT, -- For non-registered users
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_points INTEGER DEFAULT 0,
  UNIQUE(quiniela_id, user_id),
  CONSTRAINT user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_name IS NULL) OR 
    (user_id IS NULL AND guest_name IS NOT NULL)
  )
);

-- =====================================================
-- API REQUEST LOG TABLE
-- =====================================================
CREATE TABLE api_request_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL,
  request_date DATE NOT NULL,
  request_count INTEGER DEFAULT 1,
  last_request_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(endpoint, request_date)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_fixtures_match_date ON fixtures(match_date);
CREATE INDEX idx_fixtures_status ON fixtures(status);
CREATE INDEX idx_fixtures_round ON fixtures(round);
CREATE INDEX idx_standings_group ON standings(group_name);
CREATE INDEX idx_standings_rank ON standings(rank);
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_quinielas_share_code ON quinielas(share_code);
CREATE INDEX idx_quiniela_predictions_user ON quiniela_predictions(user_id);
CREATE INDEX idx_quiniela_participants_quiniela ON quiniela_participants(quiniela_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE quinielas ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiniela_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiniela_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_request_log ENABLE ROW LEVEL SECURITY;

-- Teams: Public read access
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

-- Fixtures: Public read access
CREATE POLICY "Fixtures are viewable by everyone" ON fixtures
  FOR SELECT USING (true);

-- Standings: Public read access
CREATE POLICY "Standings are viewable by everyone" ON standings
  FOR SELECT USING (true);

-- Users: Users can view all profiles, but only update their own
CREATE POLICY "Users can view all profiles" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- News: Published news viewable by everyone, unpublished only by admins
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

-- Quinielas: Public quinielas viewable by everyone
CREATE POLICY "Public quinielas viewable by everyone" ON quinielas
  FOR SELECT USING (is_public = true OR creator_id = auth.uid());

CREATE POLICY "Authenticated users can create quinielas" ON quinielas
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their quinielas" ON quinielas
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their quinielas" ON quinielas
  FOR DELETE USING (auth.uid() = creator_id);

-- Quiniela Predictions: Participants can view predictions in their quinielas
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

-- Quiniela Participants: Public read for public quinielas
CREATE POLICY "Participants viewable in public quinielas" ON quiniela_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM quinielas 
      WHERE id = quiniela_participants.quiniela_id 
      AND is_public = true
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can join quinielas" ON quiniela_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id OR guest_name IS NOT NULL);

-- API Request Log: Admin only
CREATE POLICY "Admins can view API logs" ON api_request_log
  FOR SELECT USING (
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update fixture updated_at timestamp
CREATE OR REPLACE FUNCTION update_fixture_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fixture_updated_at
BEFORE UPDATE ON fixtures
FOR EACH ROW
EXECUTE FUNCTION update_fixture_timestamp();

-- Function to update news updated_at timestamp
CREATE OR REPLACE FUNCTION update_news_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER news_updated_at
BEFORE UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION update_news_timestamp();

-- Function to calculate quiniela points
CREATE OR REPLACE FUNCTION calculate_prediction_points(
  predicted_home INTEGER,
  predicted_away INTEGER,
  actual_home INTEGER,
  actual_away INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  points INTEGER := 0;
  predicted_result TEXT;
  actual_result TEXT;
  predicted_diff INTEGER;
  actual_diff INTEGER;
BEGIN
  -- Exact score: 5 points
  IF predicted_home = actual_home AND predicted_away = actual_away THEN
    RETURN 5;
  END IF;
  
  -- Determine results
  IF predicted_home > predicted_away THEN
    predicted_result := 'H';
  ELSIF predicted_home < predicted_away THEN
    predicted_result := 'A';
  ELSE
    predicted_result := 'D';
  END IF;
  
  IF actual_home > actual_away THEN
    actual_result := 'H';
  ELSIF actual_home < actual_away THEN
    actual_result := 'A';
  ELSE
    actual_result := 'D';
  END IF;
  
  -- Correct result: 3 points
  IF predicted_result = actual_result THEN
    points := points + 3;
  END IF;
  
  -- Correct goal difference: 1 point
  predicted_diff := predicted_home - predicted_away;
  actual_diff := actual_home - actual_away;
  
  IF predicted_diff = actual_diff THEN
    points := points + 1;
  END IF;
  
  RETURN points;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE teams IS 'World Cup teams';
COMMENT ON TABLE fixtures IS 'World Cup matches/fixtures';
COMMENT ON TABLE standings IS 'Group stage standings';
COMMENT ON TABLE users IS 'Extended user profiles';
COMMENT ON TABLE news IS 'News articles (admin created)';
COMMENT ON TABLE quinielas IS 'Prediction pools/betting pools';
COMMENT ON TABLE quiniela_predictions IS 'Individual match predictions within a quiniela';
COMMENT ON TABLE quiniela_participants IS 'Users and guests participating in quinielas';
COMMENT ON TABLE api_request_log IS 'Track API-Football requests for rate limiting';
