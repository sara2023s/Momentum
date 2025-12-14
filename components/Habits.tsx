import React, { useState } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { Plus, Flame, Check } from 'lucide-react';

export const Habits: React.FC = () => {
  const { habits, addHabit, toggleHabit } = useApp();
  const [newHabit, setNewHabit] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabit.trim()) {
      addHabit(newHabit);
      setNewHabit('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Habit Engine</h2>
          <p className="text-zinc-400 text-sm">Consistency is the key to mastery.</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-violet-500">{habits.filter(h => h.completedToday).length}/{habits.length}</div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {habits.map((habit) => (
          <motion.div
            key={habit.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-xl border transition-all duration-300 group ${
              habit.completedToday 
                ? 'bg-zinc-900/50 border-violet-500/30' 
                : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
               <h3 className={`font-medium text-lg ${habit.completedToday ? 'text-zinc-400' : 'text-zinc-100'}`}>
                 {habit.title}
               </h3>
               <div className={`flex items-center gap-1 text-sm font-mono ${habit.streak > 0 ? 'text-orange-500' : 'text-zinc-600'}`}>
                 <Flame size={14} className={habit.streak > 0 ? 'fill-orange-500' : ''} />
                 {habit.streak}
               </div>
            </div>

            <button
              onClick={() => toggleHabit(habit.id)}
              className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
                habit.completedToday
                  ? 'bg-violet-600/10 text-violet-400 hover:bg-violet-600/20'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
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
        ))}
        
        {/* Add Habit Card */}
        <form onSubmit={handleAdd} className="p-5 rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 flex flex-col justify-center items-center hover:bg-zinc-900/50 transition-colors">
          <input
            type="text"
            placeholder="New Habit..."
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="bg-transparent text-center border-b border-zinc-700 focus:border-violet-500 outline-none w-full text-zinc-100 placeholder-zinc-600 mb-4 pb-2"
          />
          <button type="submit" disabled={!newHabit} className="p-2 rounded-full bg-zinc-800 text-zinc-400 hover:bg-violet-600 hover:text-white transition-all disabled:opacity-50">
            <Plus size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};