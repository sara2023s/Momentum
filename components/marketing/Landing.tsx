import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  Keyboard,
  Clock,
  Moon,
  TrendingUp,
  Timer,
  BookOpen,
  Shield,
  Smartphone,
  Download,
  ArrowRight,
  Github
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const MarketingLanding: React.FC = () => {
  const { signInWithGoogle, user: authUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Don't redirect here - let App.tsx handle it to avoid conflicts

  const handleGetStarted = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Button clicked!', { authUser, isLoading });
    
    try {
      setError(null);
      setIsLoading(true);
      
      // If already authenticated, just navigate
      if (authUser) {
        console.log('User already authenticated, navigating to /app');
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
      {/* Navigation */}
      <nav className="border-b border-midnight-border bg-midnight-bg/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mint-primary to-teal-500 flex items-center justify-center shadow-lg shadow-mint-primary/20">
                <Zap size={18} className="text-midnight-bg fill-midnight-bg" />
              </div>
              <span className="text-xl font-bold tracking-tight font-mono">Momentum</span>
            </div>
            
            {/* Navigation Links - Centered and properly aligned */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 lg:gap-8 flex-1">
              <Link 
                to="/pricing" 
                className="text-text-muted hover:text-text-main transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
              >
                Pricing
              </Link>
              <Link 
                to="/methodology" 
                className="text-text-muted hover:text-text-main transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
              >
                Methodology
              </Link>
              <Link 
                to="/about" 
                className="text-text-muted hover:text-text-main transition-colors text-sm font-medium whitespace-nowrap py-2 px-1"
              >
                About
              </Link>
            </div>
            
            {/* CTA Button */}
            <div className="flex items-center flex-shrink-0">
              <button
                onClick={handleGetStarted}
                disabled={isLoading}
                className="px-4 py-2 bg-mint-primary hover:bg-teal-500 text-midnight-bg rounded-lg font-medium transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isLoading ? 'Redirecting...' : 'Get Started'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-mint-primary/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                The Productivity System
                <br />
                for <span className="text-mint-primary">Builders</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-text-muted leading-relaxed max-w-xl">
                Stop juggling apps. Momentum combines deep work, gamification, and analytics into one dark-mode optimized workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleGetStarted}
                  disabled={isLoading}
                  className="px-8 py-3 bg-mint-primary hover:bg-teal-500 text-midnight-bg rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-mint-primary/20 hover:shadow-mint-primary/30 text-base flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Redirecting...' : 'Start Building Momentum'}
                  {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm max-w-md">
                  {error}
                </div>
              )}
            </motion.div>

            {/* Dashboard Preview with 3D Tilt and Mint Glow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-mint-primary/20 to-teal-500/20 rounded-2xl blur-2xl -z-10"></div>
              <div className="relative bg-midnight-surface border border-midnight-border rounded-2xl p-6 shadow-2xl transform" style={{ transform: 'perspective(1000px) rotateY(-3deg) rotateX(2deg)' }}>
                <div className="bg-midnight-bg rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-midnight-surface rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 bg-mint-primary rounded-full"></div>
                      <div className="h-3 w-3 bg-mint-secondary/50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-midnight-surface rounded"></div>
                    <div className="h-20 bg-midnight-surface rounded"></div>
                    <div className="h-20 bg-midnight-surface rounded"></div>
                  </div>
                  {/* Focus Sessions Bar Chart Preview */}
                  <div className="h-32 bg-midnight-surface rounded p-3 flex flex-col justify-end">
                    <div className="text-[8px] text-text-muted font-mono mb-2">Focus Sessions (Last 7 Days)</div>
                    <div className="flex items-end gap-1 h-20">
                      {[25, 45, 30, 60, 50, 70, 55].map((minutes, i) => {
                        const height = (minutes / 70) * 100;
                        const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group">
                            <div
                              className="w-full bg-mint-primary rounded-t transition-all duration-300 hover:bg-teal-400"
                              style={{
                                height: `${height}%`,
                                minHeight: '4px'
                              }}
                              title={`${days[i]}: ${minutes} min`}
                            />
                            <div className="text-[8px] text-text-muted font-mono mt-1">
                              {days[i]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="border-y border-midnight-border bg-midnight-surface/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <p className="text-sm font-mono text-text-muted uppercase tracking-wider">Engineered for flow</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <Keyboard size={16} className="text-mint-primary" />
              <span>100% Keyboard Friendly</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={16} className="text-mint-primary" />
              <span>0.3s Load Time</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <Moon size={16} className="text-mint-primary" />
              <span>Dark Mode Native</span>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-3xl sm:text-4xl font-bold">
              Most productivity apps are <span className="text-mint-primary">digital clutter</span>
            </h2>
            <p className="text-lg text-text-muted leading-relaxed max-w-2xl mx-auto">
              Context switching is killing your flow.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features - Zig-Zag Layout */}
      <section className="py-20 sm:py-28 bg-midnight-surface/20">
        {/* Gamification Feature */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-mint-primary/10 border border-mint-primary/20 rounded text-xs font-mono text-mint-primary mb-4">
                GAMIFICATION
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Turn Discipline into <span className="text-mint-primary">Dopamine</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed">
                Track habits with GitHub-style contribution graphs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-6 shadow-xl">
                <div className="bg-midnight-bg rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-text-main">Level 5</div>
                    <div className="text-xs text-mint-primary font-mono">1,250 XP</div>
                  </div>
                  <div className="h-2 bg-midnight-surface rounded-full overflow-hidden mb-4">
                    <div className="h-full bg-mint-primary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  {/* Actual Heatmap Preview */}
                  <div className="space-y-2">
                    <div className="text-xs text-text-muted font-mono mb-2">Habit Consistency</div>
                    <div className="flex items-start gap-2">
                      {/* Day labels */}
                      <div className="flex flex-col text-[8px] text-text-muted font-mono gap-0.5 pt-0.5">
                        <div className="h-[9px]">S</div>
                        <div className="h-[9px]">M</div>
                        <div className="h-[9px]">T</div>
                        <div className="h-[9px]">W</div>
                        <div className="h-[9px]">T</div>
                        <div className="h-[9px]">F</div>
                        <div className="h-[9px]">S</div>
                      </div>
                      
                      {/* Heatmap grid - showing last 12 weeks */}
                      <div className="flex-1 grid grid-cols-12 gap-0.5" style={{ gridTemplateRows: 'repeat(7, 9px)' }}>
                        {Array.from({ length: 84 }).map((_, i) => {
                          const week = Math.floor(i / 7);
                          const day = i % 7;
                          // Generate realistic pattern - more activity in recent weeks
                          const daysAgo = 84 - i;
                          const hasActivity = daysAgo < 60 && Math.random() > 0.3;
                          const intensity = hasActivity 
                            ? Math.floor(Math.random() * 4) + 1 
                            : 0;
                          const opacity = intensity === 0 ? 0.1 : 
                                         intensity === 1 ? 0.3 : 
                                         intensity === 2 ? 0.5 : 
                                         intensity === 3 ? 0.7 : 1;
                          
                          return (
                            <div
                              key={i}
                              className="rounded-sm"
                              style={{
                                width: '9px',
                                height: '9px',
                                backgroundColor: intensity > 0 ? '#2DD4BF' : '#1E293B',
                                opacity: intensity > 0 ? opacity : 1,
                                border: intensity === 0 ? '1px solid rgba(51, 65, 85, 0.5)' : 'none'
                              }}
                            />
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-end gap-2 mt-3 text-[8px] text-text-muted">
                      <span>Less</span>
                      <div className="flex gap-0.5">
                        <div className="w-2 h-2 rounded-sm bg-mint-primary" style={{ opacity: 0.3 }} />
                        <div className="w-2 h-2 rounded-sm bg-mint-primary" style={{ opacity: 0.5 }} />
                        <div className="w-2 h-2 rounded-sm bg-mint-primary" style={{ opacity: 1 }} />
                      </div>
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Deep Work Feature */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-8 shadow-xl">
                <div className="bg-midnight-bg rounded-lg p-6 space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold text-text-main mb-2">25:00</div>
                    <div className="text-xs text-text-muted uppercase tracking-wider">Deep Focus</div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-mint-primary flex items-center justify-center">
                      <div className="w-4 h-4 bg-midnight-bg rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-block px-3 py-1 bg-mint-primary/10 border border-mint-primary/20 rounded text-xs font-mono text-mint-primary mb-4">
                DEEP WORK
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Enter Flow State. <span className="text-mint-primary">Instantly</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed">
                Integrated Pomodoro timers sync with your tasks.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Journaling Feature */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-mint-primary/10 border border-mint-primary/20 rounded text-xs font-mono text-mint-primary mb-4">
                JOURNALING
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Debug Your <span className="text-mint-primary">Life</span>
              </h2>
              <p className="text-lg text-text-muted leading-relaxed">
                Daily structured journaling to capture insights.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-6 shadow-xl">
                <div className="bg-midnight-bg rounded-lg p-4 space-y-4">
                  <div className="text-xs font-mono text-text-muted mb-3">Productivity Trend</div>
                  
                  {/* Line Chart Preview */}
                  <div className="space-y-3">
                    <div className="flex items-end justify-between h-24 gap-1">
                      {[45, 52, 48, 58, 65, 72, 68, 75, 82, 78, 85, 90].map((value, i) => {
                        const height = (value / 90) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center group">
                            <div
                              className="w-full bg-mint-primary rounded-t transition-all duration-300 hover:bg-teal-400"
                              style={{
                                height: `${height}%`,
                                minHeight: '4px'
                              }}
                              title={`Week ${i + 1}: ${value}%`}
                            />
                            <div className="text-[8px] text-text-muted font-mono mt-1">
                              {i % 3 === 0 ? i + 1 : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[8px] text-text-muted font-mono pt-2 border-t border-midnight-border">
                      <span>Week 1</span>
                      <span>Week 12</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built for <span className="text-mint-primary">Developers</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Shield, title: 'Privacy First', desc: 'Your data stays yours' },
              { icon: Smartphone, title: 'Mobile Responsive', desc: 'Works everywhere' },
              { icon: Download, title: 'Data Export', desc: 'Own your data' },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-midnight-surface/30 border border-midnight-border rounded-xl p-6 backdrop-blur-sm hover:border-mint-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-mint-primary" />
                  </div>
                  <h3 className="font-semibold mb-1 text-text-main">{feature.title}</h3>
                  <p className="text-sm text-text-muted">{feature.desc}</p>
                </motion.div>
              );
            })}
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
                <li><Link to="/methodology" className="hover:text-mint-primary transition-colors">Methodology</Link></li>
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
            <p>Momentum. Website developed by <a href="https://buildwithsds.com" target="_blank" rel="noopener noreferrer" className="text-mint-primary hover:underline">Build with SDS</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

