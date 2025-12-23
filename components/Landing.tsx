import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  Keyboard,
  Shield,
  Smartphone,
  Download,
  Github,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Landing: React.FC = () => {
  const { signInWithGoogle } = useAuth();
  const [error, setError] = React.useState<string | null>(null);

  const handleGetStarted = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-text">
      {/* Navigation */}
      <nav className="border-b border-surface/50 bg-obsidian/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap size={18} className="text-white fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">Momentum</span>
            </div>
            <button
              onClick={handleGetStarted}
              className="px-4 py-2 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface border border-surface/50 rounded-full text-sm text-text/70 mb-4">
                <Sparkles size={14} className="text-primary" />
                <span className="font-mono text-xs">BETA</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                The Productivity System
                <br />
                for <span className="text-primary">Builders</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-text/80 leading-relaxed max-w-xl">
                Stop juggling a todo list, a habit tracker, and a journal. Momentum combines deep work, gamification, and analytics into one dark-mode optimized workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-3 bg-primary hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-base flex items-center gap-2 group"
                >
                  Start Building Momentum
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-text/60">No credit card required. Join the beta.</p>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm max-w-md">
                  {error}
                </div>
              )}
            </motion.div>

            {/* Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, rotateY: -5 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-surface border border-surface/50 rounded-2xl p-6 shadow-2xl transform perspective-1000" style={{ transform: 'perspective(1000px) rotateY(-3deg) rotateX(2deg)' }}>
                <div className="bg-obsidian rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-24 bg-surface rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 bg-accent rounded-full"></div>
                      <div className="h-3 w-3 bg-primary/50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-surface rounded"></div>
                    <div className="h-20 bg-surface rounded"></div>
                    <div className="h-20 bg-surface rounded"></div>
                  </div>
                  <div className="h-32 bg-surface rounded flex items-center justify-center">
                    <div className="text-xs text-text/40 font-mono">Heatmap Visualization</div>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-surface/50 bg-surface/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <p className="text-sm font-mono text-text/60 uppercase tracking-wider">Engineered for flow</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-sm">
            <div className="flex items-center gap-2 text-text/70">
              <Keyboard size={16} className="text-primary" />
              <span>100% Keyboard Friendly</span>
            </div>
            <div className="flex items-center gap-2 text-text/70">
              <Clock size={16} className="text-primary" />
              <span>0.3s Load Time</span>
            </div>
            <div className="flex items-center gap-2 text-text/70">
              <Zap size={16} className="text-primary" />
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
              Most productivity apps are just <span className="text-accent">digital clutter</span>
            </h2>
            <p className="text-lg text-text/80 leading-relaxed max-w-2xl mx-auto">
              You have a Notes app for thoughts, a separate timer for Pomodoro, and a spreadsheet for habits. Context switching is killing your flow. Momentum unifies your stack.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pillar A: Gamified Engine */}
      <section className="py-20 sm:py-28 bg-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary mb-4">
                PILLAR A
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Turn Discipline into <span className="text-primary">Dopamine</span>
              </h2>
              <p className="text-lg text-text/80 leading-relaxed">
                Track habits with GitHub-style contribution graphs. Earn XP for every task completed and level up your character. Consistency is no longer a chore; it's a game.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-surface border border-surface/50 rounded-xl p-6 shadow-xl">
                <div className="bg-obsidian rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-text">Level 5</div>
                    <div className="text-xs text-primary font-mono">1,250 XP</div>
                  </div>
                  <div className="h-2 bg-surface rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-3 rounded ${
                          i < 20 ? 'bg-primary' : 'bg-surface'
                        }`}
                        style={{ opacity: i < 20 ? 0.3 + (i % 4) * 0.2 : 0.1 }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-xl -z-10"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillar B: Deep Work Command Center */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-2 lg:order-1"
            >
              <div className="bg-surface border border-surface/50 rounded-xl p-8 shadow-xl">
                <div className="bg-obsidian rounded-lg p-6 space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-mono font-bold text-text mb-2">25:00</div>
                    <div className="text-xs text-text/60 uppercase tracking-wider">Deep Focus</div>
                  </div>
                  <div className="flex justify-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-surface border border-surface/50 flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-text/40 rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs text-text/50 text-center">Current Task: Ship feature</div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-xl -z-10"></div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6 order-1 lg:order-2"
            >
              <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary mb-4">
                PILLAR B
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Enter Flow State. <span className="text-primary">Instantly</span>
              </h2>
              <p className="text-lg text-text/80 leading-relaxed">
                Integrated Pomodoro timers sync directly with your task list. Block distractions and track exactly how many hours of deep work you log per week.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pillar C: Engineering Log */}
      <section className="py-20 sm:py-28 bg-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-block px-3 py-1 bg-primary/10 border border-primary/20 rounded text-xs font-mono text-primary mb-4">
                PILLAR C
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                Debug Your <span className="text-primary">Life</span>
              </h2>
              <p className="text-lg text-text/80 leading-relaxed">
                Daily structured journaling to capture insights, gratitude, and blockers. Review your weekly analytics to optimize your routine based on real data.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="bg-surface border border-surface/50 rounded-xl p-6 shadow-xl">
                <div className="bg-obsidian rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-mono text-text/60">Productivity Trend</div>
                    <div className="text-xs text-primary">+23%</div>
                  </div>
                  <div className="h-32 flex items-end justify-between gap-1">
                    {[65, 70, 68, 75, 80, 85, 82, 88, 90, 87, 92, 95].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-text/40 font-mono">
                    <span>Week 1</span>
                    <span>Week 12</span>
                  </div>
                </div>
              </div>
              <div className="absolute -inset-1 bg-primary/10 rounded-xl blur-xl -z-10"></div>
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
              Built for <span className="text-primary">Developers</span>
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Keyboard, title: 'Keyboard Shortcuts', desc: 'Vim-style navigation' },
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
                  className="bg-surface/30 border border-surface/50 rounded-xl p-6 backdrop-blur-sm hover:border-primary/30 transition-all"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-text/60">{feature.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Personal Touch */}
      <section className="py-20 sm:py-28 bg-surface/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <Zap size={24} className="text-white fill-white" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              Built by a developer, for <span className="text-primary">developers</span>
            </h2>
            <p className="text-lg text-text/80 leading-relaxed max-w-2xl mx-auto">
              I built Momentum because I was tired of subscription fatigue and bloated software. This is the tool I use every day to ship code.
            </p>
            <div className="pt-4">
              <a
                href="https://buildwithsds.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text/60 hover:text-primary transition-colors text-sm"
              >
                — Build with SDS
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <Target size={48} className="mx-auto text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to build your <span className="text-primary">streak</span>?
            </h2>
            <p className="text-lg text-text/80 max-w-2xl mx-auto">
              Join developers who are taking control of their productivity. Start your journey today.
            </p>
            <button
              onClick={handleGetStarted}
              className="px-8 py-4 bg-primary hover:bg-blue-500 text-white rounded-lg font-semibold transition-all duration-200 shadow-lg shadow-primary/20 hover:shadow-primary/30 text-lg flex items-center gap-2 mx-auto group"
            >
              Start Building Momentum
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="text-sm text-text/60">No credit card required. Join the beta.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface/50 bg-obsidian py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center">
                <Zap size={14} className="text-white fill-white" />
              </div>
              <span className="text-lg font-bold">Momentum</span>
            </div>
            <div className="text-sm text-text/60">
              Website developed by{' '}
              <a
                href="https://buildwithsds.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text/80 hover:text-primary transition-colors"
              >
                Build with SDS
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
