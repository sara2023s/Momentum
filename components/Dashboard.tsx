import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App';
import { QUOTES } from '../constants';
import { ArrowRight, Flame, CheckCircle2, Trophy, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Card = ({ children, className = "", delay = 0 }: { children?: React.ReactNode, className?: string, delay?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className={`bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden group ${className}`}
  >
    {children}
  </motion.div>
);

export const Dashboard: React.FC = () => {
  const { user, habits, tasks, focusSessions } = useApp();
  const [quote, setQuote] = useState(QUOTES[0]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, []);

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

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">Good Evening, {user.name}</h1>
        <p className="text-zinc-400">Here is your daily briefing.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Quote Widget */}
        <Card className="md:col-span-2 flex flex-col justify-center bg-gradient-to-br from-zinc-900 to-zinc-900/50">
          <div className="absolute top-0 right-0 p-32 bg-violet-600/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <h3 className="text-xl md:text-2xl font-serif italic text-zinc-100 leading-relaxed z-10">"{quote}"</h3>
        </Card>

        {/* Level Widget */}
        <Card className="md:col-span-1 flex flex-col justify-between items-center text-center relative" delay={0.1}>
           <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent pointer-events-none" />
           <div className="p-3 bg-zinc-800 rounded-full mb-4 ring-1 ring-zinc-700">
             <Trophy size={24} className="text-yellow-500" />
           </div>
           <div>
             <div className="text-4xl font-bold text-white mb-1">{user.level}</div>
             <div className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Current Level</div>
           </div>
           <div className="w-full mt-6">
             <div className="flex justify-between text-xs text-zinc-500 mb-1">
               <span>Next Lvl</span>
               <span>{user.xp} XP</span>
             </div>
             <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
               <div className="h-full bg-violet-600 rounded-full" style={{ width: `${(user.xp / (user.level * 100)) * 100}%` }}></div>
             </div>
           </div>
        </Card>

        {/* Habits Summary */}
        <Card className="md:col-span-1 min-h-[200px]" delay={0.2}>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
              <Flame size={18} className="text-orange-500" /> Habits
            </h4>
            <Link to="/habits" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View All</Link>
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
                    <Cell fill="#7c3aed" />
                    <Cell fill="#27272a" />
                  </Pie>
                </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-sm">
                 {Math.round(habitPercentage)}%
               </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-2xl font-bold text-white">{completedHabits}/{totalHabits}</div>
              <div className="text-xs text-zinc-500">Daily rituals completed. Keep the streak alive.</div>
            </div>
          </div>
        </Card>

        {/* Tasks Summary */}
        <Card className="md:col-span-1" delay={0.3}>
          <div className="flex justify-between items-start mb-4">
            <h4 className="font-semibold text-zinc-200 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" /> My Day
            </h4>
            <Link to="/tasks" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Manage</Link>
          </div>
          <div className="space-y-3">
             {myDayTasks.slice(0, 3).map(task => (
               <div key={task.id} className="flex items-center gap-3 text-sm">
                 <div className={`w-4 h-4 rounded border flex items-center justify-center ${task.completed ? 'bg-emerald-500/20 border-emerald-500' : 'border-zinc-700'}`}>
                    {task.completed && <div className="w-2 h-2 bg-emerald-500 rounded-sm" />}
                 </div>
                 <span className={`truncate ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-300'}`}>{task.title}</span>
               </div>
             ))}
             {myDayTasks.length === 0 && <div className="text-zinc-500 text-sm italic">No tasks for today yet.</div>}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center">
             <span className="text-xs text-zinc-500">{completedTasks} completed</span>
             <div className="h-1 flex-1 mx-4 bg-zinc-800 rounded-full">
               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${myDayTasks.length > 0 ? (completedTasks/myDayTasks.length)*100 : 0}%` }} />
             </div>
          </div>
        </Card>

        {/* Focus Summary */}
        <Card className="md:col-span-1 flex flex-col justify-center items-center text-center space-y-4" delay={0.4}>
          <div className="p-4 bg-zinc-900 rounded-full ring-1 ring-zinc-700 relative group-hover:ring-violet-500/50 transition-all">
            <Clock size={32} className="text-violet-400" />
            <div className="absolute inset-0 bg-violet-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white">{focusMinutes} <span className="text-base font-normal text-zinc-500">min</span></div>
            <div className="text-sm text-zinc-400">Total Focus Time Today</div>
          </div>
          <Link to="/focus" className="inline-flex items-center gap-2 text-sm text-violet-400 hover:text-white transition-colors">
            Start Session <ArrowRight size={14} />
          </Link>
        </Card>
      </div>
    </>
  );
};