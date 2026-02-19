-- Champions table (seeded from DDragon)
CREATE TABLE IF NOT EXISTS champions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  riot_key TEXT UNIQUE NOT NULL,
  riot_id TEXT NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  tags TEXT[] DEFAULT '{}',
  roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Pro matches (scraped from probuildstats.com)
CREATE TABLE IF NOT EXISTS pro_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_key TEXT NOT NULL,
  pro_player TEXT NOT NULL,
  team TEXT,
  region TEXT,
  role TEXT,
  kills INT DEFAULT 0,
  deaths INT DEFAULT 0,
  assists INT DEFAULT 0,
  win BOOLEAN DEFAULT false,
  items INT[] DEFAULT '{}',
  rune_primary_keystone INT,
  rune_primary_tree INT,
  rune_secondary_tree INT,
  spell1 INT,
  spell2 INT,
  skill_order TEXT,
  item_timeline JSONB,
  vs_champion TEXT,
  cs INT,
  gold INT,
  damage INT,
  duration_minutes REAL,
  match_date TIMESTAMPTZ DEFAULT now(),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Meta builds (aggregated)
CREATE TABLE IF NOT EXISTS meta_builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_key TEXT NOT NULL,
  role TEXT NOT NULL,
  win_rate REAL DEFAULT 0,
  pick_rate REAL DEFAULT 0,
  match_count INT DEFAULT 0,
  popular_items JSONB DEFAULT '[]',
  popular_boots JSONB DEFAULT '[]',
  popular_runes JSONB DEFAULT '[]',
  popular_spells JSONB DEFAULT '[]',
  skill_order TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(champion_key, role)
);

-- Matchup data (FAZ 3 - empty for now)
CREATE TABLE IF NOT EXISTS matchup_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_key TEXT NOT NULL,
  vs_champion_key TEXT NOT NULL,
  role TEXT,
  win_rate REAL DEFAULT 0,
  match_count INT DEFAULT 0,
  recommended_items JSONB DEFAULT '[]',
  recommended_runes JSONB DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(champion_key, vs_champion_key, role)
);

-- Champion tags (FAZ 3 - empty for now)
CREATE TABLE IF NOT EXISTS champion_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_key TEXT NOT NULL,
  tag TEXT NOT NULL,
  UNIQUE(champion_key, tag)
);

-- Precomputed scores (FAZ 3 - empty for now)
CREATE TABLE IF NOT EXISTS precomputed_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  champion_key TEXT NOT NULL,
  context_key TEXT NOT NULL,
  score REAL DEFAULT 0,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(champion_key, context_key)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pro_matches_champion ON pro_matches(champion_key);
CREATE INDEX IF NOT EXISTS idx_pro_matches_date ON pro_matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_pro_matches_role ON pro_matches(role);
CREATE INDEX IF NOT EXISTS idx_meta_builds_champion ON meta_builds(champion_key);
CREATE INDEX IF NOT EXISTS idx_champions_riot_key ON champions(riot_key);
