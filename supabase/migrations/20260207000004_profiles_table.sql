-- Minimal profile per wallet (required to participate or create studies).
-- One row per wallet; same profile used for researcher and participant roles.

CREATE TABLE profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  display_name   TEXT NOT NULL,
  linkedin_url   TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_wallet ON profiles (wallet_address);

COMMENT ON TABLE profiles IS 'Minimal profile (display name, optional LinkedIn) per wallet; required to join or create studies.';
