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
        console.log('User signed out, redirecting to home');
        // Redirect to home page after sign out
        setTimeout(() => {
          window.location.hash = '#/';
        }, 100);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Always use the current origin - this will be correct in both dev and production
      // When running in production, window.location.origin will be the production URL
      // When running in dev, it will be localhost (which is correct for dev)
      const currentOrigin = window.location.origin;
      const currentPath = window.location.pathname || '';
      
      // Build the redirect URL - use hash router format
      // Remove any trailing slashes and ensure we have the hash route
      const baseUrl = `${currentOrigin}${currentPath}`.replace(/\/$/, '');
      const redirectUrl = `${baseUrl}#/app`;
      
      console.log('=== OAuth Configuration ===');
      console.log('Current origin:', currentOrigin);
      console.log('Current pathname:', currentPath);
      console.log('Full redirect URL:', redirectUrl);
      console.log('Window location:', window.location.href);
      
      // IMPORTANT: Make sure this redirect URL is whitelisted in:
      // 1. Supabase Dashboard > Authentication > URL Configuration > Redirect URLs
      // 2. Google Cloud Console > OAuth 2.0 Client > Authorized redirect URIs
      
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
      console.log('OAuth redirect initiated, redirecting to Google...');
      console.log('After Google auth, should redirect back to:', redirectUrl);
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



