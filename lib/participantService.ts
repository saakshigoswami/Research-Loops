import { supabase, isSupabaseConfigured } from './supabase';
import { fetchStudies } from './studyService';
import type { ResearchStudy } from '../types';

/**
 * Get or create participant by wallet. Returns participant id or null.
 */
export async function ensureParticipant(
  walletAddress: string
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const wallet = walletAddress.trim();
  if (!wallet) return null;

  const { data: existing } = await supabase
    .from('participants')
    .select('id')
    .eq('wallet_address', wallet)
    .single();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from('participants')
    .insert({ wallet_address: wallet })
    .select('id')
    .single();

  if (error || !created) return null;
  return created.id;
}

/**
 * Join a study: ensure participant exists, then insert enrollment with status 'joined'.
 * Returns true if enrolled, false if already enrolled or error.
 */
export async function joinStudy(
  studyId: string,
  participantWallet: string
): Promise<{ ok: boolean; alreadyEnrolled?: boolean }> {
  if (!isSupabaseConfigured() || !supabase) return { ok: false };
  const participantId = await ensureParticipant(participantWallet);
  if (!participantId) return { ok: false };

  const { error } = await supabase.from('enrollments').insert({
    study_id: studyId,
    participant_id: participantId,
    status: 'joined',
  });

  if (error) {
    if (error.code === '23505') return { ok: false, alreadyEnrolled: true };
    return { ok: false };
  }
  return { ok: true };
}

export interface EnrollmentWithStudy {
  enrollmentId: string;
  studyId: string;
  status: 'joined' | 'completed' | 'paid';
  joinedAt: string;
  completedAt: string | null;
  payoutTxHash: string | null;
  study: ResearchStudy;
}

/**
 * Fetch enrollments for the given participant wallet (for "My Dashboard").
 * Returns enrollments with full study info.
 */
export async function fetchParticipantEnrollments(
  participantWallet: string
): Promise<EnrollmentWithStudy[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const participantId = await ensureParticipant(participantWallet);
  if (!participantId) return [];
  const { data: enrollmentsRows, error } = await supabase
    .from('enrollments')
    .select('id, study_id, status, joined_at, completed_at, payout_tx_hash')
    .eq('participant_id', participantId)
    .order('joined_at', { ascending: false });
  if (error || !enrollmentsRows?.length) return [];
  const allStudies = await fetchStudies();
  const studyMap = new Map(allStudies.map((s) => [s.id, s]));
  return enrollmentsRows
    .map((e) => {
      const study = studyMap.get(e.study_id);
      if (!study) return null;
      return {
        enrollmentId: e.id,
        studyId: e.study_id,
        status: e.status as 'joined' | 'completed' | 'paid',
        joinedAt: e.joined_at,
        completedAt: e.completed_at ?? null,
        payoutTxHash: e.payout_tx_hash ?? null,
        study,
      };
    })
    .filter((x): x is EnrollmentWithStudy => x !== null);
}

/**
 * Mark an enrollment as completed (participant finished the study).
 * Off-chain Yellow balance credit can be done separately; this updates DB only.
 */
export async function markEnrollmentCompleted(
  enrollmentId: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('enrollments')
    .update({ status: 'completed', completed_at: now })
    .eq('id', enrollmentId)
    .eq('status', 'joined');
  return !error;
}

export interface StudyEnrollmentRow {
  enrollmentId: string;
  participantWallet: string;
  amount: number;
  status: 'joined' | 'completed' | 'paid';
}

/**
 * Fetch enrollments for a study (for researcher settle modal: list participants and earnings).
 */
export async function fetchEnrollmentsForStudy(
  studyId: string,
  compensationPerParticipant: number
): Promise<StudyEnrollmentRow[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const { data: rows, error } = await supabase
    .from('enrollments')
    .select('id, participant_id, status')
    .eq('study_id', studyId)
    .order('joined_at', { ascending: true });
  if (error || !rows?.length) return [];
  const participantIds = [...new Set(rows.map((r) => r.participant_id))];
  const { data: participants } = await supabase
    .from('participants')
    .select('id, wallet_address')
    .in('id', participantIds);
  const walletMap = new Map((participants ?? []).map((p) => [p.id, p.wallet_address]));
  return rows.map((e) => ({
    enrollmentId: e.id,
    participantWallet: walletMap.get(e.participant_id) ?? 'Unknown',
    amount: compensationPerParticipant,
    status: e.status as 'joined' | 'completed' | 'paid',
  }));
}

/**
 * After Yellow settlement: mark all completed enrollments for a study as paid and store tx hash.
 */
export async function markEnrollmentsPaidForStudy(
  studyId: string,
  payoutTxHash: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const { error } = await supabase
    .from('enrollments')
    .update({ status: 'paid', payout_tx_hash: payoutTxHash })
    .eq('study_id', studyId)
    .eq('status', 'completed');
  return !error;
}
