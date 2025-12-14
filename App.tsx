import React, { createContext, useContext, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, AppContextType, Habit, Task, JournalEntry, FocusSession } from './types';
import { INITIAL_STATE, LEVELS } from './constants';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Habits } from './components/Habits';
import { Tasks } from './components/Tasks';
import { Focus } from './components/Focus';
import { Journal } from './components/Journal';

// Context Definition
const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  // Load initial state from local storage or fallback
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('momentum_app_state');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  // Persist state on change
  useEffect(() => {
    localStorage.setItem('momentum_app_state', JSON.stringify(state));
  }, [state]);

  // Actions
  const addXp = (amount: number) => {
    setState(prev => {
      const newXp = prev.user.xp + amount;
      // Simple level calculation
      let newLevel = prev.user.level;
      if (LEVELS[newLevel] && newXp >= LEVELS[newLevel]) {
        newLevel++;
        // Could trigger level up animation state here
      }
      return {
        ...prev,
        user: { ...prev.user, xp: newXp, level: newLevel }
      };
    });
  };

  const addHabit = (title: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title,
      streak: 0,
      completedToday: false,
      frequency: 'daily'
    };
    setState(prev => ({ ...prev, habits: [...prev.habits, newHabit] }));
  };

  const toggleHabit = (id: string) => {
    setState(prev => {
      const habit = prev.habits.find(h => h.id === id);
      if (!habit) return prev;

      if (!habit.completedToday) {
        addXp(10); // Reward
        return {
          ...prev,
          habits: prev.habits.map(h => 
            h.id === id ? { ...h, completedToday: true, streak: h.streak + 1 } : h
          )
        };
      } else {
        // Toggle off (optional, remove XP logic usually prevents abuse, but for MVP keep simple)
        return {
          ...prev,
          habits: prev.habits.map(h => 
            h.id === id ? { ...h, completedToday: false, streak: Math.max(0, h.streak - 1) } : h
          )
        };
      }
    });
  };

  const addTask = (title: string, type: 'my_day' | 'backlog') => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      type,
      createdAt: Date.now()
    };
    setState(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
  };

  const toggleTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const moveTask = (id: string, target: 'my_day' | 'backlog') => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === id ? { ...t, type: target } : t)
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id)
    }));
  };

  const addFocusSession = (duration: number) => {
    const newSession: FocusSession = {
      id: Date.now().toString(),
      duration,
      timestamp: Date.now()
    };
    setState(prev => ({ ...prev, focusSessions: [...prev.focusSessions, newSession] }));
    addXp(duration * 2); // 2 XP per minute focused
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: Date.now().toString() };
    setState(prev => ({ ...prev, journalEntries: [...prev.journalEntries, newEntry] }));
    addXp(50);
  };

  // Reset daily stats if it's a new day (Primitive check)
  useEffect(() => {
    const lastLogin = localStorage.getItem('last_login_date');
    const today = new Date().toLocaleDateString();
    
    if (lastLogin !== today) {
      // Reset daily habit completion
      setState(prev => ({
        ...prev,
        habits: prev.habits.map(h => {
           // If habit wasn't completed yesterday, reset streak? 
           // Complex streak logic omitted for MVP simplicity, just reset 'completedToday'
           return { ...h, completedToday: false };
        })
      }));
      localStorage.setItem('last_login_date', today);
    }
  }, []);

  const resetDay = () => {
    // Manually trigger day reset for testing
    setState(prev => ({
       ...prev,
       habits: prev.habits.map(h => ({ ...h, completedToday: false }))
    }));
  };

  const contextValue: AppContextType = {
    ...state,
    addHabit,
    toggleHabit,
    addTask,
    toggleTask,
    moveTask,
    deleteTask,
    addFocusSession,
    addJournalEntry,
    resetDay
  };

  return (
    <AppContext.Provider value={contextValue}>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/focus" element={<Focus />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;