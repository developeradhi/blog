import { createClient } from '@supabase/supabase-js';

// NEXT_PUBLIC_ vars are inlined at build time from .env.local for client-side code.
// For server-side static generation workers, we fall back to a placeholder so
// createClient() doesn't throw at module load time. Actual DB calls will fail
// gracefully (posts.ts returns []) if the URL isn't real.
// Never hardcode real credentials here — keep them in .env.local only.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
