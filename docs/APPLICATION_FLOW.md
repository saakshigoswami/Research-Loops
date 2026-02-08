# ReSearch Connect – Application flow

Overview of the flows built for **researchers** and **subjects (participants)**.

---

## Researcher flow

### 1. Land on the app (logged out)
- Sees **landing page**: hero, stats (opportunities, categories, spots, rewards), pillars (Research Labs, Product Testing, Surveys), feature strip, footer.
- Can click **“Launch Research Lab”** → logs in as researcher (mock; no wallet yet).
- Can click **“Post Research”** in nav → same researcher login.

### 2. Logged in as researcher
- **Nav**: Home, Trending, Meet People, **My Dashboard**, Collaborations, Data Exchange, profile, Logout.
- **Home (Dashboard)**:
  - “Your Study Dashboard” – list of studies (from Supabase; filtered to their studies + seed/mock).
  - **“+ Launch New Project”** opens **Create study** modal.

### 3. Create study
- **Launch New Project** modal:
  - Project title, Compensation ($), Max participants, Category, Eligibility, Description.
  - Optional: **“✨ AI Assist Content”** (Gemini) to fill title/description/eligibility.
  - **Publish Listing** → disabled with “Publishing…” while submitting.
- **On submit** (when Supabase + optional IPFS are configured):
  1. Researcher is **upserted** in `researchers` (by placeholder wallet).
  2. If IPFS (Pinata) is configured: study **metadata** (title, description, eligibility, location, category) is **uploaded to IPFS** → CID returned.
  3. **Study** is **inserted** in `studies` (with `ipfs_cid` if available, `reward_amount`, `max_participants`, `status: open`).
  4. Study list is **refetched** (Home + My Dashboard).

### 4. My Dashboard (researcher)
- **Dark theme** screen: “My research” – studies **you** created.
- **Stats**: Studies posted, Open, Total participants, Est. rewards.
- **List**: Each study shows title, description snippet, status (OPEN/CLOSED), participant count, compensation, created date.
- **Edit** → opens **Edit study** modal (pre-filled). Save updates DB (+ optional IPFS re-upload and new CID).
- **Delete** → confirmation: “Study and all enrollments will be removed.” Confirm → study deleted (CASCADE on enrollments), lists refetched.

### 5. Other researcher screens
- **Collaborations** – mock collaboration requests; “Post Request” / “Express Interest” (alerts).
- **Data Exchange** – mock data assets; “Upload Dataset” / “Request Access” (alerts).
- **Meet People** – community profiles (researchers + subjects); view full profile, LinkedIn if present.
- **Trending** – same opportunity list as participants (all studies); no Apply (researcher view).

### 6. Study data and identity
- Studies are **indexed in Supabase** (`studies` + `researchers`).
- **Immutable metadata** (title, description, eligibility, etc.) can live on **IPFS**; CID stored in `studies.ipfs_cid`.
- Researcher identity: **placeholder wallet** until real wallet (e.g. Wagmi) is connected; then replace with `account.address`.

---

## Subject (participant) flow

### 1. Land on the app (logged out)
- Same landing page.
- **“Join as Subject”** / **“Get Started”** / pillar cards (e.g. “Start Testing”, “Take Survey”) → open **participant flow** modal.

### 2. Participant auth (no wallet yet)
- **Choose**: “Login with email” or “Create new profile”.
- **Login**: Enter email → match against **participant profiles** in `localStorage` → log in as that profile.
- **Create profile**: Name, email, bio, expertise, location, **optional LinkedIn URL** → profile saved in `localStorage` and user logged in.
- (Participant **profiles** are local; **enrollments** and **participants** in Supabase are keyed by **placeholder wallet** when they join a study.)

### 3. Logged in as subject
- **Nav**: Home, Trending, Meet People, **My Dashboard**, profile, Logout.
- **Home**:
  - “Available Opportunities” – studies filtered by category/search (from Supabase, metadata from IPFS when CID present).
  - **Study cards**: title, researcher, description, eligibility, location, compensation.
  - **“Participate in Research”** → opens **Apply to Participate** modal.

### 4. Apply to a study
- **Apply to Participate** modal: study title, Full name, Relevant background (form only; not stored in DB).
- **Submit** (when Supabase configured):
  1. **Participant** is **upserted** in `participants` (by placeholder wallet).
  2. **Enrollment** is **inserted** in `enrollments` (`study_id`, `participant_id`, `status: 'joined'`).
  3. If already enrolled → “You are already enrolled.”
  4. Study list is **refetched** (so participant counts update).

### 5. My Dashboard (subject)
- **Dark theme** screen: “Studies I joined”.
- **Stats**: Studies joined, In progress (joined), Completed, Paid.
- **List**: Each enrollment shows study title, description snippet, **status** (joined / completed / paid), compensation, joined date, completed date (if any).
- (Marking **completed** / **paid** is not yet in the UI; DB and schema support it for Yellow/payout integration.)

### 6. Other subject screens
- **Trending** – dark dashboard: stats, “Available Opportunities” list, search/category filter, **“Apply Now”** per study (same apply flow as Home).
- **Meet People** – same community profiles; view full profile, LinkedIn if present.

### 7. Identity and data
- **Display identity**: name, email, bio, etc. from **participant profile** (localStorage).
- **Supabase identity** for enrollments: **placeholder wallet** until real wallet is connected; then use `account.address` for `participants` / `enrollments`.
- No PII is stored on IPFS or on-chain; only study metadata and enrollment state in DB.

---

## Shared / technical

| Layer        | Role        | Purpose |
|-------------|-------------|--------|
| **Supabase** | Both        | Researchers, studies, participants, enrollments, responses (index + mutable state). |
| **IPFS**     | Researcher  | Public, immutable study metadata; CID stored in `studies.ipfs_cid`. |
| **Placeholder wallets** | Both | Researcher/participant IDs in DB until real wallet (e.g. Yellow) is integrated. |
| **My Dashboard** | Both   | Role-specific dark dashboard: researcher = studies created + edit/delete; subject = studies joined + status. |

---

## Flow summary

**Researcher:**  
Land → Login as researcher → Home → **Create study** (form → IPFS metadata → Supabase study) → **My Dashboard** (view / **Edit** / **Delete** studies) → optional Collaborations / Data Exchange / Meet People / Trending.

**Subject:**  
Land → **Participant flow** (login or create profile) → Home or Trending → **Apply to study** (Supabase participant + enrollment) → **My Dashboard** (view studies joined and status) → optional Meet People / Trending.

Next integration: **Yellow Network** for funding studies and paying participants (payments/session logic), using existing Supabase + IPFS flows without refactor.
