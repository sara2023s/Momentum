import { supabase } from '../lib/supabase';
import { createId } from '@paralleldrive/cuid2';

export async function getFocusSessions(userId: string) {
  try {
    const { data: sessions, error } = await supabase
      .from('FocusSession')
      .select('*')
      .eq('userId', userId)
      .order('startedAt', { ascending: false });

    if (error) {
      throw error;
    }

    if (!sessions) {
      return [];
    }

    return sessions.map((session) => ({
      id: session.id,
      duration: session.duration,
      timestamp: new Date(session.startedAt).getTime(),
    }));
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    throw new Error('Failed to fetch focus sessions');
  }
}

export async function createFocusSession(userId: string, duration: number) {
  try {
    const { data: session, error } = await supabase
      .from('FocusSession')
      .insert({
        id: createId(),
        userId,
        duration,
        startedAt: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!session) {
      throw new Error('Failed to create focus session');
    }

    return {
      id: session.id,
      duration: session.duration,
      timestamp: new Date(session.startedAt).getTime(),
    };
  } catch (error) {
    console.error('Error creating focus session:', error);
    throw new Error('Failed to create focus session');
  }
}

export async function getTodayFocusMinutes(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: sessions, error } = await supabase
      .from('FocusSession')
      .select('duration')
      .eq('userId', userId)
      .gte('startedAt', today.toISOString())
      .lt('startedAt', tomorrow.toISOString());

    if (error) {
      throw error;
    }

    if (!sessions) {
      return 0;
    }

    return sessions.reduce((total, session) => total + (session.duration || 0), 0);
  } catch (error) {
    console.error('Error fetching today focus minutes:', error);
    return 0;
  }
}
