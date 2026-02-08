import { supabase, isSupabaseConfigured } from './supabase';

export interface Profile {
  displayName: string;
  linkedInUrl?: string | null;
}

/**
 * Get profile for a wallet. Returns null if none or not configured.
 */
export async function getProfile(walletAddress: string): Promise<Profile | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  const wallet = walletAddress?.trim();
  if (!wallet) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, linkedin_url')
    .eq('wallet_address', wallet)
    .single();

  if (error || !data) return null;
  return {
    displayName: data.display_name ?? '',
    linkedInUrl: data.linkedin_url ?? undefined,
  };
}

/**
 * True if the wallet has a profile with a non-empty display name.
 */
export async function hasMinimalProfile(walletAddress: string): Promise<boolean> {
  const p = await getProfile(walletAddress);
  return !!(p && p.displayName?.trim());
}

/**
 * Create or update profile for a wallet. Returns true on success.
 */
export async function setProfile(
  walletAddress: string,
  input: { displayName: string; linkedInUrl?: string | null }
): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;
  const wallet = walletAddress?.trim();
  const displayName = input.displayName?.trim();
  if (!wallet || !displayName) return false;

  const { error } = await supabase.from('profiles').upsert(
    {
      wallet_address: wallet,
      display_name: displayName,
      linkedin_url: input.linkedInUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'wallet_address' }
  );

  return !error;
}
