import { supabase } from '../lib/supabase';

async function main() {
  console.log('🌱 Seeding database...');

  // Upsert user_01
  const { data: existingUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', 'user_01')
    .single();

  if (existingUser) {
    // Update existing user
    const { data: user, error } = await supabase
      .from('users')
      .update({
        email: 'test@example.com',
        name: 'Test User',
      })
      .eq('id', 'user_01')
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log('✅ Updated user:', user);
  } else {
    // Create new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: 'user_01',
        email: 'test@example.com',
        name: 'Test User',
        level: 1,
        currentXP: 0,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }
    console.log('✅ Created user:', user);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  });
