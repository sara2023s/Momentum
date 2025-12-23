import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Code, Lightbulb, Target, Rocket } from 'lucide-react';
import { Navbar } from './Navbar';

export const HowThisCameToBe: React.FC = () => {
  return (
    <div className="min-h-screen bg-obsidian text-text">
      <Navbar />

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
              The <span className="text-primary">Story</span>
            </h1>
            <p className="text-lg text-text/70 max-w-2xl mx-auto">
              From frustration to solution—how Momentum was born.
            </p>
          </motion.div>

          {/* Main Content */}
          <div className="space-y-8">
            {/* The Problem */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-surface border border-surface/50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center">
                  <Lightbulb size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">The Problem</h2>
              </div>
              <p className="text-text/70 leading-relaxed mb-4">
                As a developer, I found myself drowning in productivity apps. Each one promised to solve my workflow, but they all had the same issues: bloated interfaces, constant notifications, and features I never used. I was spending more time managing my tools than actually getting work done.
              </p>
              <p className="text-text/70 leading-relaxed">
                The breaking point came when I realized I was using four different apps just to track my daily routine: one for habits, another for tasks, a separate Pomodoro timer, and yet another for journaling. The context switching was killing my flow state. Every time I needed to log something, I had to leave my IDE, find the right app, navigate through menus, and then try to get back into the zone.
              </p>
            </motion.div>

            {/* The Realization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-surface border border-surface/50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center">
                  <Zap size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">The Realization</h2>
              </div>
              <p className="text-text/70 leading-relaxed mb-4">
                I realized what I actually needed wasn't another app—it was a system. A unified workflow that felt like my IDE: fast, dark, keyboard-driven, and designed for deep work. I wanted something that would get out of my way and let me focus on building.
              </p>
              <p className="text-text/70 leading-relaxed">
                The best productivity tools are the ones you don't think about. They should feel like an extension of your workflow, not a distraction from it. That's when I decided to build Momentum—a productivity system designed by a developer, for developers.
              </p>
            </motion.div>

            {/* The Vision */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-surface border border-surface/50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center">
                  <Target size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">The Vision</h2>
              </div>
              <p className="text-text/70 leading-relaxed mb-4">
                Momentum isn't just another productivity app. It's a complete system that combines:
              </p>
              <ul className="list-disc list-inside space-y-2 text-text/70 mb-4">
                <li><strong className="text-text">Habit Tracking</strong> with GitHub-style contribution graphs that make consistency visual and motivating</li>
                <li><strong className="text-text">Task Management</strong> that's fast and keyboard-friendly, designed for quick capture and execution</li>
                <li><strong className="text-text">Focus Sessions</strong> with integrated Pomodoro timers that sync with your workflow</li>
                <li><strong className="text-text">Daily Journaling</strong> with structured prompts that help you reflect and improve</li>
                <li><strong className="text-text">Analytics</strong> that actually matter—showing your momentum, not just raw data</li>
              </ul>
              <p className="text-text/70 leading-relaxed">
                Everything is designed with the developer mindset: dark mode by default, keyboard shortcuts, minimal UI, and data-driven insights. No bloat, no distractions—just pure productivity.
              </p>
            </motion.div>

            {/* The Build */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-surface border border-surface/50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center">
                  <Code size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">The Build</h2>
              </div>
              <p className="text-text/70 leading-relaxed mb-4">
                Building Momentum has been a journey of solving my own problems first. Every feature was born from a real need in my daily workflow. The habit tracker came from wanting to see my consistency at a glance. The focus timer integrated directly with tasks because I needed to know what I was working on. The journaling system emerged from wanting to capture insights without breaking flow.
              </p>
              <p className="text-text/70 leading-relaxed">
                I built it using modern web technologies—React, TypeScript, Supabase, and Prisma—because I wanted something fast, reliable, and maintainable. The design is intentionally minimal, inspired by GitHub's clean aesthetic and the efficiency of developer tools. Every pixel serves a purpose.
              </p>
            </motion.div>

            {/* The Future */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-surface border border-surface/50 rounded-xl p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-mint-primary/10 flex items-center justify-center">
                  <Rocket size={20} className="text-primary" />
                </div>
                <h2 className="text-2xl font-bold">The Future</h2>
              </div>
              <p className="text-text/70 leading-relaxed mb-4">
                Momentum is more than just my personal productivity system—it's a platform for builders who value speed, simplicity, and continuous improvement. As I continue to use it daily, I'll keep refining and adding features that actually matter.
              </p>
              <p className="text-text/70 leading-relaxed">
                The goal isn't to build the biggest productivity app. It's to build the best one for people who think like developers: who value efficiency, appreciate good design, and want tools that get out of the way so they can focus on what matters—building great things.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface/50 bg-obsidian py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-text/70">
            <p>Momentum. Developed by <a href="https://buildwithsds.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Build with SDS</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

