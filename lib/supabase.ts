import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    'Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env. Using mock data only.'
  );
}

export const supabase =
  url && anonKey
    ? createClient(url, anonKey)
    : (null as ReturnType<typeof createClient> | null);

export const isSupabaseConfigured = (): boolean => !!supabase;
