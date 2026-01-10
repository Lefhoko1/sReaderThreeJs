import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Checkbox, Snackbar, useTheme, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { Role } from '../../shared/types';

type SignupFormData = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Role;
  agreeToTerms: boolean;
  gradeLevel?: string; // For students
  schoolName?: string; // For students
  yearsOfExperience?: string; // For tutors
};

const ROLE_OPTIONS = [
  { label: 'Student', value: Role.STUDENT },
  { label: 'Guardian', value: Role.GUARDIAN },
  { label: 'Tutor', value: Role.TUTOR },
];

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  [Role.STUDENT]: 'I want to learn and complete assignments',
  [Role.GUARDIAN]: 'I want to manage students\' learning',
  [Role.TUTOR]: 'I want to teach and create academies',
  [Role.ACADEMY_ADMIN]: '',
  [Role.SYS_ADMIN]: '',
};

export const SignupScreen = observer(({ onSuccess, onLogin }: { onSuccess?: () => void; onLogin?: () => void }) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const [form, setForm] = useState<SignupFormData>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: Role.STUDENT,
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};

    if (!form.displayName.trim()) {
      errors['displayName'] = true;
    }
    if (!form.email.trim()) {
      errors['email'] = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors['email'] = true;
    }
    if (!form.password) {
      errors['password'] = true;
    } else if (form.password.length < 8) {
      errors['password'] = true;
    }
    if (!form.confirmPassword) {
      errors['confirmPassword'] = true;
    }
    if (form.password !== form.confirmPassword) {
      errors['confirmPassword'] = true;
    }
    if (!form.agreeToTerms) {
      errors['agreeToTerms'] = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    const result = await authVM.signup({
      displayName: form.displayName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
      gradeLevel: form.gradeLevel,
      schoolName: form.schoolName,
      yearsOfExperience: form.yearsOfExperience ? parseInt(form.yearsOfExperience) : undefined,
    });

    if (result.ok && onSuccess) {
      onSuccess();
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
          <Text variant="headlineLarge" style={styles.title}>
            Create Account
          </Text>
          <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Join our tutoring community
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Full Name</Text>
            <TextInput
              mode="outlined"
              label="John Doe"
              value={form.displayName}
              onChangeText={value => handleInputChange('displayName', value)}
              error={!!validationErrors['displayName']}
              editable={!authVM.loading}
              style={styles.input}
            />
            {validationErrors['displayName'] && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Please enter your full name
              </Text>
            )}
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Email Address</Text>
            <TextInput
              mode="outlined"
              label="you@example.com"
              value={form.email}
              onChangeText={value => handleInputChange('email', value)}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!validationErrors['email']}
              editable={!authVM.loading}
              style={styles.input}
            />
            {validationErrors['email'] && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Please enter a valid email
              </Text>
            )}
          </View>

          {/* Role Selection */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">What's your role?</Text>
            <SegmentedButtons
              value={form.role}
              onValueChange={(value) => handleInputChange('role', value as Role)}
              buttons={ROLE_OPTIONS}
              style={styles.roleButtons}
            />
            <Text variant="bodySmall" style={[styles.roleDescription, { color: theme.colors.onSurfaceVariant }]}>
              {ROLE_DESCRIPTIONS[form.role]}
            </Text>
          </View>

          {/* Role-specific fields for Students */}
          {form.role === Role.STUDENT && (
            <>
              <View style={styles.fieldContainer}>
                <Text variant="labelLarge">Grade Level (Optional)</Text>
                <TextInput
                  mode="outlined"
                  label="e.g., 10th Grade"
                  value={form.gradeLevel || ''}
                  onChangeText={value => handleInputChange('gradeLevel', value)}
                  editable={!authVM.loading}
                  style={styles.input}
                />
              </View>
              <View style={styles.fieldContainer}>
                <Text variant="labelLarge">School Name (Optional)</Text>
                <TextInput
                  mode="outlined"
                  label="Your school name"
                  value={form.schoolName || ''}
                  onChangeText={value => handleInputChange('schoolName', value)}
                  editable={!authVM.loading}
                  style={styles.input}
                />
              </View>
            </>
          )}

          {/* Role-specific fields for Tutors */}
          {form.role === Role.TUTOR && (
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge">Years of Experience (Optional)</Text>
              <TextInput
                mode="outlined"
                label="e.g., 5"
                value={form.yearsOfExperience || ''}
                onChangeText={value => handleInputChange('yearsOfExperience', value)}
                keyboardType="number-pad"
                editable={!authVM.loading}
                style={styles.input}
              />
            </View>
          )}

          {/* Password */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Password</Text>
            <TextInput
              mode="outlined"
              label="Minimum 8 characters"
              value={form.password}
              onChangeText={value => handleInputChange('password', value)}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={authVM.loading}
                />
              }
              error={!!validationErrors['password']}
              editable={!authVM.loading}
              style={styles.input}
            />
            {validationErrors['password'] && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Password must be at least 8 characters
              </Text>
            )}
          </View>

          {/* Confirm Password */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Confirm Password</Text>
            <TextInput
              mode="outlined"
              label="Re-enter your password"
              value={form.confirmPassword}
              onChangeText={value => handleInputChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={authVM.loading}
                />
              }
              error={!!validationErrors['confirmPassword']}
              editable={!authVM.loading}
              style={styles.input}
            />
            {validationErrors['confirmPassword'] && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Passwords must match
              </Text>
            )}
          </View>

          {/* Terms & Conditions */}
          <View style={styles.termsContainer}>
            <Checkbox
              status={form.agreeToTerms ? 'checked' : 'unchecked'}
              onPress={() => handleInputChange('agreeToTerms', !form.agreeToTerms)}
              disabled={authVM.loading}
            />
            <Text
              variant="bodySmall"
              style={[
                styles.termsText,
                validationErrors['agreeToTerms'] && { color: theme.colors.error },
              ]}
            >
              I agree to the{' '}
              <Text style={{ color: theme.colors.primary }}>Terms of Service</Text> and{' '}
              <Text style={{ color: theme.colors.primary }}>Privacy Policy</Text>
            </Text>
          </View>
        </View>

        {/* Error Message */}
        {authVM.error && (
          <View style={[styles.errorAlert, { backgroundColor: theme.colors.errorContainer }]}>
            <Text style={{ color: theme.colors.error }}>⚠ {authVM.error}</Text>
          </View>
        )}

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSignup}
          disabled={authVM.loading}
          loading={authVM.loading}
          contentStyle={styles.buttonContent}
          style={styles.submitButton}
        >
          {authVM.loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <View style={styles.loginLink}>
          <Text variant="bodyMedium">Already have an account? </Text>
          <TouchableOpacity disabled={authVM.loading} onPress={onLogin}>
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: 'bold',
              }}
            >
              Login here
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

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
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
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
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  roleButtons: {
    marginTop: 12,
  },
  roleDescription: {
    marginTop: 8,
    fontStyle: 'italic',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  termsText: {
    flex: 1,
    marginLeft: 8,
    lineHeight: 20,
  },
  errorAlert: {
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
});
