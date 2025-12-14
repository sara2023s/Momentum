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
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label, onClick }: { to: string, icon: any, label: string, onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink 
      to={to} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        isActive 
          ? 'bg-violet-600/10 text-violet-500 border border-violet-600/20' 
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
      }`}
    >
      <Icon size={20} className={isActive ? 'text-violet-500' : 'text-zinc-500 group-hover:text-zinc-100'} />
      <span className="font-medium text-sm">{label}</span>
      {isActive && (
        <motion.div 
          layoutId="active-pill" 
          className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500"
        />
      )}
    </NavLink>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useApp();
  
  // Calculate Progress to next level
  const currentLevelXp = 0; // Simplified for MVP logic, usually based on a curve
  const nextLevelXp = 100 * user.level; // Linear scaling for MVP
  const progress = Math.min((user.xp / nextLevelXp) * 100, 100);

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-50 overflow-hidden font-sans selection:bg-violet-500/30">
      
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-zinc-950/80 backdrop-blur-sm lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-zinc-900">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/20">
            <Zap size={18} className="text-white fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Momentum</span>
          <button onClick={() => setIsMobileOpen(false)} className="ml-auto lg:hidden text-zinc-400">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-2 flex justify-between items-end">
             <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lvl {user.level}</span>
             <span className="text-xs text-violet-400 font-mono">{user.xp} XP</span>
          </div>
          <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-violet-600"
            />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/habits" icon={CheckSquare} label="Habits" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/tasks" icon={ListTodo} label="Tasks" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/focus" icon={Timer} label="Focus" onClick={() => setIsMobileOpen(false)} />
          <SidebarItem to="/journal" icon={Book} label="Journal" onClick={() => setIsMobileOpen(false)} />
        </nav>

        <div className="p-6 border-t border-zinc-900 text-center text-xs text-zinc-600">
          v1.0.0 &bull; MVP Build
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-16 border-b border-zinc-900 flex items-center justify-between px-6 lg:hidden">
          <div className="font-bold flex items-center gap-2">
            <Zap size={18} className="text-violet-500" /> Momentum
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 text-zinc-400 hover:text-white">
            <Menu size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};