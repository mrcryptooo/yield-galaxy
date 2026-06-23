-- Yield Galaxy: Initial Schema
-- 3 tables: sources, opportunities, snapshots

-- Sources: protocol metadata (seeded, rarely changes)
CREATE TABLE sources (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  icon_url    TEXT,
  risk_base   SMALLINT NOT NULL DEFAULT 25,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Opportunities: yield positions (upserted by cron)
CREATE TABLE opportunities (
  id              TEXT PRIMARY KEY,
  source_id       TEXT NOT NULL REFERENCES sources(id),
  name            TEXT NOT NULL,
  symbol          TEXT NOT NULL,
  token_a         TEXT NOT NULL,
  token_b         TEXT,
  chain           TEXT NOT NULL DEFAULT 'Solana',
  strategy        TEXT NOT NULL CHECK (strategy IN ('lending','lp','staking','vault','pt','yt')),
  base_apy        DOUBLE PRECISION NOT NULL DEFAULT 0,
  reward_apy      DOUBLE PRECISION NOT NULL DEFAULT 0,
  total_apy       DOUBLE PRECISION NOT NULL DEFAULT 0,
  tvl             DOUBLE PRECISION NOT NULL DEFAULT 0,
  risk_grade      TEXT NOT NULL DEFAULT 'C' CHECK (risk_grade IN ('A','B','C','D','F')),
  score           SMALLINT NOT NULL DEFAULT 50,
  celestial_type  TEXT NOT NULL CHECK (celestial_type IN ('planet','moon','station')),
  celestial_body  TEXT NOT NULL,
  pool_url        TEXT,
  pool_meta       TEXT,
  il_risk         TEXT NOT NULL DEFAULT 'none' CHECK (il_risk IN ('none','low','medium','high')),
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_opportunities_score ON opportunities(score DESC);
CREATE INDEX idx_opportunities_apy ON opportunities(total_apy DESC);
CREATE INDEX idx_opportunities_source ON opportunities(source_id);
CREATE INDEX idx_opportunities_active ON opportunities(is_active) WHERE is_active = true;

-- Snapshots: append-only time series (moat data)
CREATE TABLE snapshots (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  opportunity_id  TEXT NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
  total_apy       DOUBLE PRECISION NOT NULL,
  base_apy        DOUBLE PRECISION NOT NULL DEFAULT 0,
  reward_apy      DOUBLE PRECISION NOT NULL DEFAULT 0,
  tvl             DOUBLE PRECISION NOT NULL,
  score           SMALLINT,
  risk_grade      TEXT CHECK (risk_grade IN ('A','B','C','D','F')),
  granularity     TEXT NOT NULL DEFAULT 'raw' CHECK (granularity IN ('raw','hourly','daily')),
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_snapshots_lookup ON snapshots(opportunity_id, recorded_at DESC);
CREATE INDEX idx_snapshots_time ON snapshots(recorded_at);
CREATE INDEX idx_snapshots_granularity ON snapshots(granularity, recorded_at) WHERE granularity != 'raw';

-- Row-Level Security
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access (anon key can SELECT, nothing else)
CREATE POLICY "sources_read" ON sources FOR SELECT USING (true);
CREATE POLICY "opportunities_read" ON opportunities FOR SELECT USING (true);
CREATE POLICY "snapshots_read" ON snapshots FOR SELECT USING (true);

-- Seed sources (IDs match DefiLlama project names exactly)
INSERT INTO sources (id, name, url, risk_base) VALUES
  ('kamino-lend',      'Kamino',     'https://app.kamino.finance',  15),
  ('kamino-liquidity', 'Kamino',     'https://app.kamino.finance',  15),
  ('raydium-amm',      'Raydium',   'https://raydium.io',          10),
  ('orca-dex',         'Orca',      'https://www.orca.so',         12),
  ('loopscale',        'Loopscale', 'https://app.loopscale.com',   28);
