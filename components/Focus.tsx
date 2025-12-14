import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Monitor } from 'lucide-react';

const MODES = {
  focus: { label: 'Deep Focus', minutes: 25, icon: Brain, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  short: { label: 'Short Break', minutes: 5, icon: Coffee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  long: { label: 'Long Break', minutes: 15, icon: Monitor, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export const Focus: React.FC = () => {
  const { addFocusSession, focusSessions } = useApp();
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [timeLeft, setTimeLeft] = useState(MODES.focus.minutes * 60);
  const [isActive, setIsActive] = useState(false);
  
  // Use a ref for the interval to clear it cleanly
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset timer when mode changes
    setTimeLeft(MODES[mode].minutes * 60);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      if (mode === 'focus') {
        addFocusSession(MODES.focus.minutes);
        // Play notification sound here in a real app
      }
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, mode, addFocusSession]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode].minutes * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((MODES[mode].minutes * 60 - timeLeft) / (MODES[mode].minutes * 60)) * 100;
  
  const todayCount = focusSessions.filter(s => {
    const today = new Date().setHours(0,0,0,0);
    return s.timestamp >= today;
  }).length;

  const ActiveIcon = MODES[mode].icon;

  // SVG Config
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8 md:space-y-12">
      
      {/* Stats Pill */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-full px-6 py-2 flex items-center gap-2 text-sm text-zinc-400">
         <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></span>
         {todayCount} Sessions Completed Today
      </div>

      {/* Timer Circle */}
      {/* Increased container size and adjusted font sizes to prevent squishing */}
      <div className="relative w-80 h-80 md:w-[28rem] md:h-[28rem] flex items-center justify-center">
        {/* Background Ring */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r={radius} 
            stroke="currentColor" 
            strokeWidth="3" 
            fill="transparent" 
            className="text-zinc-800"
          />
          <circle 
            cx="50" cy="50" r={radius} 
            stroke="currentColor" 
            strokeWidth="3" 
            fill="transparent" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`${MODES[mode].color} transition-all duration-1000 ease-linear`}
          />
        </svg>

        <div className="z-10 text-center flex flex-col items-center justify-center">
           <ActiveIcon size={28} className={`mb-4 md:mb-6 ${MODES[mode].color} opacity-90`} />
           
           {/* Reduced font size slightly for better proportions */}
           <div className="text-6xl md:text-8xl font-mono font-bold tracking-tighter text-white mb-2 tabular-nums">
             {formatTime(timeLeft)}
           </div>
           
           <div className="text-zinc-500 uppercase tracking-[0.2em] text-xs md:text-sm font-semibold pl-1">
             {MODES[mode].label}
           </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6 w-full flex flex-col items-center">
        <div className="flex gap-4">
          <button 
            onClick={toggleTimer}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 flex items-center justify-center transition-colors shadow-lg shadow-white/5 active:scale-95 duration-200"
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button 
            onClick={resetTimer}
            className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white flex items-center justify-center transition-colors active:scale-95 duration-200"
          >
            <RotateCcw size={28} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl">
           {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
             <button
               key={m}
               onClick={() => setMode(m)}
               className={`px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${mode === m ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               {MODES[m].label}
             </button>
           ))}
        </div>
      </div>

    </div>
  );
};