import { supabase } from '../lib/supabase';
import { createId } from '@paralleldrive/cuid2';

export async function getDailyRetros(userId: string) {
  try {
    const { data: retros, error } = await supabase
      .from('DailyRetro')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    if (error) {
      throw error;
    }

    if (!retros) {
      return [];
    }

    return retros.map((retro) => ({
      id: retro.id,
      date: new Date(retro.date).toLocaleDateString(),
      rating: retro.rating,
      gratitude: [
        retro.goodThing1,
        retro.goodThing2,
        retro.goodThing3,
      ].filter(Boolean) as string[],
      notes: retro.notes || '',
    }));
  } catch (error) {
    console.error('Error fetching daily retros:', error);
    throw new Error('Failed to fetch daily retros');
  }
}

export async function createDailyRetro(userId: string, data: {
  rating: number;
  goodThing1?: string;
  goodThing2?: string;
  goodThing3?: string;
  notes?: string;
}) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if retro already exists for today
    const { data: existing, error: fetchError } = await supabase
      .from('DailyRetro')
      .select('*')
      .eq('userId', userId)
      .gte('date', today.toISOString())
      .lt('date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
      .single();

    if (existing) {
      // Update existing retro
      const { data: updated, error: updateError } = await supabase
        .from('DailyRetro')
        .update({
          rating: data.rating,
          goodThing1: data.goodThing1 || null,
          goodThing2: data.goodThing2 || null,
          goodThing3: data.goodThing3 || null,
          notes: data.notes || null,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!updated) {
        throw new Error('Failed to update retro');
      }

      return {
        id: updated.id,
        date: new Date(updated.date).toLocaleDateString(),
        rating: updated.rating,
        gratitude: [
          updated.goodThing1,
          updated.goodThing2,
          updated.goodThing3,
        ].filter(Boolean) as string[],
        notes: updated.notes || '',
      };
    }

    // Create new retro (only if fetchError indicates it doesn't exist, or if no error but no data)
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    const { data: retro, error: createError } = await supabase
      .from('DailyRetro')
      .insert({
        id: createId(),
        userId,
        date: today.toISOString(),
        rating: data.rating,
        goodThing1: data.goodThing1 || null,
        goodThing2: data.goodThing2 || null,
        goodThing3: data.goodThing3 || null,
        notes: data.notes || null,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    if (!retro) {
      throw new Error('Failed to create retro');
    }

    return {
      id: retro.id,
      date: new Date(retro.date).toLocaleDateString(),
      rating: retro.rating,
      gratitude: [
        retro.goodThing1,
        retro.goodThing2,
        retro.goodThing3,
      ].filter(Boolean) as string[],
      notes: retro.notes || '',
    };
  } catch (error) {
    console.error('Error creating daily retro:', error);
    throw new Error('Failed to create daily retro');
  }
}

export async function updateDailyRetro(retroId: string, data: {
  rating?: number;
  goodThing1?: string;
  goodThing2?: string;
  goodThing3?: string;
  notes?: string;
}) {
  try {
    const updateData: {
      rating?: number;
      goodThing1?: string | null;
      goodThing2?: string | null;
      goodThing3?: string | null;
      notes?: string | null;
    } = {};

    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }
    if (data.goodThing1 !== undefined) {
      updateData.goodThing1 = data.goodThing1 || null;
    }
    if (data.goodThing2 !== undefined) {
      updateData.goodThing2 = data.goodThing2 || null;
    }
    if (data.goodThing3 !== undefined) {
      updateData.goodThing3 = data.goodThing3 || null;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes || null;
    }

    const { data: retro, error } = await supabase
      .from('DailyRetro')
      .update(updateData)
      .eq('id', retroId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    if (!retro) {
      throw new Error('Retro not found');
    }

    return {
      id: retro.id,
      date: new Date(retro.date).toLocaleDateString(),
      rating: retro.rating,
      gratitude: [
        retro.goodThing1,
        retro.goodThing2,
        retro.goodThing3,
      ].filter(Boolean) as string[],
      notes: retro.notes || '',
    };
  } catch (error) {
    console.error('Error updating daily retro:', error);
    throw new Error('Failed to update daily retro');
  }
}

export async function getTodayRetro(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { data: retro, error } = await supabase
      .from('DailyRetro')
      .select('*')
      .eq('userId', userId)
      .gte('date', today.toISOString())
      .lt('date', tomorrow.toISOString())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No retro found for today
        return null;
      }
      throw error;
    }

    if (!retro) {
      return null;
    }

    return {
      id: retro.id,
      date: new Date(retro.date).toLocaleDateString(),
      rating: retro.rating,
      gratitude: [
        retro.goodThing1,
        retro.goodThing2,
        retro.goodThing3,
      ].filter(Boolean) as string[],
      notes: retro.notes || '',
    };
  } catch (error) {
    console.error('Error fetching today retro:', error);
    return null;
  }
}
