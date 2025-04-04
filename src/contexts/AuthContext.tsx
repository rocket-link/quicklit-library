
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { auth as authApi } from '@/lib/api';
import { toast } from '@/lib/toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; username?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'twitter') => Promise<{ error: Error | null }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await authApi.signIn(email, password);
    setLoading(false);
    if (error) toast.error("Sign in failed", { description: error.message });
    else toast.success("Signed in successfully");
    return { error };
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: { full_name?: string; username?: string }) => {
    setLoading(true);
    const { data, error } = await authApi.signUp(email, password, metadata);
    setLoading(false);
    if (error) toast.error("Sign up failed", { description: error.message });
    else toast.success("Account created successfully");
    return { error };
  };

  // Sign out
  const signOut = async () => {
    setLoading(true);
    const { error } = await authApi.signOut();
    setLoading(false);
    if (!error) toast.success("Signed out successfully");
    return { error };
  };

  // Sign in with OAuth
  const signInWithOAuth = async (provider: 'google' | 'facebook' | 'twitter') => {
    const { data, error } = await authApi.signInWithOAuth(provider);
    if (error) toast.error(`${provider} sign in failed`);
    return { error };
  };

  const value = {
    session,
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithOAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
