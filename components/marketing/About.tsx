import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ExternalLink, Code, Coffee, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-midnight-bg text-text-main">
      {/* Navigation */}
      <nav className="border-b border-midnight-border bg-midnight-bg/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mint-primary to-teal-500 flex items-center justify-center shadow-lg shadow-mint-primary/20">
                <Zap size={18} className="text-midnight-bg fill-midnight-bg" />
              </div>
              <span className="text-xl font-bold tracking-tight font-mono">Momentum</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-text-muted hover:text-text-main transition-colors text-sm">
                Pricing
              </Link>
              <Link to="/methodology" className="text-text-muted hover:text-text-main transition-colors text-sm">
                Methodology
              </Link>
              <Link to="/about" className="text-mint-primary text-sm font-medium">
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Built by a developer, for <span className="text-mint-primary">developers</span>
            </h1>
          </motion.div>

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Avatar Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-1 flex flex-col items-center"
            >
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-mint-primary to-teal-500 flex items-center justify-center mb-6 shadow-lg shadow-mint-primary/20">
                <Code size={48} className="text-midnight-bg" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Sara</h2>
              <p className="text-text-muted text-center mb-4">Developer & Creator</p>
              <a
                href="https://buildwithsds.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-mint-primary/10 border border-mint-primary/20 rounded-lg text-mint-primary hover:bg-mint-primary/20 transition-colors text-sm font-medium"
              >
                View Portfolio
                <ExternalLink size={16} />
              </a>
            </motion.div>

            {/* Story Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-2 space-y-6"
            >
              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Coffee size={20} className="text-mint-primary" />
                  The Story
                </h3>
                <p className="text-text-muted leading-relaxed mb-4">
                  Hi, I'm Sara. I built Momentum because I was tired of bloated software. I wanted a tool that felt like my IDE—fast, dark, and keyboard-driven.
                </p>
                <p className="text-text-muted leading-relaxed">
                  As a developer, I found myself juggling multiple apps: one for habits, another for tasks, a separate timer, and yet another for journaling. The context switching was killing my flow. So I built Momentum to unify everything into one cohesive system.
                </p>
              </div>

              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Rocket size={20} className="text-mint-primary" />
                  The Vision
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Momentum is more than just a productivity app—it's a system designed for builders who value speed, simplicity, and data-driven improvement. Every feature is built with the developer mindset: keyboard shortcuts, dark mode by default, and analytics that actually matter.
                </p>
              </div>

              <div className="bg-midnight-surface border border-midnight-border rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4">Connect</h3>
                <p className="text-text-muted leading-relaxed mb-4">
                  Want to see more of my work? Check out my portfolio and other projects.
                </p>
                <a
                  href="https://buildwithsds.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-mint-primary hover:text-teal-400 transition-colors font-medium"
                >
                  Visit Build with SDS
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          </div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              {
                title: 'Fast',
                desc: 'Built for speed. No bloat, no lag, just instant responses.',
                icon: Zap,
              },
              {
                title: 'Simple',
                desc: 'Clean interface. Keyboard-driven. No unnecessary features.',
                icon: Code,
              },
              {
                title: 'Data-Driven',
                desc: 'Track your progress with real analytics, not vanity metrics.',
                icon: Rocket,
              },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.title}
                  className="bg-midnight-surface border border-midnight-border rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-mint-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon size={24} className="text-mint-primary" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">{value.title}</h4>
                  <p className="text-sm text-text-muted">{value.desc}</p>
                </div>
              );
            })}
          </motion.div>
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
                <li><Link to="/about" className="hover:text-mint-primary transition-colors">About</Link></li>
                <li><Link to="/privacy" className="hover:text-mint-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-text-main">Connect</h4>
              <ul className="space-y-2 text-sm text-text-muted">
                <li>
                  <a href="https://buildwithsds.com" target="_blank" rel="noopener noreferrer" className="hover:text-mint-primary transition-colors">
                    Build with SDS
                  </a>
                </li>
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

