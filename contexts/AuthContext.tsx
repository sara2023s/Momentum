import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Handle OAuth callback - redirect to /app after successful sign in
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in successfully, redirecting to /app');
        // Clean up the hash if it has OAuth tokens
        const currentHash = window.location.hash;
        if (currentHash.includes('access_token')) {
          // Clean up the hash to remove OAuth parameters
          setTimeout(() => {
            window.location.hash = '#/app';
          }, 200);
        } else {
          // Check if we're on a marketing page and redirect to /app
          if (currentHash === '#/' || currentHash === '#/pricing' || currentHash === '#/about' || currentHash === '' || !currentHash) {
            setTimeout(() => {
              window.location.hash = '#/app';
            }, 100);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Get the production URL from environment variable, or use current origin
      // In Vercel, VITE_APP_URL should be set to the production domain
      const getRedirectUrl = () => {
        // Check for Vite env var first (client-side)
        if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL) {
          return `${import.meta.env.VITE_APP_URL}#/app`;
        }
        // Check for process.env (Node.js/SSR)
        if (typeof process !== 'undefined' && process.env?.VITE_APP_URL) {
          return `${process.env.VITE_APP_URL}#/app`;
        }
        // Fallback to current origin (works in dev and if env var not set)
        return `${window.location.origin}${window.location.pathname}#/app`;
      };
      
      const redirectUrl = getRedirectUrl();
      console.log('Initiating OAuth with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        throw error;
      }
      
      // OAuth will redirect away, so we don't need to do anything else here
      // The redirect happens automatically via Supabase
      console.log('OAuth redirect initiated');
    } catch (error) {
      console.error('OAuth sign-in failed:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};



