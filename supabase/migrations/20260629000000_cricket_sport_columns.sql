-- Add sport columns to matches for cricket betting
ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS sport text NOT NULL DEFAULT 'cricket',
  ADD COLUMN IF NOT EXISTS external_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS sport_id integer DEFAULT 25,
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS home_logo text,
  ADD COLUMN IF NOT EXISTS away_logo text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Add external_id to odds_markets for upsert idempotency
ALTER TABLE public.odds_markets
  ADD COLUMN IF NOT EXISTS external_id text UNIQUE,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_matches_sport ON public.matches(sport);
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON public.matches(start_time);
