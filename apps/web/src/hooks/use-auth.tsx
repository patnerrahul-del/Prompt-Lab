import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  role: UserRole;
  isAdmin: boolean;
  isSeller: boolean;
  isUser: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo profile for testing when running in local development mode without Supabase connection
const DEMO_LOCAL_PROFILE: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'concierge@aurumprompts.com',
  full_name: 'Aurum Concierge',
  avatar_url: null,
  role: 'admin',
  seller_balance_inr: 54200,
  commission_rate: 15,
  bio: 'Platform Master Engineer',
  website: 'https://aurumprompts.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      } else {
        // Fallback profile if row is not created yet
        setProfile({
          id: userId,
          email: user?.email || '',
          full_name: user?.user_metadata?.full_name || null,
          avatar_url: user?.user_metadata?.avatar_url || null,
          role: 'user',
          seller_balance_inr: 0,
          commission_rate: 15,
          bio: null,
          website: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      // Graceful fallback
    }
  }, [user]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Offline / Local Demo mode initialization
      setProfile(DEMO_LOCAL_PROFILE);
      setIsLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: DEMO_LOCAL_PROFILE.id, email } as User);
      setProfile(DEMO_LOCAL_PROFILE);
      setIsAuthModalOpen(false);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setIsAuthModalOpen(false);
    return { error: error ? new Error(error.message) : null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    if (!isSupabaseConfigured) {
      setUser({ id: DEMO_LOCAL_PROFILE.id, email } as User);
      setProfile({ ...DEMO_LOCAL_PROFILE, full_name: fullName, email });
      setIsAuthModalOpen(false);
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (!error) setIsAuthModalOpen(false);
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithMagicLink = async (email: string) => {
    if (!isSupabaseConfigured) {
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      setUser({ id: DEMO_LOCAL_PROFILE.id, email: 'google.demo@aurumprompts.com' } as User);
      setProfile(DEMO_LOCAL_PROFILE);
      setIsAuthModalOpen(false);
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const role: UserRole = profile?.role ?? 'visitor';
  const isAdmin = role === 'admin';
  const isSeller = role === 'seller' || isAdmin;
  const isUser = Boolean(user) || Boolean(profile);

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    role,
    isAdmin,
    isSeller,
    isUser,
    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => setIsAuthModalOpen(false),
    signInWithEmail,
    signUpWithEmail,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    refreshProfile: async () => {
      if (user) await fetchProfile(user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
