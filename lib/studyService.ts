import { supabase, isSupabaseConfigured } from './supabase';
import { getStudyMetadata } from './ipfs';
import { uploadStudyMetadata } from './ipfs';
import type { ResearchStudy } from '../types';

/** DB study_status enum */
type StudyStatus = 'draft' | 'open' | 'closed';

function shortWallet(wallet: string): string {
  if (!wallet || wallet.length < 10) return wallet;
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

function mapStatus(db: StudyStatus): 'OPEN' | 'CLOSED' {
  return db === 'open' ? 'OPEN' : 'CLOSED';
}

/**
 * Fetch all studies (with researcher name) and enrollment counts.
 * Returns [] if Supabase is not configured or query fails.
 */
export async function fetchStudies(): Promise<ResearchStudy[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data: studiesRows, error: studiesError } = await supabase
    .from('studies')
    .select('id, title, ipfs_cid, reward_amount, max_participants, status, created_at, researcher_id, yellow_session_id, funded_amount')
    .order('created_at', { ascending: false });

  if (studiesError || !studiesRows?.length) return [];

  const researcherIds = [...new Set(studiesRows.map((s) => s.researcher_id))];
  const { data: researchers } = await supabase
    .from('researchers')
    .select('id, ens_name, wallet_address')
    .in('id', researcherIds);

  const researcherMap = new Map(
    (researchers ?? []).map((r) => [
      r.id,
      r.ens_name || shortWallet(r.wallet_address),
    ])
  );

  const { data: enrollmentCounts } = await supabase
    .from('enrollments')
    .select('study_id');

  const countByStudy = new Map<string, number>();
  for (const e of enrollmentCounts ?? []) {
    countByStudy.set(e.study_id, (countByStudy.get(e.study_id) ?? 0) + 1);
  }

  const studies: ResearchStudy[] = studiesRows.map((row) => ({
    id: row.id,
    title: row.title,
    description: '',
    category: 'Surveys' as const,
    eligibility: '',
    location: 'Remote',
    compensation: Number(row.reward_amount),
    researcherId: row.researcher_id,
    researcherName: researcherMap.get(row.researcher_id) ?? 'Unknown',
    createdAt: row.created_at,
    participantCount: countByStudy.get(row.id) ?? 0,
    status: mapStatus(row.status as StudyStatus),
    ipfsCid: row.ipfs_cid ?? undefined,
    maxParticipants: row.max_participants ?? undefined,
    yellowSessionId: row.yellow_session_id ?? undefined,
    fundedAmount: row.funded_amount != null ? Number(row.funded_amount) : undefined,
  }));

  // Enrich with IPFS metadata when CID is present
  const withCid = studies.filter((s) => s.ipfsCid);
  if (withCid.length > 0) {
    const results = await Promise.all(
      withCid.map((s) => getStudyMetadata(s.ipfsCid!))
    );
    withCid.forEach((s, i) => {
      const meta = results[i];
      if (meta) {
        s.description = meta.description ?? s.description;
        s.eligibility = meta.eligibility ?? s.eligibility;
        s.location = meta.location ?? s.location;
        if (meta.category && isValidCategory(meta.category)) s.category = meta.category;
      }
    });
  }

  return studies;
}

function isValidCategory(
  c: string
): c is ResearchStudy['category'] {
  const set: Set<string> = new Set([
    'Product Testing', 'Surveys', 'Psychology', 'Medical', 'Technology',
    'Nutrition', 'Economics', 'Behavioral Science', 'Neuroscience',
  ]);
  return set.has(c);
}

export interface CreateStudyInput {
  title: string;
  rewardAmount: number;
  maxParticipants: number;
  researcherWallet?: string;
  researcherEns?: string;
  /** CID from IPFS after uploading study metadata JSON */
  ipfsCid?: string | null;
}

/**
 * Upsert researcher by wallet, then insert study. Returns the created study id and row, or null.
 */
export async function createStudy(
  input: CreateStudyInput
): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const wallet = input.researcherWallet?.trim();
  if (!wallet) return null;

  const { data: researcher, error: researcherError } = await supabase
    .from('researchers')
    .upsert(
      { wallet_address: wallet, ens_name: input.researcherEns ?? null },
      { onConflict: 'wallet_address' }
    )
    .select('id')
    .single();

  if (researcherError || !researcher) return null;

  const { data: study, error: studyError } = await supabase
    .from('studies')
    .insert({
      researcher_id: researcher.id,
      title: input.title,
      ipfs_cid: input.ipfsCid ?? null,
      reward_amount: input.rewardAmount,
      max_participants: input.maxParticipants,
      status: 'open' as const,
    })
    .select('id')
    .single();

  if (studyError || !study) return null;
  return { id: study.id };
}

