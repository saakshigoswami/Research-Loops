# Pre–Yellow Network integration review

**Date:** 2026-02-07  
**Conclusion:** **Not ready** for Yellow integration. Supabase and IPFS are not wired into the app; all data is in-memory. The items below must be implemented first.

---

## 1. Supabase (database layer)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Studies table exists and works (create, read, update) | ❌ **App not connected** | Schema and migrations exist in `supabase/migrations/`. **No `@supabase/supabase-js` in `package.json`.** No `createClient` or `.from('studies')` anywhere in the app. |
| Researcher can create a study | ⚠️ **Local only** | `handleCreateStudy` in `App.tsx` only does `setStudies([newStudy, ...studies])`. Study is never inserted into Supabase. |
| Participant can join a study | ❌ **Not implemented** | “Apply to Participate” submits the form and shows `alert("Application sent!")`. No insert into `participants` or `enrollments`. No wallet/researcher identity used for DB. |
| Study status updates correctly (open / completed) | ❌ **N/A** | Studies live in React state; no DB status. Frontend uses `ResearchStudy.status` as `'OPEN' \| 'CLOSED'` (not Supabase `study_status` enum). |
| IPFS CID is stored correctly against each study | ❌ **N/A** | No Supabase studies in app; no `ipfs_cid` field in `ResearchStudy` type or in create flow. |

**Verdict:** Supabase is only used for schema and seed data. The frontend does not call Supabase for studies, researchers, participants, or enrollments.

---

## 2. IPFS (metadata layer)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Study metadata (title, description, background, consent, questions) uploaded as JSON to IPFS | ❌ **Not implemented** | No IPFS client (Pinata, web3.storage, NFT.Storage, or raw gateway) in the repo. No upload function or call in create-study flow. |
| CID returned from IPFS is valid and retrievable | ❌ **N/A** | No upload, so no CID. |
| Frontend fetches and renders study metadata using the CID | ❌ **Not implemented** | No fetch by CID. `StudyCard` and study lists use `ResearchStudy` from state (title, description, etc.). No `ipfs_cid` on type or in UI. |

**Verdict:** No IPFS integration. Study metadata exists only in React state (and in create form); nothing is published to IPFS or read from IPFS.

---

## 3. Frontend flow

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Researcher: create study → metadata upload → DB entry | ❌ | Create study only updates local state. No metadata JSON built, no IPFS upload, no Supabase insert. |
| Participant: view studies → join study → complete mock study | ⚠️ Partial | View studies: ✅ (from local state). Join: modal only, no enrollment in DB. Complete: no “complete study” or response flow; no `responses` table usage. |
| No sensitive or personal data on-chain or on IPFS | ✅ Design only | App does not store PII on-chain or on IPFS because it does not use either for persistence yet. Design (Supabase schema + SCHEMA.md) is PII-aware. |

**Verdict:** Researcher and participant flows are UI-only; no end-to-end persistence via Supabase or IPFS.

---

## 4. Architecture sanity check

| Intended design | Current reality |
|-----------------|-----------------|
| Supabase as index / mutable database | Schema exists; **app does not use Supabase**. All mutable data is in React state. |
| IPFS for public, immutable study metadata | **Not used.** No upload or fetch. |
| No unnecessary blockchain storage | ✅ No on-chain storage in app yet. |

**Verdict:** Architecture is defined in docs and migrations but not implemented in the app.

---

## 5. Are we ready to move to Yellow Network integration?

**No.** The following must be in place first so Yellow can plug into a real study/enrollment/payout flow without refactors.

---

## 6. Exact missing pieces (to fix before Yellow)

### 6.1 Supabase

1. **Add and configure client**
   - Add `@supabase/supabase-js` to `package.json`.
   - Create `src/lib/supabase.ts` (or similar) with `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)`.
   - Add env vars (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) and use them in the client.

2. **Researcher identity and study create**
   - When a researcher “launches” a study, resolve their **wallet** (and optional ENS) from your auth/wallet layer.
   - Upsert into `researchers` by `wallet_address`; get `researcher_id`.
   - Do **not** insert into `studies` from the current create form until step 6.2 is done (so that create flow does: build metadata → IPFS → then insert study with `ipfs_cid`).

