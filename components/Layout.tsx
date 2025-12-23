import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  ListTodo, 
  Timer, 
  Book, 
  Menu, 
  X,
  Zap,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, onClick, end }: { to: string, icon: any, label: string, onClick?: () => void, end?: boolean }) => {
  return (
    <NavLink 
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => `flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group min-h-[44px] ${
        isActive 
          ? 'bg-mint-primary/10 text-mint-primary border border-mint-primary/20' 
          : 'text-text-muted hover:text-text-main hover:bg-midnight-surface'
      }`}
    >
      {({ isActive }) => (
        <>
          <Icon size={20} className={isActive ? 'text-mint-primary' : 'text-text-muted group-hover:text-text-main'} />
          <span className="font-medium text-sm">{label}</span>
          {isActive && (
            <motion.div 
              layoutId="active-pill" 
              className="ml-auto w-1.5 h-1.5 rounded-full bg-mint-primary"
            />
          )}
        </>
      )}
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useApp();
  const { signOut, user: authUser } = useAuth();
  
  // Calculate Progress to next level
  const currentLevelXp = 0; // Simplified for MVP logic, usually based on a curve
  const nextLevelXp = 100 * user.level; // Linear scaling for MVP
  const progress = Math.min((user.xp / nextLevelXp) * 100, 100);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen flex bg-midnight-bg text-text-main overflow-hidden font-sans selection:bg-mint-primary/30">
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-midnight-bg/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-midnight-bg border-r border-midnight-border flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-midnight-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-mint-primary to-teal-500 flex items-center justify-center shadow-lg shadow-mint-primary/20">
            <Zap size={18} className="text-midnight-bg fill-midnight-bg" />
          </div>
          <span className="text-xl font-bold tracking-tight">Momentum</span>
          <button onClick={() => setIsMobileOpen(false)} className="ml-auto lg:hidden text-text-muted">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-2 flex justify-between items-end">
             <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Lvl {user.level}</span>
             <span className="text-xs text-mint-primary font-mono">{user.xp} XP</span>
          </div>
          <div className="h-1.5 w-full bg-midnight-surface rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-mint-primary"
            />
          </div>
        </div>

        <nav className="flex-1 px-3 sm:px-4 space-y-1 sm:space-y-2 overflow-y-auto">
          <SidebarItem to="/app" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileOpen(false)} end />
          <SidebarItem to="/app/habits" icon={CheckSquare} label="Habits" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/app/tasks" icon={ListTodo} label="Tasks" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/app/focus" icon={Timer} label="Focus" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/app/journal" icon={Book} label="Journal" onClick={() => setIsMobileOpen(false)} />
        </nav>

        <div className="p-6 border-t border-midnight-border space-y-4">
          {authUser && (
            <div>
              <div className="text-xs text-text-muted mb-2 truncate">{authUser.email}</div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text-main hover:bg-midnight-surface rounded-lg transition-colors"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
          <div className="text-center text-xs text-text-muted/70">
            Website developed by{' '}
            <a
              href="https://buildwithsds.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-mint-primary transition-colors"
            >
              Build with SDS
            </a>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-midnight-border flex items-center justify-between px-6 lg:hidden">
          <div className="font-bold flex items-center gap-2">
            <Zap size={18} className="text-mint-primary" /> Momentum
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-text-muted hover:text-text-main">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 pb-16 sm:pb-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};