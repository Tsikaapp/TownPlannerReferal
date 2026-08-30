import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabaseClient';
import { fetchMyProfile } from '@/db/profiles';
import type { Profile } from '@/lib/types';
import { AuthContext, type AuthContextValue, type SignUpInput } from './context';

/** Absolute URL for an in-app path, honouring the deploy base path. */
function appUrl(path: string): string {
  return `${window.location.origin}${import.meta.env.BASE_URL}${path}`.replace(/([^:]\/)\/+/g, '$1');
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  /**
   * The profile row is created by a trigger on auth.users, which can land a
   * moment after the session does on a fresh sign-up. Retry once before giving
   * up so a new member never sees an empty account.
   */
  const loadProfile = useCallback(async (userId: string) => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const p = await fetchMyProfile(userId);
        if (p) {
          if (mounted.current) setProfileState(p);
          return;
        }
      } catch {
        // Fall through to the retry, then leave the profile null.
      }
      if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
    }
    if (mounted.current) setProfileState(null);
  }, []);

  useEffect(() => {
    mounted.current = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted.current) return;
        setSession(data.session);
        if (data.session?.user) await loadProfile(data.session.user.id);
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      if (!mounted.current) return;
      setSession(next);
      if (next?.user) {
        void loadProfile(next.user.id);
      } else {
        setProfileState(null);
      }
    });

    return () => {
      mounted.current = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        // Read by the handle_new_user trigger to populate the profile row.
        data: {
          full_name: input.fullName.trim(),
          account_type: input.accountType,
          company: input.company ?? '',
          profession: input.profession ?? '',
          phone: input.phone ?? '',
          city: input.city ?? '',
          province: input.province ?? '',
        },
        emailRedirectTo: appUrl('sign-in'),
      },
    });
    if (error) throw error;
    // No session means the project has email confirmation switched on.
    return Boolean(data.session);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfileState(null);
    setSession(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: appUrl('reset-password'),
    });
    if (error) throw error;
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      requestPasswordReset,
      updatePassword,
      refreshProfile,
      setProfile: setProfileState,
    }),
    [session, profile, loading, signIn, signUp, signOut, requestPasswordReset, updatePassword, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
