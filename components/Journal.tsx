import React, { useState, useEffect, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Save, Star } from 'lucide-react';
import { getDailyRetros, createDailyRetro } from '../actions/dailyRetro';
import { addXP } from '../actions/user';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import type { JournalEntry } from '../types';

export const Journal: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [rating, setRating] = useState(5);
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authUser) return;
    
    const fetchRetros = async () => {
      try {
        const data = await getDailyRetros(authUser.id);
        setJournalEntries(data);
        
        // Check if already submitted today
        const today = new Date().toLocaleDateString();
        const todayEntry = data.find((e) => e.date === today);
        if (todayEntry) {
          setSubmittedToday(true);
        }
      } catch (error) {
        console.error('Failed to fetch journal entries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRetros();
  }, [authUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString();
    
    // Check if already submitted today
    if (journalEntries.some(j => j.date === today)) {
      alert("You've already journaled today!");
      return;
    }

    const entryData = {
      rating,
      goodThing1: gratitude1.trim() || undefined,
      goodThing2: gratitude2.trim() || undefined,
      goodThing3: gratitude3.trim() || undefined,
      notes: notes.trim() || undefined,
    };

    startTransition(async () => {
      if (!authUser) return;
      try {
        const newEntry = await createDailyRetro(authUser.id, entryData);
        setJournalEntries((prev) => [newEntry, ...prev]);
        setSubmittedToday(true);
        setGratitude1('');
        setGratitude2('');
        setGratitude3('');
        setNotes('');
        
        // Add XP for completing journal entry
        try {
          await addXP(authUser.id, 50);
          await refreshUser();
        } catch (error) {
          console.error('Failed to add XP:', error);
        }
      } catch (error) {
        console.error('Failed to create journal entry:', error);
        alert('Failed to save journal entry. Please try again.');
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 h-full">
      {/* Input Form */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Daily Retrospective</h2>
          <p className="text-text/70 text-xs sm:text-sm">Reflect, Learn, Optimize.</p>
        </div>

        {!submittedToday ? (
          <form onSubmit={handleSubmit} className="bg-surface border border-surface/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">How was your day? ({rating}/10)</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full h-2 bg-surface/70 rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={isPending}
              />
              <div className="flex justify-between text-xs text-text/70 font-mono">
                <span>Terrible</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-text">Gratitude (Three Good Things)</label>
              <input 
                type="text" 
                placeholder="1." 
                value={gratitude1} 
                onChange={e => setGratitude1(e.target.value)} 
                className="w-full bg-obsidian border border-surface/50 rounded-lg p-3 sm:p-3.5 text-sm sm:text-base text-text focus:border-primary outline-none min-h-[44px]" 
                disabled={isPending}
                required 
              />
              <input 
                type="text" 
                placeholder="2." 
                value={gratitude2} 
                onChange={e => setGratitude2(e.target.value)} 
                className="w-full bg-obsidian border border-surface/50 rounded-lg p-3 sm:p-3.5 text-sm sm:text-base text-text focus:border-primary outline-none min-h-[44px]" 
                disabled={isPending}
              />
              <input 
                type="text" 
                placeholder="3." 
                value={gratitude3} 
                onChange={e => setGratitude3(e.target.value)} 
                className="w-full bg-obsidian border border-surface/50 rounded-lg p-3 sm:p-3.5 text-sm sm:text-base text-text focus:border-primary outline-none min-h-[44px]" 
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Notes & Reflections</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What did I learn? What can I improve tomorrow?"
                className="w-full h-32 sm:h-36 bg-obsidian border border-surface/50 rounded-lg p-3 sm:p-3.5 text-sm sm:text-base text-text focus:border-primary outline-none resize-none"
                disabled={isPending}
              />
            </div>

            <button 
              type="submit" 
              disabled={isPending}
              className="w-full py-3.5 sm:py-3 bg-primary hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] text-sm sm:text-base"
            >
              <Save size={18} /> {isPending ? 'Saving...' : 'End Day & Save'}
            </button>
          </form>
        ) : (
          <div className="bg-surface border border-surface/50 rounded-2xl p-12 text-center space-y-4">
             <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
               <Star size={32} fill="currentColor" />
             </div>
             <h3 className="text-xl font-bold text-text">Entry Saved!</h3>
             <p className="text-text/70">Great job today. +50 XP gained.</p>
             <button onClick={() => setSubmittedToday(false)} className="text-primary text-sm hover:underline">Add another note?</button>
          </div>
        )}
      </div>

      {/* History Feed */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-bold text-text">History</h3>
        <div className="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-text/70 italic text-sm">Loading journal entries...</div>
          ) : journalEntries.length === 0 ? (
            <div className="text-text/70 italic text-sm">No journal entries yet. Start today!</div>
          ) : (
            [...journalEntries].reverse().map(entry => (
              <motion.div 
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface border border-surface/50 rounded-xl p-5 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <span className="text-primary font-medium font-mono text-sm">{entry.date}</span>
                  <span className="flex items-center gap-1 text-primary text-sm font-bold">
                    {entry.rating}/10 <Star size={12} fill="currentColor" />
                  </span>
                </div>
                
                {entry.gratitude.length > 0 && (
                  <ul className="text-sm text-text/70 list-disc list-inside space-y-1 bg-obsidian/50 p-3 rounded-lg">
                    {entry.gratitude.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                )}
                
                {entry.notes && (
                  <p className="text-sm text-text leading-relaxed border-l-2 border-surface/50 pl-3">
                    {entry.notes}
                  </p>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
