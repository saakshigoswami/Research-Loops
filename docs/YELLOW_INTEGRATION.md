# Yellow Network – Hackathon MVP (Mock / Demo)

This integration is **demo-only**. We simulate Yellow session-based payments to show the UX; no production WebSocket auth or apps.yellow.com setup.

## What’s implemented

| Action | Mock behaviour | Supabase |
|--------|----------------|----------|
| **Fund Study** | `createStudyFundingSession()` returns a mock `sessionId` and keeps fake balances in memory | `studies.yellow_session_id`, `studies.funded_amount` |
| **Mark complete** | `creditParticipantInSession()` updates mock off-chain balance (researcher → participant) | `enrollments.status = 'completed'`, `enrollments.completed_at` |
| **Settle Payouts** | `settleStudySession()` returns a mock `txHash` | `enrollments.status = 'paid'`, `enrollments.payout_tx_hash` |

## lib/yellow.ts (minimal mock client)

- **createStudyFundingSession** – returns mock `sessionId`; stores fake balances in memory.
- **creditParticipantInSession** – mock off-chain credit when participant completes.
- **getMockSessionBalances** – optional, for displaying fake balances in UI.
- **settleStudySession** – returns mock `txHash`.

No WebSocket, no ClearNode auth, no real `createAppSessionMessage` / `createCloseAppSessionMessage`.

## README

README states: **"Production WebSocket auth and apps.yellow.com channel setup are out of scope for this hackathon MVP."**

## Checklist (done)

- DB columns: `yellow_session_id`, `funded_amount` on `studies`; `payout_tx_hash` on `enrollments`.
- Wallet integration (wagmi / RainbowKit) unchanged.
- **Fund Study** → mock session → store in Supabase.
- **Complete Study** → mock off-chain credit + update enrollment in Supabase.
- **Settle Study** → mock tx hash → update enrollments in Supabase.
