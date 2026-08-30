import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * True when both Supabase env vars are present. The app renders a setup notice
 * instead of white-screening when they are missing, which is the state you are
 * in immediately after cloning (`.env` is gitignored).
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

// A syntactically valid placeholder keeps createClient from throwing during
// module evaluation; every call against it fails, which the UI reports.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } }
);

/** Turn a Supabase/Postgres error into something worth showing a person. */
export function readableError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isSupabaseConfigured) {
    return 'PlanLink is not connected to its database yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.';
  }
  if (typeof err === 'object' && err !== null) {
    const e = err as { message?: string; code?: string; details?: string };
    if (e.code === '23505') return 'That record already exists.';
    if (e.code === '42501' || e.message?.includes('row-level security')) {
      return 'You do not have permission to do that.';
    }
    if (e.message) {
      // Postgres RAISE EXCEPTION text arrives prefixed; strip the noise.
      return e.message.replace(/^.*?violates.*$/i, fallback).trim() || fallback;
    }
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
