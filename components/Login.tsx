import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Chrome } from 'lucide-react';

export const Login: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian text-text p-4">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold">Momentum</h1>
          <p className="text-sm sm:text-base text-text/70">Your productivity companion</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface hover:bg-surface/70 border border-surface/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base"
          >
            <Chrome className="w-5 h-5" />
            <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        <p className="text-center text-sm text-text/60">
          Sign in to access your habits, tasks, and progress
        </p>
      </div>
    </div>
  );
};



