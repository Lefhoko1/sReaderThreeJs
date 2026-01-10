/**
 * Simple auth test script
 * Run with: npx ts-node src/test-auth.ts
 */

import { AuthViewModel } from './application/viewmodels/AuthViewModel';
import { SupabaseUserRepository } from './data/supabase/SupabaseUserRepository';

const userRepo = new SupabaseUserRepository();
const authVM = new AuthViewModel(userRepo);

async function testAuth() {
  console.log('🧪 Testing Auth System...\n');

  try {
    // Test 1: Signup
    console.log('1️⃣ Testing Signup...');
    const signupResult = await authVM.signup({
      displayName: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
    });

    if (signupResult.ok) {
      console.log('✅ Signup successful');
      console.log('User ID:', signupResult.value.id);
      console.log('Email:', signupResult.value.email);
      console.log('Display Name:', signupResult.value.displayName);
    } else {
      console.log('❌ Signup failed:', signupResult.error);
    }
  } catch (error) {
    console.error('❌ Error during signup:', error);
  }
}

// Run the test
testAuth();
