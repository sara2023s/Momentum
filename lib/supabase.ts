import { createClient } from '@supabase/supabase-js';

// Support both Vite (import.meta.env) and Node.js (process.env)
function getEnvVar(key: string): string | undefined {
  // Check import.meta.env (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (value) return value;
  }
  // Check process.env (Node.js)
  return process.env[key];
}

const supabaseUrl = 
  getEnvVar('VITE_SUPABASE_URL') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_URL') ||
  'https://placeholder.supabase.co';

const supabaseAnonKey = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
  'placeholder-key';

// Only throw error in runtime, not during build
if (typeof window !== 'undefined' && 
    (!getEnvVar('VITE_SUPABASE_URL') && !getEnvVar('NEXT_PUBLIC_SUPABASE_URL')) &&
    (!getEnvVar('VITE_SUPABASE_ANON_KEY') && !getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'))) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

// Create Supabase client with auth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Handle OAuth callbacks properly
    flowType: 'pkce'
  }
});
