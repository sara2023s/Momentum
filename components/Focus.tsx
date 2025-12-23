import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, Monitor, Clock } from 'lucide-react';
import { getFocusSessions, createFocusSession } from '../actions/focus';
import { addXP } from '../actions/user';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import type { FocusSession } from '../types';

const MODES = {
  focus: { label: 'Deep Focus', minutes: 25, icon: Brain, color: 'text-primary', strokeColor: '#3B82F6', bg: 'bg-primary/10', ring: 'ring-primary/20' },
  short: { label: 'Short Break', minutes: 5, icon: Coffee, color: 'text-emerald-500', strokeColor: '#10b981', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
  long: { label: 'Long Break', minutes: 15, icon: Monitor, color: 'text-blue-500', strokeColor: '#3b82f6', bg: 'bg-blue-500/10', ring: 'ring-blue-500/20' },
};

const PRESET_MINUTES = [5, 10, 15, 25, 30, 45, 60];

export const Focus: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [customMinutes, setCustomMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Use a ref for the interval to clear it cleanly
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!authUser) return;
    
    const fetchSessions = async () => {
      try {
        const data = await getFocusSessions(authUser.id);
        setFocusSessions(data);
      } catch (error) {
        console.error('Failed to fetch focus sessions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [authUser]);

  useEffect(() => {
    // Reset timer when mode changes
    const minutes = MODES[mode].minutes;
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const setTimerDuration = (minutes: number) => {
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      if (mode === 'focus') {
        handleSessionComplete(customMinutes);
      }
      setIsActive(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, mode]);

  const handleSessionComplete = async (duration: number) => {
    if (!authUser) return;
    try {
      const session = await createFocusSession(authUser.id, duration);
      setFocusSessions((prev) => [session, ...prev]);
      
      // Add XP for completing focus session (only for focus mode, not breaks)
      if (mode === 'focus') {
        try {
          // Give XP based on duration (1 XP per minute, minimum 10)
          const xpAmount = Math.max(10, duration);
          await addXP(authUser.id, xpAmount);
          await refreshUser();
        } catch (error) {
          console.error('Failed to add XP:', error);
        }
      }
    } catch (error) {
      console.error('Failed to save focus session:', error);
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      // If timer is at 0, reset it first
      setTimeLeft(customMinutes * 60);
    }
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customMinutes * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((customMinutes * 60 - timeLeft) / (customMinutes * 60)) * 100;
  
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
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto space-y-6 sm:space-y-8 p-4 sm:p-6">
      
      {/* Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface border border-surface/50 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 w-full max-w-md"
      >
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
        <div className="flex-1">
          <div className="text-xs sm:text-sm text-text/70">
            {loading ? 'Loading...' : `${todayCount} Session${todayCount !== 1 ? 's' : ''} Today`}
          </div>
        </div>
        <Clock size={14} className="sm:w-4 sm:h-4 text-text/50" />
      </motion.div>

      {/* Main Timer Section */}
      <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-8 lg:gap-12 w-full">
        
        {/* Timer Circle */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 flex items-center justify-center"
        >
          {/* Background Ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r={radius} 
              stroke="currentColor" 
              strokeWidth="4" 
              fill="transparent" 
              className="text-surface/50"
            />
            <circle 
              cx="50" cy="50" r={radius} 
              stroke={MODES[mode].strokeColor}
              strokeWidth="4" 
              fill="transparent" 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              style={{ filter: `drop-shadow(0 0 8px ${MODES[mode].strokeColor})` }}
            />
          </svg>

          <div className="z-10 text-center flex flex-col items-center justify-center relative">
            <div className={`mb-2 sm:mb-3 p-2 sm:p-3 rounded-lg sm:rounded-xl ${MODES[mode].bg} ${MODES[mode].ring} ring-2`}>
              <ActiveIcon size={20} className={`sm:w-6 sm:h-6 ${MODES[mode].color}`} />
            </div>
            
            <div className="text-4xl sm:text-5xl lg:text-6xl font-mono font-bold tracking-tighter text-text mb-1 tabular-nums">
              {formatTime(timeLeft)}
            </div>
            
            <div className="text-text/60 uppercase tracking-wider text-xs font-medium">
              {MODES[mode].label}
            </div>
          </div>
        </motion.div>

        {/* Controls Panel */}
        <div className="flex-1 w-full lg:max-w-md space-y-4 sm:space-y-6">
          
          {/* Main Controls */}
          <div className="flex gap-3 justify-center">
            <button 
              onClick={toggleTimer}
              className={`h-12 w-12 sm:h-14 sm:w-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 touch-manipulation ${
                isActive 
                  ? 'bg-surface text-text/80 hover:bg-surface/70 border border-surface/50' 
                  : 'bg-primary text-white hover:bg-blue-500 border border-primary'
              }`}
            >
              {isActive ? <Pause size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> : <Play size={20} className="sm:w-6 sm:h-6 ml-0.5" fill="currentColor" />}
            </button>
            <button 
              onClick={resetTimer}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-surface border border-surface/50 text-text/70 hover:bg-surface/70 hover:text-text hover:border-surface/70 flex items-center justify-center transition-all duration-200 active:scale-95 touch-manipulation"
            >
              <RotateCcw size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="bg-surface border border-surface/50 rounded-xl p-1.5 flex gap-1.5">
            {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] ${
                  mode === m 
                    ? `bg-surface/70 text-text ${MODES[m].ring} ring-2` 
                    : 'text-text/60 hover:text-text hover:bg-obsidian'
                }`}
              >
                {MODES[m].label}
              </button>
            ))}
          </div>

          {/* Custom Duration Input */}
          <div className="bg-surface border border-surface/50 rounded-xl p-3 sm:p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-text">Custom Duration</label>
              <button
                onClick={() => setShowCustomInput(!showCustomInput)}
                className="text-xs text-text/60 hover:text-text transition-colors touch-manipulation"
              >
                {showCustomInput ? 'Hide' : 'Set Custom'}
              </button>
            </div>
            {showCustomInput && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setCustomMinutes(Math.min(120, Math.max(1, value)));
                  }}
                  onBlur={() => setTimeLeft(customMinutes * 60)}
                  className="flex-1 bg-obsidian border border-surface/50 rounded-lg px-3 sm:px-4 py-2 text-text text-center font-mono text-sm sm:text-base focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  disabled={isActive}
                />
                <span className="text-text/60 text-xs sm:text-sm">min</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preset Duration Buttons */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl"
      >
        <div className="bg-surface border border-surface/50 rounded-xl p-3 sm:p-4">
          <div className="text-xs text-text/60 uppercase tracking-wider font-medium mb-2 sm:mb-3 text-center">Quick Presets</div>
          <div className="flex flex-wrap gap-2 justify-center">
            {PRESET_MINUTES.map((minutes) => (
              <button
                key={minutes}
                onClick={() => setTimerDuration(minutes)}
                disabled={isActive}
                className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation min-h-[44px] min-w-[44px] ${
                  customMinutes === minutes
                    ? 'bg-primary text-white border border-primary'
                    : 'bg-obsidian border border-surface/50 text-text/70 hover:bg-surface hover:text-text hover:border-surface/70'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
              >
                {minutes}m
              </button>
            ))}
          </div>
        </div>
      </motion.div>

    </div>
  );
};
