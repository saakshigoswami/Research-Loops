-- Yellow Network: store session id and funded amount per study (no schema redesign).
ALTER TABLE studies
  ADD COLUMN IF NOT EXISTS yellow_session_id TEXT,
  ADD COLUMN IF NOT EXISTS funded_amount NUMERIC;

COMMENT ON COLUMN studies.yellow_session_id IS 'Yellow/Nitrolite app session id when study is funded.';
COMMENT ON COLUMN studies.funded_amount IS 'Amount (e.g. USDC) locked in Yellow session for this study.';
