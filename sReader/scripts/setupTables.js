const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('❌ Missing SUPABASE environment variables');
  process.exit(1);
}

async function createTables() {
  try {
    console.log('📝 Creating friendships and notifications tables...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'supabase-schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
    
    // For Friendships and Notifications specifically
    const friendshipsSql = `
      CREATE TABLE IF NOT EXISTS public.friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        from_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        to_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        UNIQUE(from_user_id, to_user_id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_friendships_from_user ON public.friendships(from_user_id);
      CREATE INDEX IF NOT EXISTS idx_friendships_to_user ON public.friendships(to_user_id);
      
      CREATE TABLE IF NOT EXISTS public.notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}',
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
    `;

    // Note: The Supabase JS client doesn't support raw SQL execution
    // You must use the SQL Editor in the dashboard or set up RPC functions
    
    console.log('\n❌ Cannot execute SQL directly with Supabase JS client');
    console.log('\n✅ Solution: Use Supabase SQL Editor');
    console.log('');
    console.log('Steps:');
    console.log('1. Open https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. New Query');
    console.log('5. Paste and run this SQL:');
    console.log('');
    console.log(friendshipsSql);
    console.log('');
    console.log('After running the SQL, press r in the Metro bundler to reload the app');
    
    // Try to verify if tables exist
    console.log('\nVerifying table access...');
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(url, anonKey);
    
    const { error } = await supabase.from('friendships').select('count', { count: 'exact' }).limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('⚠ Friendships table not found yet');
      console.log('\n👉 Please run the SQL above in Supabase Dashboard > SQL Editor');
    } else if (error) {
      console.log('❌ Error:', error.message);
    } else {
      console.log('✅ Friendships table exists and is accessible!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
