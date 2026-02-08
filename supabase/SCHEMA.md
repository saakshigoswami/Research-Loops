# Tokenized Research Participation Platform – Supabase Schema

## Overview

- **PostgreSQL** via Supabase; normalized.
- **No PII** in any table. Survey answers live in **responses** as flexible `jsonb`, linked to **enrollment** (not wallet).
- Study metadata lives on **IPFS** (only `ipfs_cid` is stored).
- **Payments** are handled off-DB (e.g. Yellow Network); we store **payout confirmation** (`payout_tx_hash`) and enrollment status.

---

## Relationships

```
researchers (1) ──────────< studies (N)
    │                           │
    │                           │
    │                      enrollments (N) ──────< responses (0..1 per enrollment)
    │                           │
    └───────────────────────────┴────────< participants (N)
```

| Table         | Role |
|---------------|------|
| **researchers** | One row per researcher (by `wallet_address`). Optional `ens_name`. |
| **studies**     | One row per study; `researcher_id` → researchers. `ipfs_cid` = pointer to IPFS metadata. |
| **participants**| One row per participant (by `wallet_address`). No PII. |
| **enrollments** | Many-to-many between studies and participants. Tracks `joined` → `completed` → `paid` and stores `payout_tx_hash` after Yellow settlement. Unique on `(study_id, participant_id)`. |
| **responses**   | One row per enrollment: survey/study answers as `response_data` (jsonb). Linked to enrollment only; no PII. Flexible structure for judges. |

**Data flow (high level):**

1. Researcher creates study → insert **studies** (and metadata to IPFS, then set `ipfs_cid`).
2. Participant joins study → insert **participants** (if new) + **enrollments** with `status = 'joined'`.
3. Participant completes study → update **enrollments** to `status = 'completed'`, set `completed_at`.
4. Yellow payout completes → update **enrollments** to `status = 'paid'`, set `payout_tx_hash`.
5. Participant submits answers → insert **responses** (one per enrollment); `response_data` is flexible jsonb (no PII).

---

## Example Supabase Queries

Assume you use the **Supabase client** (e.g. `supabase.from('table')`) or SQL in the SQL Editor.

### 1. Create a study

After the researcher exists (insert into `researchers` if needed), insert a study. Set `ipfs_cid` after uploading metadata to IPFS.

```javascript
// 1a. Ensure researcher exists (e.g. on first study create)
const { data: researcher } = await supabase
  .from('researchers')
  .upsert(
    { wallet_address: '0x1234...', ens_name: 'alice.eth' },
    { onConflict: 'wallet_address' }
  )
  .select('id')
  .single();

// 1b. Insert study (ipfs_cid can be updated after IPFS upload)
const { data: study } = await supabase
  .from('studies')
  .insert({
    researcher_id: researcher.id,
    title: 'AI Ethics Survey 2026',
    ipfs_cid: null, // set after IPFS upload
    reward_amount: 45,
    max_participants: 500,
    status: 'draft'
  })
  .select()
  .single();

// 1c. After uploading metadata to IPFS, update CID
await supabase
  .from('studies')
  .update({ ipfs_cid: 'QmXxx...', status: 'open' })
  .eq('id', study.id);
```

**Raw SQL:**

```sql
INSERT INTO studies (researcher_id, title, ipfs_cid, reward_amount, max_participants, status)
VALUES (
  'uuid-of-researcher',
  'AI Ethics Survey 2026',
  'QmXxx...',
  45,
  500,
  'open'
)
RETURNING *;
```

---

### 2. Join a study

Ensure the participant exists (by wallet), then insert an enrollment with `status = 'joined'`.

```javascript
// 2a. Get or create participant by wallet
let participant;
const { data: existing } = await supabase
  .from('participants')
  .select('id')
  .eq('wallet_address', '0xabcd...')
  .single();

if (existing) {
  participant = existing;
} else {
  const { data: created } = await supabase
    .from('participants')
    .insert({ wallet_address: '0xabcd...' })
    .select('id')
    .single();
  participant = created;
}

// 2b. Enroll in study (unique on study_id + participant_id prevents double-join)
const { error } = await supabase
  .from('enrollments')
  .insert({
    study_id: studyId,
    participant_id: participant.id,
    status: 'joined'
  });

if (error && error.code === '23505') {
  // Unique violation = already enrolled
}
```

