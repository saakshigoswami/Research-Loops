# Supabase integration – step-by-step

Follow these steps in order. Each step is implemented in the codebase; you only need to configure env and run the app.

---

## Step 1: Get your Supabase URL and anon key

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Create a project (or use an existing one).
3. In the project: **Settings → API**.
4. Copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon public** key (under "Project API keys").

---

## Step 2: Configure environment variables

1. In the project root, create a file named **`.env`** (or copy from `.env.example`).
2. Add:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

3. Replace with your actual URL and anon key.
4. **Do not commit `.env`** (it should already be in `.gitignore`).

---

## Step 3: Apply database migrations (if not already done)

Your schema lives in `supabase/migrations/`. To create the tables:

**Option A – Supabase Dashboard**

1. In Supabase: **SQL Editor**.
2. Run each migration file in order:
   - `20260207000001_tokenized_research_schema.sql`
   - `20260207000002_seed_dummy_data.sql`
   - `20260207000003_responses_table.sql`

**Option B – Supabase CLI**

```bash
npx supabase link   # if not linked
npx supabase db push
```

---

## Step 4: Install dependencies and run the app

```bash
npm install
npm run dev
```

The app will:

- **Load studies** from Supabase on startup (and when you open Dashboard / Trending).
- **Create study**: as a researcher, "Launch New Project" → submit form → study is inserted into `studies` (researcher is upserted into `researchers` by wallet).
- **Join study**: as a participant, "Apply Now" / "Participate in Research" → submit form → enrollment is inserted into `enrollments` (participant is upserted into `participants` by wallet).

---

## Step 5: Wallet placeholder (until you add real wallet connection)

The DB identifies researchers and participants by **wallet address**. The app does not have a wallet connection yet, so it uses placeholders:

- **Researcher**: wallet = `0x0000000000000000000000000000000000000001` (or the value you set in the create-study flow).
- **Participant**: wallet = `0x0000000000000000000000000000000000000002` (or derived from the logged-in participant’s email/id).

These are set in `lib/supabase.ts` / the service layer. When you integrate a real wallet (e.g. Wagmi, ethers), replace the placeholder with `account.address`.

---

## Step 6: Verify in Supabase

1. **Table Editor** in the Supabase dashboard.
2. After creating a study: check **researchers** and **studies** for new rows.
3. After applying to a study: check **participants** and **enrollments** for new rows.

---

## Summary of what was added

| Item | Purpose |
|------|--------|
| `@supabase/supabase-js` | Supabase client |
| `.env.example` | Template for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| `lib/supabase.ts` | Creates Supabase client from env |
| `lib/studyService.ts` | Fetch studies (with researcher), create study (upsert researcher + insert study), update study status |
| `lib/participantService.ts` | Ensure participant by wallet, join study (insert enrollment) |
| `App.tsx` | Loads studies from Supabase; create study (with **max participants** field) and join study call the services above |

---

## IPFS (Pinata) – optional

Study metadata (title, description, eligibility, location, category) is uploaded as JSON to IPFS when you create a study; the returned CID is stored in `studies.ipfs_cid`. The frontend fetches metadata by CID and shows description/eligibility on cards.

1. Sign up at [pinata.cloud](https://pinata.cloud).
2. **API Keys** → **New Key** → enable **pinJSONToIPFS** → create and copy the **JWT**.
3. Add to your `.env`:

```env
VITE_PINATA_JWT=your_pinata_jwt_here
```

4. Restart the dev server. When creating a study (with Supabase configured), the app will upload metadata to IPFS and save the CID in Supabase. Studies with a CID will have description/eligibility filled from IPFS when the list is loaded.

Without `VITE_PINATA_JWT`, studies are still created in Supabase with `ipfs_cid = null`; only the IPFS upload is skipped.

---

## Summary of what was added

| Item | Purpose |
|------|--------|
| `@supabase/supabase-js` | Supabase client |
| `.env.example` | Template for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_PINATA_JWT` |
| `lib/supabase.ts` | Creates Supabase client from env |
| `lib/studyService.ts` | Fetch studies (with researcher + IPFS metadata when CID set), create study (with optional ipfsCid), update study status |
| `lib/participantService.ts` | Ensure participant by wallet, join study (insert enrollment) |
| `lib/ipfs.ts` | Upload study metadata to Pinata, fetch metadata by CID |
| `App.tsx` | Loads studies from Supabase; create study uploads metadata to IPFS then saves CID in DB; join study writes enrollment |

Next: Yellow Network for payments/session logic.
