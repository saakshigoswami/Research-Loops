-- Seed dummy data for Tokenized Research Participation Platform
-- Run after 20260207000001_tokenized_research_schema.sql

-- =============================================================================
-- RESEARCHERS
-- =============================================================================

INSERT INTO researchers (id, wallet_address, ens_name) VALUES
  ('a1000001-0000-4000-8000-000000000001', '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE9a', 'sarahchen.eth'),
  ('a1000001-0000-4000-8000-000000000002', '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199', 'mrodriguez.eth'),
  ('a1000001-0000-4000-8000-000000000003', '0xdD2FD4581271e230360230F9337D5c0430Bf44C0', NULL)
ON CONFLICT (wallet_address) DO NOTHING;

-- =============================================================================
-- STUDIES
-- =============================================================================

INSERT INTO studies (id, researcher_id, title, ipfs_cid, reward_amount, max_participants, status) VALUES
  ('b2000001-0000-4000-8000-000000000001', 'a1000001-0000-4000-8000-000000000001', 'AI Decision-Making Survey', 'QmX1y2z3abc123metadataAIethics', 45, 500, 'open'),
  ('b2000001-0000-4000-8000-000000000002', 'a1000001-0000-4000-8000-000000000001', 'Memory & Sleep Quality Questionnaire', 'QmY4y5z6def456metadataSleep', 30, 220, 'open'),
  ('b2000001-0000-4000-8000-000000000003', 'a1000001-0000-4000-8000-000000000002', 'Cryptocurrency and Savings Behavior', 'QmZ7z8z9ghi789metadataCrypto', 35, 189, 'open'),
  ('b2000001-0000-4000-8000-000000000004', 'a1000001-0000-4000-8000-000000000002', 'Remote Work Productivity Analysis', NULL, 85, 150, 'draft'),
  ('b2000001-0000-4000-8000-000000000005', 'a1000001-0000-4000-8000-000000000003', 'Wearable Health Monitor Beta', 'QmW0w1w2jkl012metadataWearable', 200, 28, 'closed')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- PARTICIPANTS
-- =============================================================================

INSERT INTO participants (id, wallet_address) VALUES
  ('c3000001-0000-4000-8000-000000000001', '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'),
  ('c3000001-0000-4000-8000-000000000002', '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'),
  ('c3000001-0000-4000-8000-000000000003', '0x90F79bf6EB2c4f870365E785982E1f101E93b906'),
  ('c3000001-0000-4000-8000-000000000004', '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65'),
  ('c3000001-0000-4000-8000-000000000005', '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc'),
  ('c3000001-0000-4000-8000-000000000006', '0x976EA74026E726554dB657fA54763abd0C3a0aa9')
ON CONFLICT (wallet_address) DO NOTHING;

-- =============================================================================
-- ENROLLMENTS (join → complete → paid)
-- =============================================================================

INSERT INTO enrollments (id, study_id, participant_id, status, joined_at, completed_at, payout_tx_hash) VALUES
  -- Study 1 (AI Survey): 2 paid, 1 completed, 2 joined
  ('d4000001-0000-4000-8000-000000000001', 'b2000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000001', 'paid', now() - interval '5 days', now() - interval '4 days', '0xabc111...tx1'),
  ('d4000001-0000-4000-8000-000000000002', 'b2000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000002', 'paid', now() - interval '3 days', now() - interval '2 days', '0xabc222...tx2'),
  ('d4000001-0000-4000-8000-000000000003', 'b2000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000003', 'completed', now() - interval '1 day', now() - interval '12 hours', NULL),
  ('d4000001-0000-4000-8000-000000000004', 'b2000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000004', 'joined', now() - interval '6 hours', NULL, NULL),
  ('d4000001-0000-4000-8000-000000000005', 'b2000001-0000-4000-8000-000000000001', 'c3000001-0000-4000-8000-000000000005', 'joined', now() - interval '2 hours', NULL, NULL),
  -- Study 2 (Sleep): 1 completed, 2 joined
  ('d4000001-0000-4000-8000-000000000006', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000001', 'completed', now() - interval '4 days', now() - interval '3 days', NULL),
  ('d4000001-0000-4000-8000-000000000007', 'b2000001-0000-4000-8000-000000000002', 'c3000001-0000-4000-8000-000000000006', 'joined', now() - interval '1 day', NULL, NULL),
  -- Study 3 (Crypto): 1 joined
  ('d4000001-0000-4000-8000-000000000008', 'b2000001-0000-4000-8000-000000000003', 'c3000001-0000-4000-8000-000000000002', 'joined', now() - interval '5 hours', NULL, NULL)
ON CONFLICT (study_id, participant_id) DO NOTHING;
