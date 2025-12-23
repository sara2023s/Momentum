import React, { useState, useEffect, useTransition, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, ArrowRight, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { getTasks, createTask, toggleTask, moveTask, deleteTask, updateTaskDueDate } from '../actions/tasks';
import { getTaskCompletionsForHeatmap } from '../actions/visualizations';
import { addXP } from '../actions/user';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../App';
import { ContributionHeatmap } from './viz/ContributionHeatmap';
import type { Task } from '../types';

const TaskDatePicker: React.FC<{
  task: Task;
  onSelectToday: () => void;
  onSelectTomorrow: () => void;
  onSelectCustom: (date: Date) => void;
  onRemove: () => void;
  onCancel: () => void;
}> = ({ task, onSelectToday, onSelectTomorrow, onSelectCustom, onRemove, onCancel }) => {
  const [customDate, setCustomDate] = useState(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );

  const getCurrentSelection = (): 'today' | 'tomorrow' | 'custom' | 'none' => {
    if (!task.dueDate) return 'none';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return 'custom';
  };

  const currentSelection = getCurrentSelection();

  return (
    <div className="date-picker-container absolute top-full left-0 right-0 mt-1 p-3 bg-surface border border-surface/50 rounded-lg z-10 shadow-lg">
      <div className="flex flex-col gap-3">
        <label className="text-xs text-text/70 font-medium">Due Date</label>
        
        <div className="flex gap-2">
          <button
            onClick={onSelectToday}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              currentSelection === 'today'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
            }`}
          >
            Today
          </button>
          <button
            onClick={onSelectTomorrow}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              currentSelection === 'tomorrow'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
            }`}
          >
            Tomorrow
          </button>
          <button
            onClick={() => {
              if (customDate) {
                onSelectCustom(new Date(customDate));
              }
            }}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
              currentSelection === 'custom'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
            }`}
          >
            Custom
          </button>
        </div>
        
        <input
          type="date"
          value={customDate}
          onChange={(e) => {
            setCustomDate(e.target.value);
            if (e.target.value) {
              onSelectCustom(new Date(e.target.value));
            }
          }}
          className="w-full bg-obsidian border border-surface/50 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        
        <div className="flex gap-2">
          <button
            onClick={onRemove}
            className="flex-1 px-3 py-1.5 text-xs bg-surface hover:bg-surface/70 rounded text-text/70 hover:text-text transition-colors"
          >
            Remove Date
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-1.5 text-xs bg-surface hover:bg-surface/70 rounded text-text/70 hover:text-text transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const Tasks: React.FC = () => {
  const { user: authUser } = useAuth();
  const { refreshUser } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'my_day' | 'backlog' | 'tomorrow' | 'scheduled'>('my_day');
  const [editingDueDateId, setEditingDueDateId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateOption, setSelectedDateOption] = useState<'none' | 'today' | 'tomorrow' | 'custom'>('none');
  const [customDate, setCustomDate] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number }[]>([]);
  const tempToRealIdMap = useRef<Map<string, string>>(new Map());
  const completedTodayMap = useRef<Map<string, number>>(new Map()); // Track when tasks were completed (timestamp)
  
  // Load completed tasks from localStorage
  const loadCompletedToday = () => {
    try {
      const stored = localStorage.getItem('tasksCompletedToday');
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.getTime();
        
        // Only keep entries from today
        const filtered: Record<string, number> = {};
        for (const [taskId, completedAt] of Object.entries(data)) {
          if (completedAt >= todayStart) {
            filtered[taskId] = completedAt;
          }
        }
        
        completedTodayMap.current = new Map(Object.entries(filtered).map(([k, v]) => [k, v]));
        // Save back to localStorage to clean up old entries
        localStorage.setItem('tasksCompletedToday', JSON.stringify(filtered));
      }
    } catch (error) {
      console.error('Failed to load completed tasks from localStorage:', error);
    }
  };
  
  // Save completed tasks to localStorage
  const saveCompletedToday = () => {
    try {
      const data = Object.fromEntries(completedTodayMap.current);
      localStorage.setItem('tasksCompletedToday', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save completed tasks to localStorage:', error);
    }
  };

  useEffect(() => {
    if (!authUser) return;
    
    // Load completed tasks from localStorage on mount
    loadCompletedToday();
    
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

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (editingDueDateId && !target.closest('.date-picker-container')) {
        setEditingDueDateId(null);
      }
      if (showDatePicker && !target.closest('.create-date-picker-container')) {
        setShowDatePicker(false);
      }
    };

    if (editingDueDateId || showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingDueDateId, showDatePicker]);

  // Filter tasks by tab
  let filteredTasks: Task[];
  
  if (activeTab === 'scheduled') {
    // For "Scheduled" tab, show all tasks with due dates
    filteredTasks = tasks.filter(t => t.dueDate !== undefined);
  } else {
    filteredTasks = tasks.filter(t => t.type === activeTab);
  }
  
  // For "My Day" tab, filter out completed tasks that weren't completed today
  if (activeTab === 'my_day') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.getTime();
    
    filteredTasks = filteredTasks.filter(t => {
      // Show all incomplete tasks
      if (!t.completed) return true;
      
      // For completed tasks, only show if completed today
      const completedAt = completedTodayMap.current.get(t.id);
      if (completedAt && completedAt >= todayStart) {
        return true;
      }
      
      // If we don't have completion date tracked, assume it's from a previous day and hide it
      return false;
    });
  }
  
  // Sorting: 
  // For scheduled tab: by due date (earliest first), then incomplete first
  // For other tabs: incomplete first, then by creation date
  filteredTasks.sort((a, b) => {
    if (activeTab === 'scheduled') {
      // Sort by due date first
      if (a.dueDate && b.dueDate) {
        if (a.dueDate !== b.dueDate) {
          return a.dueDate - b.dueDate;
        }
      } else if (a.dueDate) return -1;
      else if (b.dueDate) return 1;
      // Then by completion status
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }
      return b.createdAt - a.createdAt;
    } else {
      // Incomplete first, then by creation date
      if (a.completed === b.completed) return b.createdAt - a.createdAt;
      return a.completed ? 1 : -1;
    }
  });

  const getSelectedDueDate = (): Date | undefined => {
    if (selectedDateOption === 'none') return undefined;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDateOption === 'today') {
      return today;
    } else if (selectedDateOption === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } else if (selectedDateOption === 'custom' && customDate) {
      return new Date(customDate);
    }
    
    return undefined;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const title = newTask.trim();
    const dueDate = getSelectedDueDate();
    
    // Reset form
    setNewTask('');
    setShowDatePicker(false);
    setSelectedDateOption('none');
    setCustomDate('');

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask: Task = {
      id: tempId,
      title,
      completed: false,
      type: activeTab === 'scheduled' ? 'my_day' : activeTab,
      createdAt: Date.now(),
      dueDate: dueDate ? dueDate.getTime() : undefined,
    };
    setTasks((prev) => [...prev, optimisticTask]);

    startTransition(async () => {
      if (!authUser) return;
      try {
        const task = await createTask(authUser.id, title, activeTab === 'scheduled' ? 'my_day' : activeTab, dueDate);
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

    const wasCompleted = task.completed;
    const now = Date.now();

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );

    // Track completion time if task is being completed
    if (!wasCompleted) {
      completedTodayMap.current.set(taskId, now);
      saveCompletedToday();
    } else {
      // If uncompleting, remove from today's completed map
      completedTodayMap.current.delete(taskId);
      saveCompletedToday();
    }

    startTransition(async () => {
      if (!authUser) return;
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
        // Revert completion tracking
        if (!wasCompleted) {
          completedTodayMap.current.delete(taskId);
          saveCompletedToday();
        } else {
          completedTodayMap.current.set(taskId, now);
          saveCompletedToday();
        }
      }
    });
  };

  const handleMove = async (taskId: string, targetType: 'my_day' | 'backlog' | 'tomorrow') => {
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
    incomplete.forEach(t => handleMove(t.id, 'tomorrow'));
  };

  const handleUpdateDueDate = async (taskId: string, dueDate: Date | null) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dueDate: dueDate ? dueDate.getTime() : undefined } : t))
    );

    startTransition(async () => {
      try {
        const updated = await updateTaskDueDate(taskId, dueDate);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        setEditingDueDateId(null);
      } catch (error) {
        console.error('Failed to update due date:', error);
        // Revert on error
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? task : t))
        );
      }
    });
  };

  const formatDueDate = (dueDate: number) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffDays = Math.floor((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
  };

  return (
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Task Command</h2>
          <p className="text-text/60 text-xs sm:text-sm">Capture, prioritize, and execute.</p>
        </div>
        
        <div className="flex p-1 bg-surface rounded-lg border border-surface/50 w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('my_day')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[44px] ${activeTab === 'my_day' ? 'bg-surface/70 text-text shadow-sm' : 'text-text/60 hover:text-text'}`}
          >
            My Day
          </button>
          <button 
            onClick={() => setActiveTab('tomorrow')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[44px] ${activeTab === 'tomorrow' ? 'bg-surface/70 text-text shadow-sm' : 'text-text/60 hover:text-text'}`}
          >
            Tomorrow
          </button>
          <button 
            onClick={() => setActiveTab('scheduled')}
            className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-all min-h-[44px] ${activeTab === 'scheduled' ? 'bg-surface/70 text-text shadow-sm' : 'text-text/60 hover:text-text'}`}
          >
            Scheduled
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
              Migrate unfinished to Tomorrow <ArrowRight size={12} />
           </button>
        </div>
      )}

      {/* Contribution Heatmap */}
      {!loading && (
        <ContributionHeatmap 
          data={heatmapData} 
          title="Task Completion Flow" 
          color="#10B981"
        />
      )}

      <div className="flex-1 bg-surface/50 border border-surface/50 rounded-xl overflow-hidden flex flex-col">
        <form onSubmit={handleAdd} className="border-b border-surface/50 bg-surface">
          <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
            <Plus size={18} className="sm:w-5 sm:h-5 text-text/60 flex-shrink-0" />
            <input 
              type="text" 
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={activeTab === 'my_day' ? "What needs to be done today?" : activeTab === 'tomorrow' ? "What's planned for tomorrow?" : activeTab === 'scheduled' ? "Add a scheduled task..." : "Add to your backlog..."}
              className="bg-transparent flex-1 outline-none text-text placeholder-text-muted text-sm sm:text-base min-h-[44px]"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                selectedDateOption !== 'none' 
                  ? 'text-primary bg-primary/10' 
                  : 'text-text/60 hover:text-text hover:bg-surface/70'
              }`}
              title="Set due date"
            >
              <Calendar size={18} />
            </button>
          </div>
          
          {showDatePicker && (
            <div className="create-date-picker-container px-3 sm:px-4 pb-3 sm:pb-4 border-t border-surface/50 pt-3 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateOption('today');
                    setCustomDate('');
                  }}
                  className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    selectedDateOption === 'today'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateOption('tomorrow');
                    setCustomDate('');
                  }}
                  className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    selectedDateOption === 'tomorrow'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateOption('custom');
                    if (!customDate) {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setCustomDate(tomorrow.toISOString().split('T')[0]);
                    }
                  }}
                  className={`flex-1 px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    selectedDateOption === 'custom'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
                  }`}
                >
                  Custom
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDateOption('none');
                    setCustomDate('');
                  }}
                  className={`px-3 py-2 text-xs sm:text-sm rounded-lg transition-colors ${
                    selectedDateOption === 'none'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface/50 text-text/70 hover:text-text hover:bg-surface/70 border border-surface/50'
                  }`}
                  title="No date"
                >
                  ×
                </button>
              </div>
              
              {selectedDateOption === 'custom' && (
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full bg-obsidian border border-surface/50 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
            </div>
          )}
        </form>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-text/60 gap-2">
              <Calendar size={48} strokeWidth={1} />
              <p>Loading tasks...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 && (
                <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="h-full flex flex-col items-center justify-center text-text/60 gap-2">
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
                  className="group relative flex items-center gap-3 p-3 rounded-lg hover:bg-surface/50 transition-colors"
                >
                  <button 
                    onClick={() => handleToggle(task.id)}
                    disabled={isPending}
                    className={`transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center ${task.completed ? 'text-primary' : 'text-text/60 hover:text-text'}`}
                  >
                    {task.completed ? <CheckCircle2 size={22} className="fill-emerald-500/10" /> : <Circle size={22} />}
                  </button>
                  
                  <div className="flex-1 flex flex-col gap-1">
                    <span className={`text-sm sm:text-base ${task.completed ? 'text-text/60 line-through' : 'text-text'}`}>
                      {task.title}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs flex items-center gap-1 ${task.completed ? 'text-text/40' : new Date(task.dueDate).getTime() < Date.now() ? 'text-red-400' : 'text-text/60'}`}>
                        <Clock size={12} />
                        {formatDueDate(task.dueDate)}
                      </span>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 sm:opacity-100 flex items-center gap-1 sm:gap-2">
                    {activeTab !== 'scheduled' && (
                      <button 
                        onClick={() => {
                          let targetType: 'my_day' | 'backlog' | 'tomorrow';
                          if (activeTab === 'my_day') {
                            targetType = 'tomorrow';
                          } else if (activeTab === 'tomorrow') {
                            targetType = 'my_day';
                          } else {
                            targetType = 'my_day';
                          }
                          handleMove(task.id, targetType);
                        }}
                        disabled={isPending}
                        className="p-2 text-text/60 hover:text-primary hover:bg-surface/70 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title={activeTab === 'my_day' ? "Move to Tomorrow" : activeTab === 'tomorrow' ? "Move to My Day" : "Move to My Day"}
                      >
                        <ArrowRight size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if (editingDueDateId === task.id) {
                          setEditingDueDateId(null);
                        } else {
                          setEditingDueDateId(task.id);
                        }
                      }}
                      disabled={isPending}
                      className="p-2 text-text/60 hover:text-primary hover:bg-surface/70 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title={task.dueDate ? "Edit due date" : "Set due date"}
                    >
                      <Calendar size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      disabled={isPending}
                      className="p-2 text-text/60 hover:text-red-400 hover:bg-surface/70 rounded disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {editingDueDateId === task.id && (
                    <TaskDatePicker
                      task={task}
                      onSelectToday={() => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        handleUpdateDueDate(task.id, today);
                        setEditingDueDateId(null);
                      }}
                      onSelectTomorrow={() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow.setHours(0, 0, 0, 0);
                        handleUpdateDueDate(task.id, tomorrow);
                        setEditingDueDateId(null);
                      }}
                      onSelectCustom={(date: Date) => {
                        handleUpdateDueDate(task.id, date);
                        setEditingDueDateId(null);
                      }}
                      onRemove={() => {
                        handleUpdateDueDate(task.id, null);
                        setEditingDueDateId(null);
                      }}
                      onCancel={() => setEditingDueDateId(null)}
                    />
                  )}
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
