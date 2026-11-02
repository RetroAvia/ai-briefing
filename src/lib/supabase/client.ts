import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Singleton browser client for client-side use
let clientInstance: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (clientInstance) return clientInstance;
  clientInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return clientInstance;
}
