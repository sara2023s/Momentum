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

export async function updateUserProfile(userId: string, updates: {
  name?: string;
  birthday?: Date | null;
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
}) {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    // Only include these fields if they exist in the database
    // Check if columns exist by trying to update them
    if (updates.birthday !== undefined) {
      updateData.birthday = updates.birthday ? updates.birthday.toISOString() : null;
    }
    if (updates.phoneNumber !== undefined) {
      updateData.phoneNumber = updates.phoneNumber;
    }
    if (updates.profileImageUrl !== undefined) {
      updateData.profileImageUrl = updates.profileImageUrl;
    }

    const { data: updated, error } = await supabase
      .from('User')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      // If columns don't exist, provide helpful error message
      if (error.code === '42703' || error.message?.includes('column')) {
        throw new Error('Profile columns not found. Please run the migration SQL in Supabase. See supabase/migrations/add_user_profile_fields.sql');
      }
      throw error;
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
    console.error('Error updating user profile:', error);
    throw error instanceof Error ? error : new Error('Failed to update user profile');
  }
}

export async function uploadProfileImage(userId: string, file: File): Promise<string> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw new Error('Failed to upload profile image');
  }
}
