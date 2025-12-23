import React from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Navbar } from './Navbar';

export const Pricing: React.FC = () => {
  const { signInWithGoogle, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Don't redirect here - let App.tsx handle it to avoid conflicts

  const handleGetStarted = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      setError(null);
      setIsLoading(true);
      
      // If already authenticated, just navigate
      if (authUser) {
        navigate('/app');
        setIsLoading(false);
        return;
      }
      
      // Otherwise, trigger OAuth (will redirect to Google, then back to #/app)
      console.log('Starting OAuth flow...');
      await signInWithGoogle();
      console.log('OAuth flow initiated, redirecting to Google...');
      // Note: OAuth redirects away from the page, so navigation happens after redirect back
    } catch (err: any) {
      console.error('OAuth error:', err);
      const errorMessage = err?.message || err?.error_description || 'Failed to sign in. Please check your Supabase configuration and try again.';
      setError(errorMessage);
      setIsLoading(false);
      
      // Show more detailed error in console for debugging
      if (err?.code) {
        console.error('Error code:', err.code);
      }
      if (err?.status) {
        console.error('Error status:', err.status);
      }
    }
  };

  return (
    <div className="min-h-screen bg-midnight-bg text-text-main">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Invest in your <span className="text-mint-primary">output</span>
            </h1>
            <p className="text-lg text-text-muted max-w-2xl mx-auto">
              Choose the plan that fits your workflow. Upgrade or downgrade anytime.
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-midnight-surface border border-midnight-border rounded-xl p-8 relative"
            >
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={20} className="text-mint-secondary" />
                  <h3 className="text-2xl font-bold text-text-main">Free</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold font-mono text-text-main">$0</span>
                  <span className="text-text-muted">/month</span>
                </div>
                <p className="text-sm text-text-muted leading-tight">For the curious</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-muted">3 Habits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-muted">7 Day History</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-muted">Basic Analytics</span>
                </li>
              </ul>

              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full py-3 bg-midnight-surface border border-midnight-border text-text-main rounded-lg font-medium transition-all hover:border-mint-primary/50 hover:text-mint-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirecting...' : 'Get Started'}
              </button>
            </motion.div>

            {/* Pro Tier - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-midnight-surface border-2 border-mint-primary rounded-xl p-8 relative shadow-lg shadow-mint-primary/10 pt-12"
            >
              {/* Most Popular Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-mint-primary text-midnight-bg px-4 py-1.5 rounded-full text-xs font-semibold font-mono shadow-lg">
                  Most Popular
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-mint-primary" />
                  <h3 className="text-2xl font-bold text-text-main">Pro</h3>
                </div>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-4xl font-bold font-mono text-text-main">$5</span>
                  <span className="text-text-muted">/month</span>
                </div>
                <p className="text-sm text-text-muted leading-tight">For the serious builder</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-main font-medium">Unlimited Habits</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-main font-medium">Infinite History</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-main font-medium">GitHub Integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={20} className="text-mint-primary flex-shrink-0 mt-0.5" />
                  <span className="text-text-main font-medium">Advanced Heatmaps</span>
                </li>
              </ul>

              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="w-full py-3 bg-mint-primary hover:bg-teal-500 text-midnight-bg rounded-lg font-semibold transition-all shadow-lg shadow-mint-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Redirecting...' : 'Start Pro Trial'}
              </button>
            </motion.div>
          </div>

          {error && (
            <div className="mt-8 max-w-4xl mx-auto p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="bg-midnight-surface border border-midnight-border rounded-lg p-6">
                <h3 className="font-semibold text-text-main mb-2">Can I change plans later?</h3>
                <p className="text-text-muted text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
              </div>
              <div className="bg-midnight-surface border border-midnight-border rounded-lg p-6">
                <h3 className="font-semibold text-text-main mb-2">What payment methods do you accept?</h3>
                <p className="text-text-muted text-sm">We accept all major credit cards and process payments securely through Stripe.</p>
              </div>
              <div className="bg-midnight-surface border border-midnight-border rounded-lg p-6">
                <h3 className="font-semibold text-text-main mb-2">Is there a free trial for Pro?</h3>
                <p className="text-text-muted text-sm">Yes, all new Pro subscriptions come with a 14-day free trial. No credit card required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-midnight-border bg-midnight-bg py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-mint-primary to-teal-500 flex items-center justify-center">
                  <Zap size={14} className="text-midnight-bg fill-midnight-bg" />
                </div>
                <span className="text-lg font-bold font-mono">Momentum</span>
              </div>
              <p className="text-sm text-text-muted">
                The productivity system for builders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-main">Product</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link to="/pricing" className="hover:text-mint-primary transition-colors">Pricing</Link></li>
                <li><Link to="/how-this-came-to-be" className="hover:text-mint-primary transition-colors">How This Came to Be</Link></li>
                <li><Link to="/changelog" className="hover:text-mint-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-main">Company</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link to="/about" className="hover:text-mint-primary transition-colors">About Developer</Link></li>
                <li><Link to="/privacy" className="hover:text-mint-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-main">Connect</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="https://buildwithsds.com" target="_blank" rel="noopener noreferrer" className="hover:text-mint-primary transition-colors">Build with SDS</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-midnight-border pt-8 text-center text-sm text-text-muted">
            <p>Momentum. Developed by <a href="https://buildwithsds.com" target="_blank" rel="noopener noreferrer" className="text-mint-primary hover:underline">Build with SDS</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

