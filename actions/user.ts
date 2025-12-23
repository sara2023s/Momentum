import { supabase } from '../lib/supabase';

export async function getUser(userId: string) {
  try {
    // Try to fetch user
    const { data: user, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // User doesn't exist, get auth user info to create it
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        throw new Error('Not authenticated');
      }

      // Create user record
      const { data: newUser, error: createError } = await supabase
        .from('User')
        .insert({
          id: userId,
          email: authUser.email || '',
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          level: 1,
          currentXP: 0,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        // If user creation fails, return a default user object instead of throwing
        // This prevents the app from crashing on first login
        return {
          name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          xp: 0,
          level: 1,
        };
      }

      return {
        name: newUser.name || 'User',
        xp: newUser.currentXP,
        level: newUser.level,
      };
    }

    if (fetchError) {
      throw fetchError;
    }

    if (!user) {
      throw new Error('User not found');
    }

    return {
      name: user.name || 'User',
      xp: user.currentXP,
      level: user.level,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function addXP(userId: string, amount: number) {
  try {
    // Fetch current user
    const { data: user, error: fetchError } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      throw new Error('User not found');
    }

    const newXP = user.currentXP + amount;
    
    // Simple level calculation (can be improved)
    let newLevel = user.level;
    const xpForNextLevel = 100 * user.level;
    if (newXP >= xpForNextLevel) {
      newLevel = user.level + 1;
    }

    // Update user
    const { data: updated, error: updateError } = await supabase
      .from('User')
      .update({
        currentXP: newXP,
        level: newLevel,
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    if (!updated) {
      throw new Error('Failed to update user');
    }

    return {
      name: updated.name || 'User',
      xp: updated.currentXP,
      level: updated.level,
    };
  } catch (error) {
    console.error('Error adding XP:', error);
    throw new Error('Failed to add XP');
  }
}
