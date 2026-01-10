import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

type ResetStep = 'email' | 'otp' | 'password';

export const PasswordResetScreen = observer(
  ({ onSuccess, onBackToLogin }: {
    onSuccess?: () => void;
    onBackToLogin?: () => void;
  }) => {
    const theme = useTheme();
    const { authVM } = useAppContext();
    const [step, setStep] = useState<ResetStep>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});
    const [resendCountdown, setResendCountdown] = useState(0);

    // Countdown timer for resend button
    useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      if (resendCountdown > 0) {
        interval = setInterval(() => {
          setResendCountdown(prev => prev - 1);
        }, 1000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [resendCountdown]);

    const handleEmailSubmit = async () => {
      const errors: Record<string, boolean> = {};
      if (!email.trim()) {
        errors.email = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = true;
      }
      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        const result = await authVM.requestPasswordReset(email);
        if (result.ok) {
          setStep('otp');
          setResendCountdown(60);
        }
      }
    };

    const handleOtpSubmit = async () => {
      const errors: Record<string, boolean> = {};
      if (!otp || otp.length < 4) {
        errors.otp = true;
      }
      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        const result = await authVM.verifyResetOtp(otp);
        if (result.ok) {
          setStep('password');
        }
      }
    };

    const handlePasswordReset = async () => {
      const errors: Record<string, boolean> = {};
      if (!newPassword) {
        errors.newPassword = true;
      } else if (newPassword.length < 8) {
        errors.newPassword = true;
      }
      if (!confirmPassword) {
        errors.confirmPassword = true;
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = true;
      }
      setValidationErrors(errors);

      if (Object.keys(errors).length === 0) {
        const result = await authVM.resetPassword(newPassword, confirmPassword);
        if (result.ok && onSuccess) {
          setStep('email');
          setEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(onSuccess, 1500);
        }
      }
    };

    const handleResendOtp = async () => {
      const result = await authVM.requestPasswordReset(email);
      if (result.ok) {
        setResendCountdown(60);
      }
    };

    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBackToLogin} disabled={authVM.loading}>
              <Text style={{ color: theme.colors.primary, fontSize: 16 }}>← Back</Text>
            </TouchableOpacity>
            <Text variant="headlineLarge" style={styles.title}>
              Reset Password
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              {step === 'email' && 'Enter your email to receive a reset code'}
              {step === 'otp' && 'Enter the code sent to your email'}
              {step === 'password' && 'Create a new password'}
            </Text>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.step, step === 'email' && { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: step === 'email' ? '#fff' : theme.colors.onSurfaceVariant }}>
                1
              </Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={[styles.step, step === 'otp' && { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: step === 'otp' ? '#fff' : theme.colors.onSurfaceVariant }}>
                2
              </Text>
            </View>
            <View style={[styles.stepLine, { backgroundColor: theme.colors.outlineVariant }]} />
            <View style={[styles.step, step === 'password' && { backgroundColor: theme.colors.primary }]}>
              <Text style={{ color: step === 'password' ? '#fff' : theme.colors.onSurfaceVariant }}>
                3
              </Text>
            </View>
          </View>

          <View style={styles.form}>
            {/* Email Step */}
            {step === 'email' && (
              <View style={styles.fieldContainer}>
                <Text variant="labelLarge">Email Address</Text>
                <TextInput
                  mode="outlined"
                  label="you@example.com"
                  value={email}
                  onChangeText={text => {
                    setEmail(text);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: false }));
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  error={!!validationErrors.email}
                  editable={!authVM.loading}
                  style={styles.input}
                />
                {validationErrors.email && (
                  <Text style={[styles.errorText, { color: theme.colors.error }]}>
                    Please enter a valid email
                  </Text>
                )}
              </View>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge">Verification Code</Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    We sent a 6-digit code to {email}
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="000000"
                    value={otp}
                    onChangeText={text => {
                      setOtp(text);
                      if (validationErrors.otp) setValidationErrors(prev => ({ ...prev, otp: false }));
                    }}
                    keyboardType="numeric"
                    maxLength={6}
                    error={!!validationErrors.otp}
                    editable={!authVM.loading}
                    style={[styles.input, styles.otpInput]}
                  />
                  {validationErrors.otp && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      Enter a valid 6-digit code
                    </Text>
                  )}
                </View>

                {/* Resend Code */}
                <View style={styles.resendContainer}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Didn't receive the code?{' '}
                  </Text>
                  <TouchableOpacity
                    onPress={handleResendOtp}
                    disabled={resendCountdown > 0 || authVM.loading}
                  >
                    <Text
                      style={{
                        color: resendCountdown > 0 ? theme.colors.outlineVariant : theme.colors.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Password Step */}
            {step === 'password' && (
              <>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge">New Password</Text>
                  <TextInput
                    mode="outlined"
                    label="Minimum 8 characters"
                    value={newPassword}
                    onChangeText={text => {
                      setNewPassword(text);
                      if (validationErrors.newPassword) setValidationErrors(prev => ({ ...prev, newPassword: false }));
                    }}
                    secureTextEntry={!showPassword}
                    right={
                      <TextInput.Icon
                        icon={showPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowPassword(!showPassword)}
                        disabled={authVM.loading}
                      />
                    }
                    error={!!validationErrors.newPassword}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                  {validationErrors.newPassword && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      Password must be at least 8 characters
                    </Text>
                  )}
                </View>

                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge">Confirm Password</Text>
                  <TextInput
                    mode="outlined"
                    label="Re-enter your password"
                    value={confirmPassword}
                    onChangeText={text => {
                      setConfirmPassword(text);
                      if (validationErrors.confirmPassword) setValidationErrors(prev => ({ ...prev, confirmPassword: false }));
                    }}
                    secureTextEntry={!showConfirmPassword}
                    right={
                      <TextInput.Icon
                        icon={showConfirmPassword ? 'eye-off' : 'eye'}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={authVM.loading}
                      />
                    }
                    error={!!validationErrors.confirmPassword}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                  {validationErrors.confirmPassword && (
                    <Text style={[styles.errorText, { color: theme.colors.error }]}>
                      Passwords must match
                    </Text>
                  )}
                </View>
              </>
            )}
          </View>

          {/* Error Message */}
          {authVM.error && (
            <View style={[styles.errorAlert, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={{ color: theme.colors.error }}>⚠ {authVM.error}</Text>
            </View>
          )}

          {/* Success Message */}
          {authVM.successMessage && (
            <View style={[styles.successAlert, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Text style={{ color: theme.colors.tertiary }}>✓ {authVM.successMessage}</Text>
            </View>
          )}

          {/* Buttons */}
          <Button
            mode="contained"
            onPress={
              step === 'email'
                ? handleEmailSubmit
                : step === 'otp'
                  ? handleOtpSubmit
                  : handlePasswordReset
            }
            disabled={authVM.loading}
            loading={authVM.loading}
            contentStyle={styles.buttonContent}
            style={styles.submitButton}
          >
            {authVM.loading
              ? 'Processing...'
              : step === 'email'
                ? 'Send Code'
                : step === 'otp'
                  ? 'Verify Code'
                  : 'Reset Password'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    marginVertical: 12,
  },
  subtitle: {
    marginTop: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  step: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  stepLine: {
    height: 2,
    width: 30,
    marginHorizontal: 8,
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  input: {
    marginTop: 8,
  },
  otpInput: {
    fontSize: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  errorAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  submitButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});
