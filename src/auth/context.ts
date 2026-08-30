import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';
import type { AccountType, Profile } from '@/lib/types';

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  accountType: AccountType;
  company?: string;
  profession?: string;
  phone?: string;
  city?: string;
  province?: string;
}

export interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  /** True until the initial session lookup settles — gate routing on this. */
  loading: boolean;
  signIn(email: string, password: string): Promise<void>;
  /** Resolves to true when a session was created, false when email confirmation is pending. */
  signUp(input: SignUpInput): Promise<boolean>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  refreshProfile(): Promise<void>;
  setProfile(profile: Profile): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
