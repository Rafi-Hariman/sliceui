// This file is intentionally NOT auto-generated (was Lovable-scaffolded).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";
//
// Supabase is optional until persistence is provisioned (Phase P3). When
// VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY are unset (e.g. a fresh
// deploy without a project), this is null and the app runs in guest mode —
// generation works, persistence is skipped. Consumers must null-check.

export const supabase: SupabaseClient<Database> | null =
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
    ? createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      })
    : null;

export const isSupabaseConfigured = (): boolean => supabase !== null;