/**
 * Update study status (e.g. open → closed).
 */
export async function updateStudyStatus(
  studyId: string,
  status: 'open' | 'closed' | 'draft'
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const dbStatus = status === 'closed' ? 'closed' : status === 'draft' ? 'draft' : 'open';
  const { error } = await supabase
    .from('studies')
    .update({ status: dbStatus })
    .eq('id', studyId);
  return !error;
}

export interface UpdateStudyInput {
  title?: string;
  rewardAmount?: number;
  maxParticipants?: number;
  status?: 'open' | 'closed' | 'draft';
  /** If provided, re-upload metadata to IPFS and set ipfs_cid */
  metadata?: { title?: string; description?: string; eligibility?: string; location?: string; category?: string };
}

/**
 * Update a study. Only succeeds if the study belongs to the given researcher wallet.
 * Returns true on success.
 */
export async function updateStudy(
  studyId: string,
  input: UpdateStudyInput,
  researcherWallet: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const wallet = researcherWallet.trim();
  if (!wallet) return false;
  const { data: researcher } = await supabase
    .from('researchers')
    .select('id')
    .eq('wallet_address', wallet)
    .single();
  if (!researcher) return false;
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.rewardAmount !== undefined) payload.reward_amount = input.rewardAmount;
  if (input.maxParticipants !== undefined) payload.max_participants = input.maxParticipants;
  if (input.status !== undefined) payload.status = input.status;
  if (input.metadata) {
    const cid = await uploadStudyMetadata({
      title: input.title ?? input.metadata.title ?? '',
      description: input.metadata.description,
      eligibility: input.metadata.eligibility,
      location: input.metadata.location,
      category: input.metadata.category,
    });
    if (cid) payload.ipfs_cid = cid;
  }
  const { error } = await supabase
    .from('studies')
    .update(payload)
    .eq('id', studyId)
    .eq('researcher_id', researcher.id);
  return !error;
}

/**
 * Delete a study. Only succeeds if the study belongs to the given researcher wallet.
 * Enrollments are deleted by DB CASCADE. Returns true on success.
 */
export async function deleteStudy(
  studyId: string,
  researcherWallet: string
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const wallet = researcherWallet.trim();
  if (!wallet) return false;
  const { data: researcher } = await supabase
    .from('researchers')
    .select('id')
    .eq('wallet_address', wallet)
    .single();
  if (!researcher) return false;
  const { error } = await supabase
    .from('studies')
    .delete()
    .eq('id', studyId)
    .eq('researcher_id', researcher.id);
  return !error;
}

/**
 * Store Yellow session id and funded amount for a study (after researcher funds study).
 * Only succeeds if the study belongs to the given researcher wallet.
 */
export async function setStudyFunding(
  studyId: string,
  researcherWallet: string,
  yellowSessionId: string,
  fundedAmount: number
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const wallet = researcherWallet.trim();
  if (!wallet) return false;
  const { data: researcher } = await supabase
    .from('researchers')
    .select('id')
    .eq('wallet_address', wallet)
    .single();
  if (!researcher) return false;
  const { error } = await supabase
    .from('studies')
    .update({
      yellow_session_id: yellowSessionId,
      funded_amount: fundedAmount,
    })
    .eq('id', studyId)
    .eq('researcher_id', researcher.id);
  return !error;
}

/**
 * Upsert researcher by wallet; optionally set ENS name (for ENS identity).
 * Returns researcher id or null.
 */
export async function getOrCreateResearcher(
  researcherWallet: string,
  ensName?: string | null
): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const wallet = researcherWallet.trim();
  if (!wallet) return null;
  const { data: researcher, error } = await supabase
    .from('researchers')
    .upsert(
      { wallet_address: wallet, ens_name: ensName ?? null },
      { onConflict: 'wallet_address' }
    )
    .select('id')
    .single();
  return error || !researcher ? null : researcher.id;
}

/**
 * Fetch studies created by the given researcher wallet (for "My Dashboard").
 */
export async function fetchResearcherStudies(
  researcherWallet: string
): Promise<ResearchStudy[]> {
  if (!isSupabaseConfigured() || !supabase) return [];
  const wallet = researcherWallet.trim();
  if (!wallet) return [];
  const { data: researcher, error: rErr } = await supabase
    .from('researchers')
    .select('id')
    .eq('wallet_address', wallet)
    .single();
  if (rErr || !researcher) return [];
  const all = await fetchStudies();
  return all.filter((s) => s.researcherId === researcher.id);
}

