/**
 * AuthViewModel
 * Manages signup, login, logout, password reset, and profile management.
 * Single responsibility: authentication and user account operations.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { Result, ok, err } from '../../shared/result';
import { User, Profile } from '../../domain/entities/user';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import supabase from '../../data/supabase/supabaseClient';

export class AuthViewModel {
  currentUser: User | null = null;
  currentProfile: Profile | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // For password reset flow
  resetEmail: string = '';
  resetOtpSent = false;
  resetVerified = false;

  constructor(private userRepo: IUserRepository) {
    makeAutoObservable(this);
  }

  async signup(data: {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<Result<User>> {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    // Validation
    if (!data.displayName || !data.email || !data.password) {
      this.error = 'All fields are required';
      this.loading = false;
      return err(this.error);
    }

    if (data.password !== data.confirmPassword) {
      this.error = 'Passwords do not match';
      this.loading = false;
      return err(this.error);
    }

    if (data.password.length < 8) {
      this.error = 'Password must be at least 8 characters';
      this.loading = false;
      return err(this.error);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      this.error = 'Invalid email format';
      this.loading = false;
      return err(this.error);
    }

    let result: Result<User> = err('Signup failed');

    try {
      // 1. Create auth user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        this.error = signUpError.message || 'Signup failed';
        this.loading = false;
        return err(this.error);
      }

      if (!authData.user) {
        this.error = 'Failed to create user account';
        this.loading = false;
        return err(this.error);
      }

      // 2. Create user record in database with the Supabase Auth user ID
      // This ensures login can find the user by auth user ID
      const now = new Date().toISOString();
      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id, // Use Supabase Auth user ID as our database ID
            email: data.email,
            phone: null,
            display_name: data.displayName,
            avatar_url: null,
            roles: ['STUDENT'],
            created_at: now,
            updated_at: now,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create user record:', insertError);
        this.error = 'Failed to create user profile';
        this.loading = false;
        return err(this.error);
      }

      if (!userData) {
        this.error = 'Failed to create user record';
        this.loading = false;
        return err(this.error);
      }

      // Convert database row to User object
      const newUser: User = {
        id: userData.id,
        roles: userData.roles || ['STUDENT'],
        email: userData.email,
        phone: userData.phone,
        displayName: userData.display_name,
        avatarUrl: userData.avatar_url,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
      };

      result = ok(newUser);

      runInAction(() => {
        if (result.ok) {
          this.currentUser = result.value;
          this.successMessage = `Welcome, ${data.displayName}! Account created successfully.`;
        } else {
          this.error = result.error;
        }
      });

      if (result.ok) {
        const profileRes = await this.userRepo.getProfile(result.value.id);
        runInAction(() => {
          if (profileRes.ok) {
            this.currentProfile = profileRes.value;
          }
        });
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || 'Signup failed';
      });
    }
    runInAction(() => {
      this.loading = false;
    });
    return result;
  }

  async login(email: string, password: string): Promise<Result<User>> {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    if (!email || !password) {
      this.error = 'Email and password required';
      this.loading = false;
      return err(this.error);
    }

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('Supabase signIn error:', signInError);
        // Check if user needs email confirmation
        if (signInError.message && signInError.message.includes('not confirmed')) {
          this.error = 'Please confirm your email before logging in';
        } else {
          this.error = signInError.message || 'Invalid email or password';
        }
        this.loading = false;
        return err(this.error);
      }

      if (!authData.user) {
        this.error = 'Login failed';
        this.loading = false;
        return err(this.error);
      }

      // 2. Get user from database
      const result = await this.userRepo.getUser(authData.user.id);
      
      runInAction(() => {
        if (result.ok) {
          this.currentUser = result.value;
          this.successMessage = `Welcome back, ${result.value.displayName}!`;
        } else {
          this.error = 'Could not load user profile';
        }
      });

      if (result.ok) {
        const profileRes = await this.userRepo.getProfile(result.value.id);
        runInAction(() => {
          if (profileRes.ok) {
            this.currentProfile = profileRes.value;
          }
        });
      }
      
      return result;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message || 'Login failed';
      });
      return err(this.error);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async requestPasswordReset(email: string): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;
    this.successMessage = null;

    if (!email) {
      this.error = 'Email is required';
      this.loading = false;
      return err(this.error);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.error = 'Invalid email format';
      this.loading = false;
      return err(this.error);
    }

    // TODO: In production, call backend to send OTP
    this.resetEmail = email;
    this.resetOtpSent = true;
    this.successMessage = `Password reset code sent to ${email}`;
    
    this.loading = false;
    return ok(true);
  }

  async verifyResetOtp(otp: string): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    if (!otp || otp.length < 4) {
      this.error = 'Invalid code';
      this.loading = false;
      return err(this.error);
    }

    // TODO: In production, call backend to verify OTP
    this.resetVerified = true;
    this.successMessage = 'Code verified. Enter your new password.';
    
    this.loading = false;
    return ok(true);
  }

  async resetPassword(newPassword: string, confirmPassword: string): Promise<Result<boolean>> {
    this.loading = true;
    this.error = null;

    if (!newPassword || !confirmPassword) {
      this.error = 'Passwords required';
      this.loading = false;
      return err(this.error);
    }

    if (newPassword !== confirmPassword) {
      this.error = 'Passwords do not match';
      this.loading = false;
      return err(this.error);
    }

    if (newPassword.length < 8) {
      this.error = 'Password must be at least 8 characters';
      this.loading = false;
      return err(this.error);
    }

    // TODO: In production, call backend to reset password
    this.resetOtpSent = false;
    this.resetVerified = false;
    this.resetEmail = '';
    this.successMessage = 'Password reset successfully! Please login with your new password.';
    
    this.loading = false;
    return ok(true);
  }

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
    runInAction(() => {
      this.currentUser = null;
      this.currentProfile = null;
      this.error = null;
      this.successMessage = null;
    });
  }

  async updateProfile(profile: Profile): Promise<Result<Profile>> {
    const result = await this.userRepo.updateProfile(profile);
    if (result.ok) {
      this.currentProfile = result.value;
      this.successMessage = 'Profile updated successfully';
    } else {
      this.error = result.error;
    }
    return result;
  }

  async deleteAccount(): Promise<Result<boolean>> {
    if (!this.currentUser) {
      return err('No user logged in');
    }
    const result = await this.userRepo.deleteUser(this.currentUser.id);
    if (result.ok) {
      await this.logout();
    }
    return result;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  clearError(): void {
    this.error = null;
  }

  clearSuccess(): void {
    this.successMessage = null;
  }
}
