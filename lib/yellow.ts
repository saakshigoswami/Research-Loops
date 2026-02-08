/**
 * Yellow Network – HACKATHON MVP MOCK
 * Demo-only: simulates session-based off-chain payments and settlement.
 * Production WebSocket auth and apps.yellow.com setup are out of scope for this MVP.
 */

// In-memory mock state for demo (session → balances)
const mockSessionBalances: Record<string, { researcher: number; participants: Record<string, number> }> = {};

/**
 * Mock Yellow client: create a study funding session.
 * Simulates createAppSessionMessage; stores mock session and balance in memory.
 * Returns sessionId to store in Supabase (yellow_session_id).
 */
export async function createStudyFundingSession(options: {
  researcherAddress: string;
  amountUsdc: number;
  studyId: string;
}): Promise<{ sessionId: string }> {
  const { amountUsdc, studyId } = options;
  const sessionId = `yellow-demo-${studyId.slice(0, 8)}-${Date.now().toString(36)}`;
  mockSessionBalances[sessionId] = {
    researcher: amountUsdc,
    participants: {},
  };
  return { sessionId };
}

/**
 * Mock off-chain credit: participant "receives" reward in session (no on-chain tx).
 * Simulates Yellow off-chain balance update. Call when participant completes study.
 */
export async function creditParticipantInSession(options: {
  sessionId: string;
  participantAddress: string;
  amountUsdc: number;
}): Promise<{ ok: boolean }> {
  const { sessionId, participantAddress, amountUsdc } = options;
  const session = mockSessionBalances[sessionId];
  if (!session || session.researcher < amountUsdc) return { ok: false };
  session.researcher -= amountUsdc;
  session.participants[participantAddress] = (session.participants[participantAddress] ?? 0) + amountUsdc;
  return { ok: true };
}

/**
 * Mock balances for a session (for demo display only).
 */
export function getMockSessionBalances(sessionId: string): { researcher: number; participants: Record<string, number> } | null {
  return mockSessionBalances[sessionId] ?? null;
}

/**
 * Mock settlement: simulates createCloseAppSessionMessage.
 * Returns a fake tx hash to store in Supabase (payout_tx_hash).
 */
export async function settleStudySession(_sessionId: string): Promise<{ txHash: string }> {
  const txHash = `0x${Date.now().toString(16).padStart(8, '0')}${'0'.repeat(56)}`;
  return { txHash };
}
