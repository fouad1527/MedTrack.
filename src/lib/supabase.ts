import { createClient } from '@supabase/supabase-js';

const env = (import.meta as unknown as { env?: Record<string, string> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

// Fallback dummy URL and Key if environment variables are not set yet
const defaultUrl = 'https://placeholder.supabase.co';
const defaultKey = 'placeholder-key';

export const supabase = createClient(
  supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : defaultUrl,
  supabaseAnonKey || defaultKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));
};
