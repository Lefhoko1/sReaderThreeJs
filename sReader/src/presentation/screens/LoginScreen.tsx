import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, Checkbox, useTheme, ActivityIndicator } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

type LoginFormData = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export const LoginScreen = observer(
  ({ onSuccess, onForgotPassword, onSignup }: {
    onSuccess?: () => void;
    onForgotPassword?: () => void;
    onSignup?: () => void;
  }) => {
    const theme = useTheme();
    const { authVM } = useAppContext();
    const [form, setForm] = useState<LoginFormData>({
      email: '',
      password: '',
      rememberMe: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

    const handleInputChange = (field: keyof LoginFormData, value: string | boolean) => {
      setForm(prev => ({ ...prev, [field]: value }));
    };

    const validateForm = (): boolean => {
      const errors: Record<string, boolean> = {};

      if (!form.email.trim()) {
        errors['email'] = true;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        errors['email'] = true;
      }

      if (!form.password) {
        errors['password'] = true;
      }

      setValidationErrors(errors);
      return Object.keys(errors).length === 0;
    };

    const handleLogin = async () => {
      if (!validateForm()) return;

      const result = await authVM.login(form.email, form.password);

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
              Welcome Back
            </Text>
            <Text variant="bodyMedium" style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
              Sign in to your account
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
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

            {/* Password */}
            <View style={styles.fieldContainer}>
              <View style={styles.passwordHeader}>
                <Text variant="labelLarge">Password</Text>
                <TouchableOpacity
                  onPress={onForgotPassword}
                  disabled={authVM.loading}
                >
                  <Text style={{ color: theme.colors.primary, fontSize: 13 }}>
                    Forgot?
                  </Text>
                </TouchableOpacity>
              </View>
              <TextInput
                mode="outlined"
                label="Enter your password"
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
                  Password is required
                </Text>
              )}
            </View>

            {/* Remember Me */}
            <View style={styles.rememberMeContainer}>
              <Checkbox
                status={form.rememberMe ? 'checked' : 'unchecked'}
                onPress={() => handleInputChange('rememberMe', !form.rememberMe)}
                disabled={authVM.loading}
              />
              <Text variant="bodySmall" style={styles.rememberMeText}>
                Remember me
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
            onPress={handleLogin}
            disabled={authVM.loading}
            loading={authVM.loading}
            contentStyle={styles.buttonContent}
            style={styles.loginButton}
          >
            {authVM.loading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Signup Link */}
          <View style={styles.signupLink}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <TouchableOpacity onPress={onSignup} disabled={authVM.loading}>
              <Text
                style={{
                  color: theme.colors.primary,
                  fontWeight: 'bold',
                }}
              >
                Sign up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.colors.outlineVariant }]} />

          {/* Demo Notice */}
          <View style={[styles.demoNotice, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
              Demo Mode: Any email works. Password: at least 8 characters.
            </Text>
          </View>
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
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    marginBottom: 40,
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
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  rememberMeText: {
    marginLeft: 8,
  },
  errorAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  loginButton: {
    marginBottom: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  divider: {
    height: 1,
    marginVertical: 24,
  },
  demoNotice: {
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
});
