import React, { useState, useEffect, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, ArrowRight, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { getTasks, createTask, toggleTask, moveTask, deleteTask } from '../actions/tasks';
import { getTaskCompletionsForHeatmap } from '../actions/visualizations';
import { addXP } from '../actions/user';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import { ContributionHeatmap } from './viz/ContributionHeatmap';
import type { Task } from '../types';

export const Tasks: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'my_day' | 'backlog'>('my_day');
  const [newTask, setNewTask] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const tempToRealIdMap = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!authUser) return;
    
    const fetchTasks = async () => {
      try {
        const [tasksData, heatmapDataResult] = await Promise.all([
          getTasks(authUser.id),
          getTaskCompletionsForHeatmap(authUser.id)
        ]);
        setTasks(tasksData);
        setHeatmapData(heatmapDataResult);
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [authUser]);

  const filteredTasks = tasks.filter(t => t.type === activeTab);
  
  // Sorting: Incomplete first, then by creation date
  filteredTasks.sort((a, b) => {
    if (a.completed === b.completed) return b.createdAt - a.createdAt;
    return a.completed ? 1 : -1;
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const title = newTask.trim();
    setNewTask('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      title,
      completed: false,
      type: activeTab,
      createdAt: Date.now(),
    };
    setTasks((prev) => [...prev, optimisticTask]);

    startTransition(async () => {
      if (!authUser) return;
      try {
        const task = await createTask(authUser.id, title, activeTab);
        // Map temp ID to real ID so we can maintain the same key
        tempToRealIdMap.current.set(tempId, task.id);
        setTasks((prev) => prev.map((t) => (t.id === tempId ? task : t)));
        // Clean up the mapping after animation completes
        setTimeout(() => tempToRealIdMap.current.delete(tempId), 500);
      } catch (error) {
        console.error('Failed to create task:', error);
        setTasks((prev) => prev.filter((t) => t.id !== tempId));
        tempToRealIdMap.current.delete(tempId);
      }
    });
  };

  const handleToggle = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    startTransition(async () => {
      if (!authUser) return;
      const wasCompleted = task.completed;
      try {
        const updated = await toggleTask(taskId);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        
        // Add XP if task was just completed (not uncompleted)
        if (!wasCompleted && updated.completed) {
          try {
            await addXP(authUser.id, 5);
            await refreshUser();
          } catch (error) {
            console.error('Failed to add XP:', error);
          }
        }
      } catch (error) {
        console.error('Failed to toggle task:', error);
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? task : t))
        );
      }
    });
  };

  const handleMove = async (taskId: string, targetType: 'my_day' | 'backlog') => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, type: targetType } : t))
    );

    startTransition(async () => {
      try {
        const updated = await moveTask(taskId, targetType);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      } catch (error) {
        console.error('Failed to move task:', error);
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? task : t))
        );
      }
    });
  };

  const handleDelete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    startTransition(async () => {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
        // Revert on error
        setTasks((prev) => [...prev, task]);
      }
    });
  };

  const handleMigrate = () => {
    const incomplete = tasks.filter(t => t.type === 'my_day' && !t.completed);
    incomplete.forEach(t => handleMove(t.id, 'backlog'));
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Task Command</h2>
          <p className="text-text/70 text-xs sm:text-sm">Capture, prioritize, and execute.</p>
        </div>
        
        <div className="flex p-1 bg-surface rounded-lg border border-surface/50 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('my_day')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[44px] ${activeTab === 'my_day' ? 'bg-surface/70 text-text shadow-sm' : 'text-text/60 hover:text-text'}`}
          >
            My Day
          </button>
          <button 
            onClick={() => setActiveTab('backlog')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[44px] ${activeTab === 'backlog' ? 'bg-surface/70 text-text shadow-sm' : 'text-text/60 hover:text-text'}`}
          >
            Backlog
          </button>
        </div>
      </div>

      {activeTab === 'my_day' && (
        <div className="flex justify-end">
           <button onClick={handleMigrate} className="text-xs text-text/60 hover:text-primary flex items-center gap-1 transition-colors">
              Migrate unfinished to Backlog <ArrowRight size={12} />
           </button>
        </div>
      )}

      {/* Contribution Heatmap */}
      {!loading && (
        <ContributionHeatmap 
          data={heatmapData} 
          title="Task Completion Flow" 
          color="#3B82F6"
        />
      )}

      <div className="flex-1 bg-surface/50 border border-surface/50 rounded-xl overflow-hidden flex flex-col">
        <form onSubmit={handleAdd} className="p-3 sm:p-4 border-b border-surface/50 bg-surface flex items-center gap-2 sm:gap-3">
           <Plus size={18} className="sm:w-5 sm:h-5 text-text/60 flex-shrink-0" />
           <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={activeTab === 'my_day' ? "What needs to be done today?" : "Add to your backlog..."}
              className="bg-transparent flex-1 outline-none text-text placeholder-text/50 text-sm sm:text-base min-h-[44px]"
              disabled={isPending}
           />
        </form>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-text/50 gap-2">
              <Calendar size={48} strokeWidth={1} />
              <p>Loading tasks...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="h-full flex flex-col items-center justify-center text-text/50 gap-2">
                  <Calendar size={48} strokeWidth={1} />
                  <p>No tasks found.</p>
                </motion.div>
              )}
              
              {filteredTasks.map(task => {
                // Find if this real ID was mapped from a temp ID
                const tempId = Array.from(tempToRealIdMap.current.entries()).find(([_, realId]) => realId === task.id)?.[0];
                // Use temp ID as key if it exists, otherwise use real ID - this maintains continuity
                const stableKey = tempId || task.id;
                const isNewItem = !task.id.startsWith('temp-') && !tempId;
                
                return (
                <motion.div 
                  key={stableKey}
                  layoutId={stableKey}
                  layout
                  initial={isNewItem ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors"
                >
                  <button 
                    onClick={() => handleToggle(task.id)}
                    disabled={isPending}
                    className={`transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${task.completed ? 'text-emerald-500' : 'text-text/50 hover:text-text/70'}`}
                  >
                    {task.completed ? <CheckCircle2 size={22} className="fill-emerald-500/10" /> : <Circle size={22} />}
                  </button>
                  
                  <span className={`flex-1 text-sm sm:text-base ${task.completed ? 'text-text/60 line-through' : 'text-text'}`}>
                    {task.title}
                  </span>

                  <div className="opacity-0 group-hover:opacity-100 sm:opacity-100 flex items-center gap-1 sm:gap-2">
                    <button 
                      onClick={() => handleMove(task.id, activeTab === 'my_day' ? 'backlog' : 'my_day')}
                      disabled={isPending}
                      className="p-2 text-text/60 hover:text-primary hover:bg-surface/70 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title={activeTab === 'my_day' ? "Move to Backlog" : "Move to My Day"}
                    >
                      <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      disabled={isPending}
                      className="p-2 text-text/60 hover:text-red-400 hover:bg-surface/70 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
