import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { QUOTES } from '../constants';
import { ArrowRight, Flame, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getHabits } from '../actions/habits';
import { getTasks } from '../actions/tasks';
import { getFocusSessions } from '../actions/focus';
import { getFocusMomentumData, getOverallMomentumData } from '../actions/visualizations';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import { FocusMomentumCard } from './viz/FocusMomentumCard';
import { ContributionHeatmap } from './viz/ContributionHeatmap';
import type { Habit, Task, FocusSession } from '../types';

const Card = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-surface border border-surface/50 rounded-2xl p-6 relative overflow-hidden group ${className}`}
  >
    {children}
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { user: authUser } = useAuth();
  const { user } = useApp();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [focusMomentum, setFocusMomentum] = useState<{ thisWeekCount: number; lastWeekCount: number; last7DaysMinutes: number[] } | null>(null);
  const [overallMomentumData, setOverallMomentumData] = useState<{ date: string; count: number }[]>([]);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const hasInitiallyLoaded = useRef(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

  const fetchData = useCallback(async (showLoading = false) => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    
    try {
      if (showLoading) {
        setLoading(true);
      }
      console.log('Fetching dashboard data...');
      const [habitsData, tasksData, sessionsData, momentumData, overallData] = await Promise.all([
        getHabits(authUser.id),
        getTasks(authUser.id),
        getFocusSessions(authUser.id),
        getFocusMomentumData(authUser.id),
        getOverallMomentumData(authUser.id),
      ]);
      console.log('Dashboard data fetched successfully');
      setHabits(habitsData);
      setTasks(tasksData);
      setFocusSessions(sessionsData);
      setFocusMomentum(momentumData);
      setOverallMomentumData(overallData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      // Always set loading to false after fetch completes
      setLoading(false);
    }
  }, [authUser]);

  // Fetch data on mount and when navigating to dashboard
  useEffect(() => {
    if (!authUser) {
      setLoading(false);
      return;
    }
    
    // Always fetch data when Dashboard component mounts
    // The Dashboard only renders when on the /app route
    console.log('Dashboard mounted, fetching data. First load:', !hasInitiallyLoaded.current);
    const isFirstLoad = !hasInitiallyLoaded.current;
    hasInitiallyLoaded.current = true;
    fetchData(isFirstLoad);
  }, [authUser, fetchData]);

  // Refetch when tab becomes visible again
  useEffect(() => {
    if (!authUser) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchData(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData, authUser]);

  // Compute Stats
  const completedHabits = habits.filter(h => h.completedToday).length;
  const totalHabits = habits.length;
  const habitPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  
  const myDayTasks = tasks.filter(t => t.type === 'my_day');
  const completedTasks = myDayTasks.filter(t => t.completed).length;
  
  const todaySessions = focusSessions.filter(s => {
    const today = new Date().setHours(0,0,0,0);
    return s.timestamp >= today;
  });
  const focusMinutes = todaySessions.reduce((acc, curr) => acc + curr.duration, 0);

  const data = [
    { name: 'Completed', value: completedHabits },
    { name: 'Remaining', value: totalHabits - completedHabits },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text/60">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-text tracking-tight">Good Evening, {user.name}</h1>
        <p className="text-xs sm:text-sm md:text-base text-text/70">Here is your daily briefing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {/* Quote Widget */}
        <Card className="md:col-span-2 flex flex-col justify-center bg-gradient-to-br from-surface to-surface/50">
          <div className="absolute top-0 right-0 p-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <h3 className="text-base sm:text-xl md:text-2xl font-serif italic text-text leading-relaxed z-10">"{quote}"</h3>
        </Card>

        {/* Level Widget */}
        <Card className="md:col-span-1 flex flex-col justify-between items-center text-center relative" delay={0.1}>
           <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
           <div className="p-3 bg-surface rounded-full mb-4 ring-1 ring-surface/50">
             <Trophy size={24} className="text-yellow-500" />
           </div>
           <div>
             <div className="text-3xl sm:text-4xl font-bold text-text mb-1">{user.level}</div>
             <div className="text-xs text-text/60 uppercase tracking-widest font-semibold">Current Level</div>
           </div>
           <div className="w-full mt-6">
             <div className="flex justify-between text-xs text-text/60 mb-1">
               <span>Next Lvl</span>
               <span>{user.xp} XP</span>
             </div>
             <div className="h-2 bg-surface rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full" style={{ width: `${(user.xp / (user.level * 100)) * 100}%` }}></div>
             </div>
           </div>
        </Card>

        {/* Habits Summary */}
        <Card className="md:col-span-1 min-h-[200px]" delay={0.2}>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-text flex items-center gap-2">
              <Flame size={18} className="text-accent" /> Habits
            </h4>
            <Link to="/habits" className="text-xs text-primary hover:text-blue-400 transition-colors">View All</Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={30}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    stroke="none"
                  >
                    <Cell fill="#3B82F6" />
                    <Cell fill="#172554" />
                  </Pie>
                </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                 {Math.round(habitPercentage)}%
               </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-2xl font-bold text-text">{completedHabits}/{totalHabits}</div>
              <div className="text-xs text-text/60">Daily rituals completed. Keep the streak alive.</div>
            </div>
          </div>
        </Card>

        {/* Tasks Summary */}
        <Card className="md:col-span-1" delay={0.3}>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-text flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> My Day
            </h4>
            <Link to="/tasks" className="text-xs text-primary hover:text-blue-400 transition-colors">Manage</Link>
          </div>
          <div className="space-y-3">
             {myDayTasks.slice(0, 3).map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm">
                 <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-emerald-500/20 border-emerald-500' : 'border-zinc-700'}`}>
                    {task.completed && <div className="w-2 h-2 bg-emerald-500 rounded-sm" />}
                 </div>
                 <span className={`truncate ${task.completed ? 'text-text/60 line-through' : 'text-text'}`}>{task.title}</span>
               </div>
             ))}
             {myDayTasks.length === 0 && <div className="text-text/60 text-sm italic">No tasks for today yet.</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-surface/50 flex justify-between items-center">
             <span className="text-xs text-text/60">{completedTasks} completed</span>
             <div className="h-1 flex-1 mx-4 bg-surface rounded-full">
               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${myDayTasks.length > 0 ? (completedTasks/myDayTasks.length)*100 : 0}%` }} />
             </div>
          </div>
        </Card>

        {/* Focus Summary */}
        <Card className="md:col-span-1 flex flex-col justify-center items-center text-center space-y-4" delay={0.4}>
          <div className="p-4 bg-surface rounded-full ring-1 ring-surface/50 relative group-hover:ring-primary/50 transition-all">
            <Clock size={32} className="text-primary" />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="text-3xl font-bold text-text">{focusMinutes} <span className="text-base font-normal text-text/60">min</span></div>
            <div className="text-sm text-text/70">Total Focus Time Today</div>
          </div>
          <Link to="/focus" className="inline-flex items-center gap-2 text-sm text-primary hover:text-blue-400 transition-colors">
            Start Session <ArrowRight size={14} />
          </Link>
        </Card>
      </div>

      {/* Focus Momentum Card */}
      {!loading && focusMomentum && (
        <FocusMomentumCard
          thisWeekCount={focusMomentum.thisWeekCount}
          lastWeekCount={focusMomentum.lastWeekCount}
          last7DaysMinutes={focusMomentum.last7DaysMinutes}
        />
      )}

      {/* Overall Momentum Heatmap */}
      {!loading && (
        <ContributionHeatmap 
          data={overallMomentumData} 
          title="Overall Momentum" 
          color="#3B82F6"
        />
      )}
    </>
  );
};
