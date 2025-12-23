import { supabase } from '../lib/supabase';
import { startOfYear, format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// Get habit log data for heatmap
export async function getHabitLogsForHeatmap(userId: string) {
  try {
    const yearStart = startOfYear(new Date());
    
    // First get all habits for the user
    const { data: habits, error: habitsError } = await supabase
      .from('Habit')
      .select('id')
      .eq('userId', userId);

    if (habitsError) {
      throw habitsError;
    }

    if (!habits || habits.length === 0) {
      return [];
    }

    const habitIds = habits.map(h => h.id);

    // Get all habit logs for this year
    const { data: logs, error } = await supabase
      .from('HabitLog')
      .select('date')
      .in('habitId', habitIds)
      .gte('date', yearStart.toISOString())
      .eq('completed', true);

    if (error) {
      throw error;
    }

    if (!logs) {
      return [];
    }

    // Group by date and count
    const dateMap = new Map<string, number>();
    logs.forEach((log) => {
      const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    });

    // Convert to array format
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  } catch (error) {
    console.error('Error fetching habit logs for heatmap:', error);
    return [];
  }
}

// Get task completion data for heatmap
// Note: Tasks don't have a createdAt or completion date field in the schema
// For now, we'll return empty data - this can be enhanced later when task completion dates are tracked
export async function getTaskCompletionsForHeatmap(userId: string) {
  try {
    // Tasks don't currently track completion dates, so we can't create a meaningful heatmap
    // Return empty array for now - this feature can be added later by adding a completedAt field to Task model
    return [];
  } catch (error) {
    console.error('Error fetching task completions for heatmap:', error);
    return [];
  }
}

// Get focus session data for momentum card
export async function getFocusMomentumData(userId: string) {
  try {
    const now = new Date();
    const thisWeekStart = startOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart = startOfWeek(subDays(thisWeekStart, 7), { weekStartsOn: 0 });
    const lastWeekEnd = endOfWeek(subDays(thisWeekStart, 7), { weekStartsOn: 0 });
    
    // Get sessions for this week
    const { data: thisWeekSessions, error: thisWeekError } = await supabase
      .from('FocusSession')
      .select('*')
      .eq('userId', userId)
      .gte('startedAt', thisWeekStart.toISOString());

    // Get sessions for last week
    const { data: lastWeekSessions, error: lastWeekError } = await supabase
      .from('FocusSession')
      .select('*')
      .eq('userId', userId)
      .gte('startedAt', lastWeekStart.toISOString())
      .lte('startedAt', lastWeekEnd.toISOString());

    if (thisWeekError || lastWeekError) {
      throw thisWeekError || lastWeekError;
    }

    const thisWeekCount = thisWeekSessions?.length || 0;
    const lastWeekCount = lastWeekSessions?.length || 0;

    // Get last 7 days of minutes
    const last7Days: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = subDays(now, i);
      const dayStart = new Date(day);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(day);
      dayEnd.setHours(23, 59, 59, 999);

      const daySessions = thisWeekSessions?.filter(session => {
        const sessionDate = new Date(session.startedAt);
        return sessionDate >= dayStart && sessionDate <= dayEnd;
      }) || [];

      const totalMinutes = daySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
      last7Days.push(totalMinutes);
    }

    return {
      thisWeekCount,
      lastWeekCount,
      last7DaysMinutes: last7Days
    };
  } catch (error) {
    console.error('Error fetching focus momentum data:', error);
    return {
      thisWeekCount: 0,
      lastWeekCount: 0,
      last7DaysMinutes: [0, 0, 0, 0, 0, 0, 0]
    };
  }
}

// Get aggregated momentum data (habits + tasks)
export async function getOverallMomentumData(userId: string) {
  try {
    const habitData = await getHabitLogsForHeatmap(userId);
    const taskData = await getTaskCompletionsForHeatmap(userId);

    // Combine and aggregate
    const combinedMap = new Map<string, number>();
    
    habitData.forEach(({ date, count }) => {
      combinedMap.set(date, (combinedMap.get(date) || 0) + count);
    });
    
    taskData.forEach(({ date, count }) => {
      combinedMap.set(date, (combinedMap.get(date) || 0) + count);
    });

    return Array.from(combinedMap.entries()).map(([date, count]) => ({
      date,
      count
    }));
  } catch (error) {
    console.error('Error fetching overall momentum data:', error);
    return [];
  }
}

