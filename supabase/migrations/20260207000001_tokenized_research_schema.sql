-- Tokenized Research Participation Platform
-- Supabase (PostgreSQL) schema – hackathon-ready, normalized
-- No sensitive personal data; no survey answers stored.

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE study_status AS ENUM ('draft', 'open', 'closed');

CREATE TYPE enrollment_status AS ENUM ('joined', 'completed', 'paid');

-- =============================================================================
-- TABLES
-- =============================================================================

-- 1. researchers
-- One row per researcher (identified by wallet). ENS name optional.
CREATE TABLE researchers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  ens_name       TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_researchers_wallet ON researchers (wallet_address);

-- 2. studies
-- One row per study. Metadata lives on IPFS; we store only the CID.
CREATE TABLE studies (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  researcher_id    UUID NOT NULL REFERENCES researchers (id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  ipfs_cid         TEXT,
  reward_amount    NUMERIC NOT NULL CHECK (reward_amount >= 0),
  max_participants INTEGER NOT NULL CHECK (max_participants > 0),
  status           study_status NOT NULL DEFAULT 'draft',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_studies_researcher ON studies (researcher_id);
CREATE INDEX idx_studies_status ON studies (status);

-- 3. participants
-- One row per participant (identified by wallet). No PII.
CREATE TABLE participants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_participants_wallet ON participants (wallet_address);

-- 4. enrollments
-- Links participant to study; tracks join → complete → paid.
CREATE TABLE enrollments (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id       UUID NOT NULL REFERENCES studies (id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants (id) ON DELETE CASCADE,
  status         enrollment_status NOT NULL DEFAULT 'joined',
  joined_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at   TIMESTAMPTZ,
  payout_tx_hash TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (study_id, participant_id)
);

CREATE INDEX idx_enrollments_study ON enrollments (study_id);
CREATE INDEX idx_enrollments_participant ON enrollments (participant_id);
CREATE INDEX idx_enrollments_status ON enrollments (status);

-- =============================================================================
-- CONSTRAINTS (optional, for data integrity)
-- =============================================================================

-- completed_at and payout_tx_hash should be set when status advances
ALTER TABLE enrollments
  ADD CONSTRAINT chk_enrollment_status_dates
  CHECK (
    (status = 'joined' AND completed_at IS NULL AND payout_tx_hash IS NULL) OR
    (status = 'completed' AND completed_at IS NOT NULL AND payout_tx_hash IS NULL) OR
    (status = 'paid' AND completed_at IS NOT NULL AND payout_tx_hash IS NOT NULL)
  );

COMMENT ON TABLE researchers IS 'Researchers who create and fund studies (wallet + optional ENS).';
COMMENT ON TABLE studies IS 'Studies: metadata on IPFS (ipfs_cid); funding via Yellow Network.';
COMMENT ON TABLE participants IS 'Participants identified by wallet only; no PII.';
COMMENT ON TABLE enrollments IS 'Join → complete → paid; payout_tx_hash from Yellow settlement.';
