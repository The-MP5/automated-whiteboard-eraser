import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Raised when code calls {@link requireSupabaseEnv} but Vite env vars are missing or blank.
 * Kept explicit so persistence code can catch and surface setup issues (see docs/DEBT_AND_RISK.md).
 */
export class SupabaseConfigError extends Error {
  override readonly name = 'SupabaseConfigError';

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/** Resolved public configuration for the generated Supabase JS client. */
export interface ResolvedSupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Reads Supabase URL and anon/public key from Vite env.
 * Returns `null` if either is missing — valid for UI-only runs before persistence is wired.
 *
 * `VITE_SUPABASE_ANON_KEY` is preferred; `VITE_SUPABASE_PUBLISHABLE_KEY` is an optional
 * alias for the same value (some older templates used that name).
 */
export function tryResolveSupabaseEnv(): ResolvedSupabaseEnv | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim() ?? '';
  const anonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    '';
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}

/**
 * Use when opening a connection is required; fails fast with an actionable message.
 */
export function requireSupabaseEnv(): ResolvedSupabaseEnv {
  const resolved = tryResolveSupabaseEnv();
  if (!resolved) {
    throw new SupabaseConfigError(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY ' +
        '(or VITE_SUPABASE_PUBLISHABLE_KEY with the same anon key value). See README.md.',
    );
  }
  return resolved;
}

const resolvedEnv = tryResolveSupabaseEnv();

/**
 * Supabase client when env is set; otherwise `null` so the simulator runs without a backend.
 * Callers that perform I/O must check or use {@link requireSupabaseEnv} + create a client.
 */
export const supabase: SupabaseClient<Database> | null = resolvedEnv
  ? createClient<Database>(resolvedEnv.url, resolvedEnv.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
