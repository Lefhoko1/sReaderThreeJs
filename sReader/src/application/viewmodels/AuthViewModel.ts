/**
 * AuthViewModel
 * Manages signup, login, logout, password reset, and profile management.
 * Single responsibility: authentication and user account operations.
 */

import { makeAutoObservable } from 'mobx';
import { Result, ok, err } from '../../shared/result';
import { User, Profile } from '../../domain/entities/user';
import { IUserRepository } from '../../data/repositories/IUserRepository';

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

    const result = await this.userRepo.createUser({
      roles: ['STUDENT'] as any,
      email: data.email,
      displayName: data.displayName,
    });

    if (result.ok) {
      this.currentUser = result.value;
      const profileRes = await this.userRepo.getProfile(result.value.id);
      if (profileRes.ok) {
        this.currentProfile = profileRes.value;
      }
      this.successMessage = `Welcome, ${data.displayName}! Account created successfully.`;
    } else {
      this.error = result.error;
    }
    this.loading = false;
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

    // TODO: In production, call backend auth endpoint with password verification
    const result = await this.userRepo.getUser(email);
    if (result.ok) {
      this.currentUser = result.value;
      const profileRes = await this.userRepo.getProfile(result.value.id);
      if (profileRes.ok) {
        this.currentProfile = profileRes.value;
      }
      this.successMessage = `Welcome back, ${result.value.displayName}!`;
    } else {
      this.error = 'Invalid email or password';
    }
    this.loading = false;
    return result;
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
    this.currentUser = null;
    this.currentProfile = null;
    this.error = null;
    this.successMessage = null;
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
