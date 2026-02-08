## Yellow Network (Hackathon MVP)

This repo integrates **Yellow Network** in **demo/mock mode** only:

- **Fund Study** → creates a mock Yellow session and stores `yellow_session_id` + `funded_amount` in Supabase.
- **Complete Study** → updates off-chain balance in memory (mock) and enrollment status in Supabase.
- **Settle Study** → returns a mock tx hash; we store it as `payout_tx_hash` in enrollments.

**Production WebSocket auth and apps.yellow.com channel setup are out of scope for this hackathon MVP.** The goal is to demonstrate session-based off-chain payments and settlement UX; real ClearNode auth can be added later.

## ENS (Bonus / additional track — Yellow is main)

We use **ENS for researcher identity and portable profiles**. No Yellow code is modified for ENS; integration is additive.

- **Name resolution**: Primary ENS name on **Ethereum mainnet** via wagmi `useEnsName({ address, chainId: mainnet.id })`. Stored in `researchers.ens_name` on upsert and study creation.
- **Display**: Study cards show researcher as ENS name (e.g. `alice.eth`) or short address; no hard-coded values.
- **Portable profile & social**: For researchers with an ENS name, we show **avatar**, **description**, **url**, and **com.twitter** from ENS text records (ENSIP-5):
  - `useEnsAvatar` — profile picture.
  - `useEnsText` keys: `description` (bio), `url` (website link), `com.twitter` (X handle link) on study cards.

All resolution is on-chain (mainnet); identity and profile come from ENS, not manual input. See [ENS Quickstart](https://docs.ens.domains/web/quickstart/) and [Text Records](https://docs.ens.domains/web/records/).

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. (Optional) Set `VITE_GEMINI_API_KEY` in [.env.local](.env.local) for AI Assist when creating studies. Without it the app runs; only AI Assist will prompt for the key.
3. Run the app:
   `npm run dev`
