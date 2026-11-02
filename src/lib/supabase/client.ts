import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton browser client for client-side use
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  try {
    clientInstance = createSupabaseClient(url, anonKey);
    return clientInstance;
  } catch (err) {
    console.warn('[SUPABASE] Inizializzazione client fallita:', err);
    clientInstance = createSupabaseClient('https://placeholder.supabase.co', 'placeholder');
    return clientInstance;
  }
}
