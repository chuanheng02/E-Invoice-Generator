import { createClient } from '@supabase/supabase-js';

// Fallback to hardcoded keys if environment variables are not set.
// This ensures it works out of the box when deployed via GitHub without extra Vercel config.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nckpuzmwuknuculvtnyg.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_iHVhvW6I5pKrrqQmb51qbA_z6f3VPOF';

export const supabase = createClient(supabaseUrl, supabaseKey);
