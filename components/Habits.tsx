import React, { useState, useEffect, useTransition, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus, Flame, Check } from 'lucide-react';
import { getHabits, createHabit, toggleHabit } from '../actions/habits';
import { getHabitLogsForHeatmap } from '../actions/visualizations';
import { addXP } from '../actions/user';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import { ContributionHeatmap } from './viz/ContributionHeatmap';
import type { Habit } from '../types';

export const Habits: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabit, setNewHabit] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const tempToRealIdMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!authUser) return;
    
    const fetchHabits = async () => {
      try {
        const [habitsData, heatmapDataResult] = await Promise.all([
          getHabits(authUser.id),
          getHabitLogsForHeatmap(authUser.id)
        ]);
        setHabits(habitsData);
        setHeatmapData(heatmapDataResult);
      } catch (error) {
        console.error('Failed to fetch habits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHabits();
  }, [authUser]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabit.trim()) return;

    const title = newHabit.trim();
    setNewHabit('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticHabit: Habit = {
      id: tempId,
      title,
      streak: 0,
      completedToday: false,
      frequency: 'daily',
    };
    setHabits((prev) => [...prev, optimisticHabit]);

    startTransition(async () => {
      if (!authUser) return;
      try {
        const habit = await createHabit(authUser.id, title);
        // Map temp ID to real ID so we can maintain the same key
        tempToRealIdMap.current.set(tempId, habit.id);
        setHabits((prev) => prev.map((h) => (h.id === tempId ? habit : h)));
        // Clean up the mapping after animation completes
        setTimeout(() => tempToRealIdMap.current.delete(tempId), 500);
      } catch (error) {
        console.error('Failed to create habit:', error);
        setHabits((prev) => prev.filter((h) => h.id !== tempId));
        tempToRealIdMap.current.delete(tempId);
      }
    });
  };

  const handleToggle = async (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    // Optimistic update
    setHabits((prev) =>
      prev.map((h) =>
        h.id === habitId
          ? { ...h, completedToday: !h.completedToday, streak: h.completedToday ? Math.max(0, h.streak - 1) : h.streak + 1 }
          : h
      )
    );

    startTransition(async () => {
      if (!authUser) return;
      const wasCompleted = habit.completedToday;
      try {
        await toggleHabit(habitId);
        // Refetch to get accurate streak
        const updated = await getHabits(authUser.id);
        setHabits(updated);
        
        // Add XP if habit was just completed (not uncompleted)
        if (!wasCompleted) {
          try {
            await addXP(authUser.id, 10);
            await refreshUser();
          } catch (error) {
            console.error('Failed to add XP:', error);
          }
        }
      } catch (error) {
        console.error('Failed to toggle habit:', error);
        // Revert on error
        setHabits((prev) =>
          prev.map((h) =>
            h.id === habitId
              ? { ...h, completedToday: habit.completedToday, streak: habit.streak }
              : h
          )
        );
      }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Habit Engine</h2>
          <p className="text-text/70 text-xs sm:text-sm">Consistency is the key to mastery.</p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xl sm:text-2xl font-bold text-primary">{habits.filter(h => h.completedToday).length}/{habits.length}</div>
          <div className="text-xs text-text/70 uppercase tracking-wider">Completed</div>
        </div>
      </div>

      {/* Contribution Heatmap */}
      {!loading && (
        <ContributionHeatmap 
          data={heatmapData} 
          title="Habit Consistency" 
          color="#3B82F6"
        />
      )}

      {loading ? (
        <div className="text-center text-text/70 py-12">Loading habits...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
          {habits.map((habit) => {
            // Find if this real ID was mapped from a temp ID
            const tempId = Array.from(tempToRealIdMap.current.entries()).find(([_, realId]) => realId === habit.id)?.[0];
            // Use temp ID as key if it exists, otherwise use real ID - this maintains continuity
            const stableKey = tempId || habit.id;
            const isNewItem = !habit.id.startsWith('temp-') && !tempId;
            
            return (
            <motion.div
              key={stableKey}
              layoutId={stableKey}
              layout
              initial={isNewItem ? { opacity: 0, scale: 0.95 } : false}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-5 rounded-xl border transition-all duration-300 group ${
                habit.completedToday 
                  ? 'bg-surface/50 border-primary/30' 
                  : 'bg-surface border-surface/50 hover:border-surface/70'
              }`}
            >
            <div className="flex justify-between items-start mb-4">
               <h3 className={`font-medium text-lg ${habit.completedToday ? 'text-text/70' : 'text-text'}`}>
                 {habit.title}
               </h3>
               <div className={`flex items-center gap-1 text-sm font-mono ${habit.streak > 0 ? 'text-primary' : 'text-text/70'}`}>
                 <Flame size={14} className={habit.streak > 0 ? 'fill-orange-500' : ''} />
                 {habit.streak}
               </div>
            </div>

            <button
              onClick={() => handleToggle(habit.id)}
              disabled={isPending}
              className={`w-full py-3 sm:py-3.5 rounded-lg flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 min-h-[44px] text-sm sm:text-base ${
                habit.completedToday
                  ? 'bg-primary/10 text-primary hover:bg-primary/20'
                  : 'bg-surface text-text/80 hover:bg-surface/70 hover:text-text'
              }`}
            >
              {habit.completedToday ? (
                <>
                  <Check size={18} /> Completed
                </>
              ) : (
                "Mark Complete"
              )}
            </button>
          </motion.div>
          );
          })}
        
        {/* Add Habit Card */}
        <form onSubmit={handleAdd} className="p-4 sm:p-5 rounded-xl border border-surface/50 border-dashed bg-surface/30 flex flex-col justify-center items-center hover:bg-surface/50 transition-colors min-h-[120px]">
          <input
            type="text"
            placeholder="New Habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="bg-transparent text-center border-b border-surface/50 focus:border-primary outline-none w-full text-text placeholder-text/50 mb-3 sm:mb-4 pb-2 text-sm sm:text-base min-h-[44px]"
          />
          <button type="submit" disabled={!newHabit} className="p-2.5 sm:p-3 rounded-full bg-surface text-text/70 hover:bg-primary hover:text-white transition-all disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
            <Plus size={20} />
          </button>
        </form>
        </div>
      )}
    </div>
  );
};
