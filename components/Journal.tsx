import React, { useState } from 'react';
import { useApp } from '../App';
import { motion } from 'framer-motion';
import { Save, Star } from 'lucide-react';

export const Journal: React.FC = () => {
  const { journalEntries, addJournalEntry } = useApp();
  const [rating, setRating] = useState(5);
  const [gratitude1, setGratitude1] = useState('');
  const [gratitude2, setGratitude2] = useState('');
  const [gratitude3, setGratitude3] = useState('');
  const [notes, setNotes] = useState('');
  const [submittedToday, setSubmittedToday] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString();
    
    // Simple check to prevent multi-submit for MVP demo
    if (journalEntries.some(j => j.date === today)) {
        alert("You've already journaled today!");
        return;
    }

    addJournalEntry({
      date: today,
      rating,
      gratitude: [gratitude1, gratitude2, gratitude3].filter(Boolean),
      notes
    });
    setSubmittedToday(true);
    setGratitude1('');
    setGratitude2('');
    setGratitude3('');
    setNotes('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Input Form */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Daily Retrospective</h2>
          <p className="text-zinc-400 text-sm">Reflect, Learn, Optimize.</p>
        </div>

        {!submittedToday ? (
          <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">How was your day? ({rating}/10)</label>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
              />
              <div className="flex justify-between text-xs text-zinc-600 font-mono">
                <span>Terrible</span>
                <span>Average</span>
                <span>Excellent</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Gratitude (Three Good Things)</label>
              <input type="text" placeholder="1." value={gratitude1} onChange={e => setGratitude1(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" required />
              <input type="text" placeholder="2." value={gratitude2} onChange={e => setGratitude2(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" />
              <input type="text" placeholder="3." value={gratitude3} onChange={e => setGratitude3(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Notes & Reflections</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="What did I learn? What can I improve tomorrow?"
                className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm focus:border-violet-500 outline-none resize-none"
              />
            </div>

            <button type="submit" className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <Save size={18} /> End Day & Save
            </button>
          </form>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-4">
             <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <Star size={32} fill="currentColor" />
             </div>
             <h3 className="text-xl font-bold text-white">Entry Saved!</h3>
             <p className="text-zinc-400">Great job today. +50 XP gained.</p>
             <button onClick={() => setSubmittedToday(false)} className="text-violet-400 text-sm hover:underline">Add another note?</button>
          </div>
        )}
      </div>

      {/* History Feed */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-zinc-200">History</h3>
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          {journalEntries.length === 0 && (
            <div className="text-zinc-500 italic text-sm">No journal entries yet. Start today!</div>
          )}
          {[...journalEntries].reverse().map(entry => (
            <motion.div 
              key={entry.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="text-violet-400 font-medium font-mono text-sm">{entry.date}</span>
                <span className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                  {entry.rating}/10 <Star size={12} fill="currentColor" />
                </span>
              </div>
              
              {entry.gratitude.length > 0 && (
                <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1 bg-zinc-950/50 p-3 rounded-lg">
                  {entry.gratitude.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              )}
              
              {entry.notes && (
                <p className="text-sm text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-3">
                  {entry.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};