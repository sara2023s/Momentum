export interface User {
  name: string;
  xp: number;
  level: number;
}

export interface Habit {
  id: string;
  title: string;
  streak: number;
  completedToday: boolean;
  frequency: 'daily';
  category?: string | null;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  type: 'my_day' | 'backlog' | 'tomorrow';
  createdAt: number;
  dueDate?: number;
}

export interface FocusSession {
  id: string;
  duration: number; // minutes
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  rating: number;
  gratitude: string[];
  notes: string;
}

export interface AppState {
  user: User;
  habits: Habit[];
  tasks: Task[];
  focusSessions: FocusSession[];
  journalEntries: JournalEntry[];
}

export type AppContextType = AppState & {
  addHabit: (title: string) => void;
  toggleHabit: (id: string) => void;
  addTask: (title: string, type: 'my_day' | 'backlog' | 'tomorrow') => void;
  toggleTask: (id: string) => void;
  moveTask: (id: string, target: 'my_day' | 'backlog' | 'tomorrow') => void;
  deleteTask: (id: string) => void;
  addFocusSession: (duration: number) => void;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  resetDay: () => void;
};