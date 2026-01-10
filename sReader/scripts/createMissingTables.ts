import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // Create friendships table
    const { error: friendshipsError } = await supabase.rpc('create_tables', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.friendships (
          id UUID NOT NULL DEFAULT gen_random_uuid(),
          from_user_id UUID NOT NULL,
          to_user_id UUID NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (from_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
          FOREIGN KEY (to_user_id) REFERENCES public.users(id) ON DELETE CASCADE,
          UNIQUE(from_user_id, to_user_id)
        );
      `
    });

    if (friendshipsError) {
      console.error('Error creating friendships table:', friendshipsError);
    } else {
      console.log('✓ Friendships table created');
    }

    // Create notifications table
    const { error: notificationsError } = await supabase.rpc('create_tables', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID NOT NULL DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL,
          type TEXT NOT NULL,
          payload JSONB NOT NULL DEFAULT '{}',
          read_at TIMESTAMP,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (id),
          FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
      `
    });

    if (notificationsError) {
      console.error('Error creating notifications table:', notificationsError);
    } else {
      console.log('✓ Notifications table created');
    }

    console.log('\n✓ All tables created successfully!');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
}

createTables();
