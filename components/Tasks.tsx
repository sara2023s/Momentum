import React, { useState } from 'react';
import { useApp } from '../App';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, ArrowRight, Trash2, CheckCircle2, Circle } from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks, addTask, toggleTask, moveTask, deleteTask } = useApp();
  const [activeTab, setActiveTab] = useState<'my_day' | 'backlog'>('my_day');
  const [newTask, setNewTask] = useState('');

  const filteredTasks = tasks.filter(t => t.type === activeTab);
  
  // Sorting: Incomplete first, then by creation date
  filteredTasks.sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt;
    return a.completed ? 1 : -1;
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTask.trim()) {
      addTask(newTask, activeTab);
      setNewTask('');
    }
  };

  const handleMigrate = () => {
    // Logic to move incomplete 'my_day' tasks to backlog or tomorrow?
    // For MVP, button moves all incomplete My Day tasks to Backlog
    const incomplete = tasks.filter(t => t.type === 'my_day' && !t.completed);
    incomplete.forEach(t => moveTask(t.id, 'backlog'));
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Task Command</h2>
          <p className="text-zinc-400 text-sm">Capture, prioritize, and execute.</p>
        </div>
        
        <div className="flex p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <button 
            onClick={() => setActiveTab('my_day')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'my_day' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            My Day
          </button>
          <button 
            onClick={() => setActiveTab('backlog')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'backlog' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Backlog
          </button>
        </div>
      </div>

      {activeTab === 'my_day' && (
        <div className="flex justify-end">
           <button onClick={handleMigrate} className="text-xs text-zinc-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
              Migrate unfinished to Backlog <ArrowRight size={12} />
           </button>
        </div>
      )}

      <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex flex-col">
        <form onSubmit={handleAdd} className="p-4 border-b border-zinc-800 bg-zinc-900 flex items-center gap-3">
           <Plus size={20} className="text-zinc-500" />
           <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={activeTab === 'my_day' ? "What needs to be done today?" : "Add to your backlog..."}
              className="bg-transparent flex-1 outline-none text-zinc-200 placeholder-zinc-600"
           />
        </form>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                <Calendar size={48} strokeWidth={1} />
                <p>No tasks found.</p>
              </motion.div>
            )}
            
            {filteredTasks.map(task => (
              <motion.div 
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <button 
                  onClick={() => toggleTask(task.id)}
                  className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
                >
                  {task.completed ? <CheckCircle2 size={22} className="fill-emerald-500/10" /> : <Circle size={22} />}
                </button>
                
                <span className={`flex-1 ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                  {task.title}
                </span>

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                  <button 
                    onClick={() => moveTask(task.id, activeTab === 'my_day' ? 'backlog' : 'my_day')}
                    className="p-1.5 text-zinc-500 hover:text-violet-400 hover:bg-zinc-700 rounded"
                    title={activeTab === 'my_day' ? "Move to Backlog" : "Move to My Day"}
                  >
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};