**Raw SQL:**

```sql
-- Get or create participant (use app logic or a function)
INSERT INTO participants (wallet_address)
VALUES ('0xabcd...')
ON CONFLICT (wallet_address) DO NOTHING;

INSERT INTO enrollments (study_id, participant_id, status)
SELECT
  'uuid-of-study',
  p.id,
  'joined'
FROM participants p
WHERE p.wallet_address = '0xabcd...'
ON CONFLICT (study_id, participant_id) DO NOTHING
RETURNING *;
```

---

### 3. Mark completion

Set `status = 'completed'` and `completed_at = now()` for the enrollment.

```javascript
const { data } = await supabase
  .from('enrollments')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString()
  })
  .eq('id', enrollmentId)
  .eq('status', 'joined')
  .select()
  .single();
```

**Raw SQL:**

```sql
UPDATE enrollments
SET status = 'completed', completed_at = now()
WHERE id = 'uuid-of-enrollment'
  AND status = 'joined'
RETURNING *;
```

---

### 4. Record payout (after Yellow settlement)

Set `status = 'paid'` and `payout_tx_hash` to the on-chain settlement tx.

```javascript
const { data } = await supabase
  .from('enrollments')
  .update({
    status: 'paid',
    payout_tx_hash: '0xabc123...'
  })
  .eq('id', enrollmentId)
  .eq('status', 'completed')
  .select()
  .single();
```

**Raw SQL:**

```sql
UPDATE enrollments
SET status = 'paid', payout_tx_hash = '0xabc123...'
WHERE id = 'uuid-of-enrollment'
  AND status = 'completed'
RETURNING *;
```

---

### 5. Submit response (survey answers)

One row per enrollment. `response_data` is flexible jsonb (e.g. `{ "q1": "option_a", "q2": [3, 5], "notes": "..." }`). Store no PII.

```javascript
const { data } = await supabase
  .from('responses')
  .upsert(
    {
      enrollment_id: enrollmentId,
      response_data: { q1: 'option_a', q2: [3, 5], completed: true }
    },
    { onConflict: 'enrollment_id' }
  )
  .select()
  .single();
```

**Raw SQL:**

```sql
INSERT INTO responses (enrollment_id, response_data)
VALUES ('uuid-of-enrollment', '{"q1": "option_a", "q2": [3, 5]}'::jsonb)
ON CONFLICT (enrollment_id) DO UPDATE
SET response_data = EXCLUDED.response_data
RETURNING *;
```

---

## Useful read queries

- **Open studies (for participant feed):**

```sql
SELECT s.*, r.ens_name AS researcher_ens
FROM studies s
JOIN researchers r ON r.id = s.researcher_id
WHERE s.status = 'open'
ORDER BY s.created_at DESC;
```

- **Enrollments for a study (with participant wallet):**

```sql
SELECT e.*, p.wallet_address
FROM enrollments e
JOIN participants p ON p.id = e.participant_id
WHERE e.study_id = 'uuid-of-study'
ORDER BY e.joined_at DESC;
```

- **Studies and enrollment counts:**

```sql
SELECT s.id, s.title, s.status,
       COUNT(e.id) FILTER (WHERE e.status IN ('joined', 'completed', 'paid')) AS enrolled,
       COUNT(e.id) FILTER (WHERE e.status = 'paid') AS paid_count
FROM studies s
LEFT JOIN enrollments e ON e.study_id = s.id
GROUP BY s.id, s.title, s.status;
```

- **Responses for a study** (response data only; no participant identity in result):

```sql
SELECT r.id, r.enrollment_id, r.response_data, r.created_at
FROM responses r
JOIN enrollments e ON e.id = r.enrollment_id
WHERE e.study_id = 'uuid-of-study'
ORDER BY r.created_at DESC;
```

---

## Running the migration

With Supabase CLI:

```bash
supabase db push
```

Or run the contents of `supabase/migrations/20260207000001_tokenized_research_schema.sql` in the Supabase Dashboard → SQL Editor.
