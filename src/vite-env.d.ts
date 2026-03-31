/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** @deprecated Use VITE_SUPABASE_ANON_KEY; same value as Supabase anon/public key */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}
