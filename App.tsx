import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User } from './types';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Habits } from './components/Habits';
import { Tasks } from './components/Tasks';
import { Focus } from './components/Focus';
import { Journal } from './components/Journal';
import { MarketingLanding } from './components/marketing/Landing';
import { Pricing } from './components/marketing/Pricing';
import { About } from './components/marketing/About';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getUser } from './actions/user';

// Context Definition - Only for user data now
const AppContext = createContext<{ user: User; refreshUser: () => Promise<void> } | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const AppContent: React.FC = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const [user, setUser] = useState<User>({ name: 'User', xp: 0, level: 1 });
  const [loading, setLoading] = useState(true);
  const [hashCleaned, setHashCleaned] = useState(false);
  const fetchingUserRef = useRef(false);
  
  // Clean up OAuth hash immediately on mount (before router tries to match)
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      // Extract route before access_token
      let cleanHash = hash.split('#access_token')[0].split('?access_token')[0];
      if (!cleanHash || cleanHash === '#' || cleanHash === '') {
        cleanHash = '#/app';
      }
      if (cleanHash !== hash) {
        console.log('Cleaning OAuth hash immediately:', cleanHash);
        window.history.replaceState(null, '', cleanHash);
        window.location.hash = cleanHash;
      }
    }
    setHashCleaned(true);
  }, []);

  const refreshUser = async () => {
    if (!authUser) return;
    try {
      const userData = await getUser(authUser.id);
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  useEffect(() => {
    console.log('User fetch effect - authLoading:', authLoading, 'authUser:', !!authUser, 'loading:', loading, 'fetchingUserRef:', fetchingUserRef.current);
    
    if (!authLoading && authUser && !fetchingUserRef.current) {
      // Check if we already have real user data (not the default 'User')
      if (user.name !== 'User' || user.xp > 0 || user.level > 1) {
        // Already have user data, just ensure loading is false
        console.log('User already has data, setting loading to false');
        setLoading(false);
        return;
      }
      
      fetchingUserRef.current = true;
      const fetchUser = async () => {
        try {
          console.log('Fetching user data for:', authUser.id);
          const userData = await getUser(authUser.id);
          console.log('User data fetched successfully:', userData);
          setUser(userData);
          setLoading(false);
        } catch (error) {
          console.error('Failed to fetch user:', error);
          // Set a default user so the app doesn't crash
          setUser({ 
            name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User', 
            xp: 0, 
            level: 1 
          });
          setLoading(false);
        } finally {
          fetchingUserRef.current = false;
        }
      };
      fetchUser();
    } else if (!authLoading && !authUser) {
      setLoading(false);
      fetchingUserRef.current = false; // Reset when user logs out
    }
  }, [authUser, authLoading]);

  // Redirect to /app if authenticated and on marketing page
  useEffect(() => {
    if (!authLoading && authUser) {
      const currentHash = window.location.hash;
      console.log('Auth check - current hash:', currentHash, 'authUser:', !!authUser);
      
      // If on marketing pages (/, /pricing, /about) and authenticated, redirect to app
      // But don't redirect if already on /app or a sub-route
      if (currentHash === '#/' || currentHash === '#/pricing' || currentHash === '#/about' || currentHash === '' || !currentHash) {
        console.log('Redirecting authenticated user to /app from:', currentHash);
        // Use navigate instead of window.location.hash for better React Router integration
        window.location.hash = '#/app';
      }
    }
  }, [authUser, authLoading]);

  // Handle OAuth callback errors
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const errorMatch = hash.match(/error=([^&]+)/);
      const errorDescMatch = hash.match(/error_description=([^&]+)/);
      if (errorMatch) {
        console.error('OAuth error in URL:', decodeURIComponent(errorMatch[1]), errorDescMatch ? decodeURIComponent(errorDescMatch[1]) : '');
        // Clear the error from URL and redirect to home
        window.location.hash = '#/';
      }
    }
  }, []);

  // Wait for hash cleanup before rendering router
  if (!hashCleaned || authLoading || (authUser && loading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight-bg text-text-main">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  // Clean hash one more time before rendering router
  const currentHash = window.location.hash;
  if (currentHash.includes('access_token')) {
    const cleanHash = currentHash.split('#access_token')[0].split('?access_token')[0] || '#/app';
    if (cleanHash !== currentHash) {
      window.history.replaceState(null, '', cleanHash);
    }
  }

  return (
    <HashRouter>
      <Routes>
        {/* Marketing Routes - No Auth Required */}
        <Route path="/" element={<MarketingLanding />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        
        {/* App Routes - Auth Required */}
        <Route path="/app/*" element={
          authUser ? (
            <AppContext.Provider value={{ user, refreshUser }}>
              <Layout>
                <Routes>
                  <Route index element={<Dashboard />} />
                  <Route path="habits" element={<Habits />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="focus" element={<Focus />} />
                  <Route path="journal" element={<Journal />} />
                  <Route path="*" element={<Navigate to="/app" replace />} />
                </Routes>
              </Layout>
            </AppContext.Provider>
          ) : (
            <Navigate to="/" replace />
          )
        } />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
