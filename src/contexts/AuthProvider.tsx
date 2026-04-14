import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContext, type AuthContextValue } from '@/contexts/auth-context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const isBackendConfigured = supabase !== null;
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isBackendConfigured);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session ?? null);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }
    const emailRedirectTo = `${window.location.origin}/`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo },
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    if (!supabase) {
      return { error: new Error('Supabase is not configured') };
    }
    const name = displayName.trim();
    const { error } = await supabase.auth.updateUser({
      data: { display_name: name.length > 0 ? name : null },
    });
    return { error: error ? new Error(error.message) : null };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isBackendConfigured,
      session,
      user: session?.user ?? null,
      isLoading,
      signInWithMagicLink,
      signOut,
      updateDisplayName,
    }),
    [isBackendConfigured, session, isLoading, signInWithMagicLink, signOut, updateDisplayName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
