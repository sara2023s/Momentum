import { supabase } from '../lib/supabase';
import { createId } from '@paralleldrive/cuid2';

export async function getHabits(userId: string) {
  try {
    // Fetch habits with their logs for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: habits, error: habitsError } = await supabase
      .from('Habit')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (habitsError) {
      throw habitsError;
    }

    if (!habits) {
      return [];
    }

    // Fetch today's logs for all habits
    const habitIds = habits.map(h => h.id);
    const { data: logs, error: logsError } = await supabase
      .from('HabitLog')
      .select('*')
      .in('habitId', habitIds)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString());

    if (logsError) {
      throw logsError;
    }

    // Map habits with completion status
    return habits.map((habit) => {
      const todayLog = logs?.find(log => log.habitId === habit.id);
      return {
        id: habit.id,
        title: habit.title,
        streak: habit.streak || 0,
        completedToday: todayLog ? todayLog.completed : false,
        frequency: (habit.frequency || 'DAILY').toLowerCase() as 'daily',
        category: habit.category,
      };
    });
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw new Error('Failed to fetch habits');
  }
}

export async function createHabit(userId: string, title: string, category?: string) {
  try {
    const { data: habit, error } = await supabase
      .from('Habit')
      .insert({
        id: createId(),
        userId,
        title,
        category: category || null,
        frequency: 'DAILY',
        streak: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!habit) {
      throw new Error('Failed to create habit');
    }

    return {
      id: habit.id,
      title: habit.title,
      streak: habit.streak || 0,
      completedToday: false,
      frequency: 'daily' as const,
      category: habit.category,
    };
  } catch (error) {
    console.error('Error creating habit:', error);
    throw new Error('Failed to create habit');
  }
}

export async function toggleHabit(habitId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString();

    // Fetch habit
    const { data: habit, error: habitError } = await supabase
      .from('Habit')
      .select('*')
      .eq('id', habitId)
      .single();

    if (habitError || !habit) {
      throw new Error('Habit not found');
    }

    // Check if log exists for today (use range query for date matching)
    const { data: logs, error: logError } = await supabase
      .from('HabitLog')
      .select('*')
      .eq('habitId', habitId)
      .gte('date', todayISO)
      .lt('date', tomorrowISO);

    const existingLog = logs && logs.length > 0 ? logs[0] : null;

    if (existingLog) {
      // Toggle off - delete the log
      const { error: deleteError } = await supabase
        .from('HabitLog')
        .delete()
        .eq('id', existingLog.id);

      if (deleteError) {
        throw deleteError;
      }

      // Decrease streak if it was completed
      if (existingLog.completed && habit.streak > 0) {
        const { error: updateError } = await supabase
          .from('Habit')
          .update({ streak: habit.streak - 1 })
          .eq('id', habitId);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Toggle on - create log
      const { error: insertError } = await supabase
        .from('HabitLog')
        .insert({
          id: createId(),
          habitId,
          date: todayISO,
          completed: true,
        });

      if (insertError) {
        throw insertError;
      }

      // Increase streak
      const { error: updateError } = await supabase
        .from('Habit')
        .update({ streak: (habit.streak || 0) + 1 })
        .eq('id', habitId);

      if (updateError) {
        throw updateError;
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error toggling habit:', error);
    throw new Error('Failed to toggle habit');
  }
}

export async function deleteHabit(habitId: string) {
  try {
    const { error } = await supabase
      .from('Habit')
      .delete()
      .eq('id', habitId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting habit:', error);
    throw new Error('Failed to delete habit');
  }
}

export async function updateHabitStreak(habitId: string) {
  try {
    // Fetch habit with logs
    const { data: habit, error: habitError } = await supabase
      .from('Habit')
      .select('*')
      .eq('id', habitId)
      .single();

    if (habitError || !habit) {
      return;
    }

    // Fetch all completed logs
    const { data: logs, error: logsError } = await supabase
      .from('HabitLog')
      .select('*')
      .eq('habitId', habitId)
      .eq('completed', true)
      .order('date', { ascending: false });

    if (logsError) {
      throw logsError;
    }

    // Calculate streak
    let streak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    if (logs) {
      for (const log of logs) {
        const logDate = new Date(log.date);
        logDate.setHours(0, 0, 0, 0);
        
        if (logDate.getTime() === checkDate.getTime()) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Update streak
    const { error: updateError } = await supabase
      .from('Habit')
      .update({ streak })
      .eq('id', habitId);

    if (updateError) {
      throw updateError;
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating habit streak:', error);
    throw new Error('Failed to update habit streak');
  }
}
