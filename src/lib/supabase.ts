import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mznzvxwzugimqzhhdnae.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16bnp2eHd6dWdpbXF6aGhkbmFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU5ODkzNjksImV4cCI6MjEwMTU2NTM2OX0.AL0sY92IZeP_vSyqYRoKoKkE3oMPvNYukNU3uNbJhWs";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
