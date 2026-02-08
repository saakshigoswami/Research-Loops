<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Gt1Z-2EijlrImmtGmqPwPsS1nowrKDlT

## Yellow Network (Hackathon MVP)

This repo integrates **Yellow Network** in **demo/mock mode** only:

- **Fund Study** → creates a mock Yellow session and stores `yellow_session_id` + `funded_amount` in Supabase.
- **Complete Study** → updates off-chain balance in memory (mock) and enrollment status in Supabase.
- **Settle Study** → returns a mock tx hash; we store it as `payout_tx_hash` in enrollments.

**Production WebSocket auth and apps.yellow.com channel setup are out of scope for this hackathon MVP.** The goal is to demonstrate session-based off-chain payments and settlement UX; real ClearNode auth can be added later.

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
