import { AppState } from './types';

export const INITIAL_STATE: AppState = {
  user: {
    name: 'Engineer',
    xp: 0,
    level: 1,
  },
  habits: [
    { id: 'h1', title: 'Deep Work (2h)', streak: 3, completedToday: false, frequency: 'daily' },
    { id: 'h2', title: 'Read Documentation', streak: 12, completedToday: true, frequency: 'daily' },
    { id: 'h3', title: 'Zero Inbox', streak: 0, completedToday: false, frequency: 'daily' },
  ],
  tasks: [
    { id: 't1', title: 'Refactor auth module', completed: false, type: 'my_day', createdAt: Date.now() },
    { id: 't2', title: 'Review PR #402', completed: true, type: 'my_day', createdAt: Date.now() },
    { id: 't3', title: 'Update dependencies', completed: false, type: 'backlog', createdAt: Date.now() },
  ],
  focusSessions: [],
  journalEntries: [],
};

export const LEVELS = [
  0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500
];

export const QUOTES = [
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
  "First, solve the problem. Then, write the code.",
  "Clean code always looks like it was written by someone who cares.",
  "Optimism is an occupational hazard of programming: feedback is the treatment."
];