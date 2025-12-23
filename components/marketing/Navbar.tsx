import React from 'react';
import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { signInWithGoogle, user: authUser } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGetStarted = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      setError(null);
      setIsLoading(true);
      
      // If already authenticated, just navigate
      if (authUser) {
        window.location.hash = '#/app';
        setIsLoading(false);
        return;
      }
      
      // Otherwise, trigger OAuth
      await signInWithGoogle();
    } catch (err: any) {
      console.error('OAuth error:', err);
      const errorMessage = err?.message || err?.error_description || 'Failed to sign in. Please check your Supabase configuration and try again.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <nav className="border-b border-surface/50 bg-obsidian/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap size={18} className="text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight font-mono">Momentum</span>
          </Link>
          
          {/* Navigation Links - Centered and properly aligned */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 flex-1">
            <Link 
              to="/" 
              className="text-text/70 hover:text-text transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
            >
              Home
            </Link>
            <Link 
              to="/pricing" 
              className="text-text/70 hover:text-text transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
            >
              Pricing
            </Link>
            <Link 
              to="/how-this-came-to-be" 
              className="text-text/70 hover:text-text transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
            >
              The Story
            </Link>
            <Link 
              to="/about" 
              className="text-text/70 hover:text-text transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
            >
              About
            </Link>
          </div>
          
          {/* CTA Button */}
          <div className="flex items-center flex-shrink-0">
            <button
              onClick={handleGetStarted}
              disabled={isLoading}
              className="px-4 py-2 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isLoading ? 'Redirecting...' : 'Get Started'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

