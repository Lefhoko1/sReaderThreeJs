/**
 * AuthViewModel
 * Manages signup, login, logout, password reset, and profile management.
 * Single responsibility: authentication and user account operations.
 */

import { makeAutoObservable, runInAction } from 'mobx';
import { Result, ok, err } from '../../shared/result';
import { User, Profile, Location } from '../../domain/entities/user';
import { IUserRepository } from '../../data/repositories/IUserRepository';
import supabase from '../../data/supabase/supabaseClient';

export class AuthViewModel {
  currentUser: User | null = null;
  currentProfile: Profile | null = null;
  currentLocation: Location | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // For password reset flow
  resetEmail: string = '';
  resetCode: string = '';
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
        const errorMsg = signInError.message || '';
        
        // Check for email verification requirement
        if (
          errorMsg.toLowerCase().includes('not confirmed') ||
          errorMsg.toLowerCase().includes('email not confirmed') ||
          errorMsg.toLowerCase().includes('verify your email') ||
          errorMsg.includes('Email not confirmed') ||
          signInError.code === 'email_not_confirmed'
        ) {
          this.error = '📧 Please verify your email address first. Check your inbox for a confirmation link.';
        } else if (errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('credentials')) {
          this.error = '❌ Invalid email or password. Please try again.';
        } else {
          this.error = errorMsg || 'Login failed. Please try again.';
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
      const errorMsg = error.message || 'Login failed';
      runInAction(() => {
        this.error = errorMsg;
      });
      return err(errorMsg);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async requestPasswordReset(email: string): Promise<Result<boolean>> {
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
    });

    if (!email) {
      const errorMsg = 'Email required';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = 'Invalid email format';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    try {
      const supabaseUrl = (process.env as any).EXPO_PUBLIC_SUPABASE_URL as string;
      const functionsBase = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      const resp = await fetch(`${functionsBase}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'request', email }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        const errorMsg = json.error || 'Failed to send reset code';
        runInAction(() => {
          this.error = errorMsg;
          this.loading = false;
        });
        return err(errorMsg);
      }

      runInAction(() => {
        this.resetEmail = email;
        this.resetOtpSent = true;
        this.successMessage = `📧 Verification code sent to ${email}. Check your inbox.`;
        this.loading = false;
      });
      return ok(true);
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      const errorMsg = error.message || 'Failed to request password reset';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }
  }

  async verifyResetOtp(otp: string): Promise<Result<boolean>> {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    if (!otp || otp.length < 4) {
      const errorMsg = 'Invalid code';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    try {
      const supabaseUrl = (process.env as any).EXPO_PUBLIC_SUPABASE_URL as string;
      const functionsBase = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      const resp = await fetch(`${functionsBase}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'verify', email: this.resetEmail, code: otp }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        const errorMsg = json.error || 'Invalid verification code';
        runInAction(() => {
          this.error = errorMsg;
          this.loading = false;
        });
        return err(errorMsg);
      }

      runInAction(() => {
        this.resetCode = otp;
        this.resetVerified = true;
        this.successMessage = '✓ Code verified. Enter your new password.';
        this.loading = false;
      });
      return ok(true);
    } catch (error: any) {
      console.error('Error verifying reset code:', error);
      const errorMsg = error.message || 'Failed to verify code';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }
  }

  async resetPassword(newPassword: string, confirmPassword: string): Promise<Result<boolean>> {
    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    if (!newPassword || !confirmPassword) {
      const errorMsg = 'Passwords required';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    if (newPassword !== confirmPassword) {
      const errorMsg = 'Passwords do not match';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    if (newPassword.length < 8) {
      const errorMsg = 'Password must be at least 8 characters';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }

    try {
      const supabaseUrl = (process.env as any).EXPO_PUBLIC_SUPABASE_URL as string;
      const functionsBase = supabaseUrl.replace('.supabase.co', '.functions.supabase.co');
      const resp = await fetch(`${functionsBase}/password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reset',
          email: this.resetEmail,
          code: this.resetCode,
          newPassword,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || json.error) {
        const errorMsg = json.error || 'Failed to reset password';
        runInAction(() => {
          this.error = errorMsg;
          this.loading = false;
        });
        return err(errorMsg);
      }

      runInAction(() => {
        this.resetOtpSent = false;
        this.resetVerified = false;
        this.resetEmail = '';
        this.successMessage = '✅ Password reset successfully! Please login with your new password.';
        this.loading = false;
      });
      return ok(true);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      const errorMsg = error.message || 'Failed to reset password';
      runInAction(() => {
        this.error = errorMsg;
        this.loading = false;
      });
      return err(errorMsg);
    }
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

  async updateUserProfile(user: User): Promise<Result<User>> {
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
    });

    try {
      // Update user data in database
      const result = await this.userRepo.updateUser(user);
      runInAction(() => {
        if (result.ok) {
          this.currentUser = result.value;
          this.successMessage = 'Profile updated successfully';
        } else {
          this.error = result.error;
        }
      });
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update profile';
      runInAction(() => {
        this.error = errorMsg;
      });
      return err(errorMsg);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async updateProfile(profile: Profile): Promise<Result<Profile>> {
    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
    });

    try {
      const result = await this.userRepo.updateProfile(profile);
      runInAction(() => {
        if (result.ok) {
          this.currentProfile = result.value;
          this.successMessage = 'Profile updated successfully';
        } else {
          this.error = result.error;
        }
      });
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to update profile';
      runInAction(() => {
        this.error = errorMsg;
      });
      return err(errorMsg);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
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

  async getLocation(): Promise<Result<Location | null>> {
    if (!this.currentUser) {
      return err('No user logged in');
    }

    runInAction(() => {
      this.loading = true;
      this.error = null;
    });

    try {
      const location = await this.userRepo.getLocation(this.currentUser!.id);
      runInAction(() => {
        this.currentLocation = location;
      });
      return ok(location);
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to get location';
      runInAction(() => {
        this.error = errorMsg;
      });
      return err(errorMsg);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async saveLocation(location: Location): Promise<Result<void>> {
    if (!this.currentUser) {
      return err('No user logged in');
    }

    runInAction(() => {
      this.loading = true;
      this.error = null;
      this.successMessage = null;
    });

    try {
      const result = await this.userRepo.saveLocation(location);
      runInAction(() => {
        if (result.ok) {
          this.currentLocation = location;
          this.successMessage = 'Location saved successfully';
        } else {
          this.error = result.error;
        }
      });
      return result;
    } catch (error: any) {
      const errorMsg = error.message || 'Failed to save location';
      runInAction(() => {
        this.error = errorMsg;
      });
      return err(errorMsg);
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
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
