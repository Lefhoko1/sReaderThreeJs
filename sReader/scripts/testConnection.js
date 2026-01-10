const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://qzuddqptlgcqfwbjjarl.supabase.co';
const supabaseKey = 'sb_publishable_OaG_p_VAarfmtEcM9_smSQ_6X-oPkAl';

console.log('🔌 Testing Supabase connection...\n');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey.substring(0, 20) + '...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple test - check if users table exists
supabase
  .from('users')
  .select('count')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      if (error.code === '42P01') {
        console.log('✅ Connected to database successfully!');
        console.log('⚠️  But tables do not exist yet');
        console.log('\n👉 Next: Run the SQL in Supabase dashboard to create tables');
      } else {
        console.log('❌ Connection error:', error.message);
        console.log('Code:', error.code);
      }
    } else {
      console.log('✅ Connected successfully!');
      console.log('✅ Tables exist!');
      console.log('📊 Data:', data);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.log('❌ Unexpected error:', err.message);
    process.exit(1);
  });