3. **Study list and updates from DB**
   - Replace loading studies from mock `useEffect` with: fetch `studies` (join `researchers` if you want ENS) from Supabase.
   - When a researcher creates a study (after IPFS step below), insert into `studies` and refetch or optimistically update.
   - Optionally: support updating study (e.g. status to `closed`) and reflect in UI from Supabase.

4. **Participant join (enrollment)**
   - When participant submits “Apply to Participate”, resolve their **wallet** (from wallet connection).
   - Upsert `participants` by `wallet_address`; get `participant_id`.
   - Insert into `enrollments` with `study_id`, `participant_id`, `status: 'joined'`.
   - Show success and update UI (e.g. refetch enrollments or study list).

5. **Study status**
   - Use Supabase `study_status` (`draft` / `open` / `closed`) for studies. Map to/from your `ResearchStudy` or a separate DTO so the UI and DB stay in sync.

### 6.2 IPFS

1. **Upload study metadata**
   - Define a **study metadata JSON** shape (e.g. `title`, `description`, `background`, `consent`, `questions`). No PII.
   - After researcher fills create form, build this JSON and upload via an IPFS provider (e.g. Pinata API, web3.storage, or NFT.Storage).
   - Store the returned **CID** (e.g. in state and then in Supabase `studies.ipfs_cid` when you insert the study).

2. **Store CID in Supabase**
   - When inserting a study (after successful IPFS upload), set `ipfs_cid` to that CID.

3. **Fetch and render by CID**
   - For study detail or listing, when you have `ipfs_cid`, fetch JSON from IPFS (e.g. `https://gateway.pinata.cloud/ipfs/<cid>` or your chosen gateway).
   - Validate/parse the JSON and render title, description, consent, questions, etc. in the UI. Keep using Supabase for index data (e.g. reward, max_participants, status) and use IPFS only for immutable metadata.

### 6.3 Frontend flow (alignment)

1. **Researcher flow**
   - Create study form → build metadata JSON → upload to IPFS → get CID → insert row into `studies` (with `researcher_id`, `ipfs_cid`, `reward_amount`, `max_participants`, `status`) → show in dashboard from Supabase.

2. **Participant flow**
   - View studies: load from Supabase (and optionally fetch metadata by `ipfs_cid` for display).
   - Join study: on “Apply” / “Join”, ensure participant in `participants`, insert `enrollments` with status `joined`.
   - Complete mock study: add a minimal “Complete” step that updates `enrollments.status` to `completed` and sets `completed_at`; optionally insert into `responses` for mock answers (jsonb, no PII). This gives Yellow a clear “completed” state to hook payouts to.

### 6.4 Types and mapping

- Add `ipfs_cid?: string` to your frontend study type (or a DTO that mirrors `studies`).
- Map Supabase `study_status` ↔ your UI (e.g. `open` → “Open”, `closed` → “Closed”, `draft` → “Draft”).

---

## 7. After these are done: Yellow integration

Once:

- Studies and enrollments are created and updated in **Supabase**,
- Study metadata is on **IPFS** and CID is stored in **Supabase**,
- Participant **join** and **complete** update **enrollments** (and optionally **responses**),

then Yellow Network can be integrated **only for payments/session logic** without refactoring the rest:

- Use **Supabase** as source of truth for studies, enrollments, and completion.
- On “complete”, your backend or frontend can trigger Yellow session/payout; on Yellow settlement callback, update `enrollments.status` to `paid` and set `payout_tx_hash` in Supabase.

No need to change the Supabase schema or IPFS flow for Yellow; you only add the payment/session layer and the payout callback that updates `enrollments`.

---

## 8. Summary checklist (implement before Yellow)

- [ ] Supabase client added and env configured.
- [ ] Researcher create: wallet → upsert `researchers`; after IPFS upload, insert `studies` with `ipfs_cid`.
- [ ] Study list (and researcher dashboard) read from Supabase; study status from DB.
- [ ] Participant join: wallet → upsert `participants`; insert `enrollments` with status `joined`.
- [ ] Study metadata: upload JSON to IPFS on create; store CID in `studies.ipfs_cid`.
- [ ] Frontend: fetch metadata by CID and render (no PII in metadata).
- [ ] Participant “complete” flow: update `enrollments` to `completed` (+ optional `responses` row); no PII.
- [ ] Types and UI aligned with Supabase `study_status` and `ipfs_cid`.

After the above, you are ready to integrate Yellow for payments/session only, without refactoring existing Supabase or IPFS usage.
