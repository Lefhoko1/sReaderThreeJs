/**
 * Simple auth test script
 * Run with: npx ts-node src/test-auth.ts
 */

import { AuthViewModel } from './application/viewmodels/AuthViewModel';
import { SupabaseUserRepository } from './data/supabase/SupabaseUserRepository';
import { Role } from './shared/types';

const userRepo = new SupabaseUserRepository();
const authVM = new AuthViewModel(userRepo);

async function testAuth() {
  console.log('🧪 Testing Auth System...\n');

  try {
    // Test 1: Signup as Student
    console.log('1️⃣ Testing Student Signup...');
    const signupResult = await authVM.signup({
      displayName: 'Test Student',
      email: `student-${Date.now()}@example.com`,
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      role: Role.STUDENT,
      gradeLevel: '10th Grade',
      schoolName: 'Test School',
    });

    if (signupResult.ok) {
      console.log('✅ Student Signup successful');
      console.log('User ID:', signupResult.value.id);
      console.log('Email:', signupResult.value.email);
      console.log('Display Name:', signupResult.value.displayName);
      console.log('Roles:', signupResult.value.roles);
    } else {
      console.log('❌ Student Signup failed:', signupResult.error);
    }

    // Test 2: Signup as Tutor
    console.log('\n2️⃣ Testing Tutor Signup...');
    const tutorSignupResult = await authVM.signup({
      displayName: 'Test Tutor',
      email: `tutor-${Date.now()}@example.com`,
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      role: Role.TUTOR,
      yearsOfExperience: 5,
      specializations: ['Mathematics', 'Physics'],
    });

    if (tutorSignupResult.ok) {
      console.log('✅ Tutor Signup successful');
      console.log('User ID:', tutorSignupResult.value.id);
      console.log('Roles:', tutorSignupResult.value.roles);
    } else {
      console.log('❌ Tutor Signup failed:', tutorSignupResult.error);
    }

    // Test 3: Signup as Guardian
    console.log('\n3️⃣ Testing Guardian Signup...');
    const guardianSignupResult = await authVM.signup({
      displayName: 'Test Guardian',
      email: `guardian-${Date.now()}@example.com`,
      password: 'TestPassword123',
      confirmPassword: 'TestPassword123',
      role: Role.GUARDIAN,
    });

    if (guardianSignupResult.ok) {
      console.log('✅ Guardian Signup successful');
      console.log('User ID:', guardianSignupResult.value.id);
      console.log('Roles:', guardianSignupResult.value.roles);
    } else {
      console.log('❌ Guardian Signup failed:', guardianSignupResult.error);
    }
  } catch (error) {
    console.error('❌ Error during signup:', error);
  }
}

// Run the test
testAuth();
