# ResearchOS

**The Incentive Operating System for Human Research. Research & earn.**

---

## What We Built

ResearchOS connects **researchers** who run studies with **participants** who join and get paid. Researchers post studies, fund them, and settle payouts; participants apply, complete tasks, and earn. Wallet-only auth, no email. One platform for recruitment, compensation, and identity.

**Hackathon integrations:** [**Yellow Network**](#-yellow-network-main-track) for funding and settlement; [**ENS**](#-ens-bonus-track) for researcher identity and portable profiles.

---

## Yellow Network (Main Track)

We use **Yellow Network** to power the full incentive flow: fund studies → pay participants → settle on-chain.

| Step | What happens |
|------|----------------|
| **Fund Study** | Researcher locks budget; we create a Yellow session and store `yellow_session_id` + `funded_amount` in Supabase. Funding UI states: *Funding by using Ethereum.* |
| **Complete Study** | Researcher marks participants complete; off-chain credit (mock) + enrollment status updated in DB. |
| **Settle Payouts** | Researcher settles; we get a payout tx hash from Yellow and store `payout_tx_hash` on enrollments. Settlement UI states: *Settling payment by using Yellow.* |

Session-based funding and settlement are wired end-to-end in the app (mock MVP for hackathon; production ClearNode/auth can be added later). **Yellow is the backbone of “research & earn.”**

---

## ENS (Bonus Track)

We use **ENS** so researchers are people, not just addresses.

- **Identity:** Primary ENS name resolved on **Ethereum mainnet** (`useEnsName`) and stored on researcher upsert and study creation. Study cards show `alice.eth` instead of `0x…`.
- **Portable profile:** For any researcher with an ENS name, we show **avatar** (`useEnsAvatar`) and **text records** (`useEnsText`): `description`, `url`, `com.twitter` on study cards. No hard-coded data—all from chain.

One wallet can be both researcher and participant; ENS gives researchers a consistent, portable identity across the app.

---

## Run Locally

**Prerequisites:** Node.js

1. **Install:** `npm install`
2. **Env (optional):** Add `VITE_GEMINI_API_KEY` in [.env.local](.env.local) for AI Assist when creating studies. See [.env.example](.env.example) for Supabase, WalletConnect, Pinata, Gemini.
3. **Run:** `npm run dev`

---

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind, RainbowKit/wagmi  
- **Data:** Supabase (researchers, studies, enrollments, profiles)  
- **Identity & payments:** **Yellow Network** (fund/settle), **ENS** (name + profile)  
- **Optional:** IPFS (Pinata) for study metadata, Gemini for AI-assisted study creation  

---

*ResearchOS — The Incentive Operating System for Human Research. Research & earn.*
