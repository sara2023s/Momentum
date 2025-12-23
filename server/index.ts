import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as habitsActions from '../actions/habits';
import * as tasksActions from '../actions/tasks';
import * as focusActions from '../actions/focus';
import * as retroActions from '../actions/dailyRetro';
import * as userActions from '../actions/user';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Habits routes
app.get('/api/habits', async (req, res) => {
  try {
    const habits = await habitsActions.getHabits();
    res.json(habits);
  } catch (error) {
    console.error('Error in /api/habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits', details: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/habits', async (req, res) => {
  try {
    const { title, category } = req.body;
    const habit = await habitsActions.createHabit(title, category);
    res.json(habit);
  } catch (error) {
    console.error('Error in POST /api/habits:', error);
    res.status(500).json({ error: 'Failed to create habit', details: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/habits/:id/toggle', async (req, res) => {
  try {
    await habitsActions.toggleHabit(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle habit' });
  }
});

app.delete('/api/habits/:id', async (req, res) => {
  try {
    await habitsActions.deleteHabit(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});

// Tasks routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await tasksActions.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', async (req, res) => {
  try {
    const { title, type, dueDate } = req.body;
    const task = await tasksActions.createTask(title, type, dueDate ? new Date(dueDate) : undefined);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.post('/api/tasks/:id/toggle', async (req, res) => {
  try {
    const task = await tasksActions.toggleTask(req.params.id);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle task' });
  }
});

app.post('/api/tasks/:id/move', async (req, res) => {
  try {
    const { type } = req.body;
    const task = await tasksActions.moveTask(req.params.id, type);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: 'Failed to move task' });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    await tasksActions.deleteTask(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Focus routes
app.get('/api/focus', async (req, res) => {
  try {
    const sessions = await focusActions.getFocusSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch focus sessions' });
  }
});

app.post('/api/focus', async (req, res) => {
  try {
    const { duration } = req.body;
    const session = await focusActions.createFocusSession(duration);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create focus session' });
  }
});

app.get('/api/focus/today', async (req, res) => {
  try {
    const minutes = await focusActions.getTodayFocusMinutes();
    res.json({ minutes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today focus' });
  }
});

// Retro routes
app.get('/api/retro', async (req, res) => {
  try {
    const retros = await retroActions.getDailyRetros();
    res.json(retros);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch retros' });
  }
});

app.post('/api/retro', async (req, res) => {
  try {
    const retro = await retroActions.createDailyRetro(req.body);
    res.json(retro);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create retro' });
  }
});

app.get('/api/retro/today', async (req, res) => {
  try {
    const retro = await retroActions.getTodayRetro();
    res.json(retro);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch today retro' });
  }
});

// User routes
app.get('/api/user', async (req, res) => {
  try {
    const user = await userActions.getUser();
    res.json(user);
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ error: 'Failed to fetch user', details: error instanceof Error ? error.message : String(error) });
  }
});

app.post('/api/user/xp', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await userActions.addXP(amount);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

