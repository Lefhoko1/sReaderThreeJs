import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { useAppContext } from './AppContext';
import { LandingScreen } from '../screens/LandingScreen';
import { SignupScreen } from '../screens/SignupScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { PasswordResetScreen } from '../screens/PasswordResetScreen';

type AuthFlow = 'landing' | 'login' | 'signup' | 'forgotPassword';

/**
 * AuthStack
 * Shows landing, signup, login, and password reset screens based on authFlow state.
 * Handles switching between authentication screens.
 */
export const AuthStack = observer(() => {
  const { authVM } = useAppContext();
  const [authFlow, setAuthFlow] = useState<AuthFlow>('landing');

  const handleSignupSuccess = () => {
    setAuthFlow('login');
  };

  const handleLoginSuccess = () => {
    // Navigation to app will be handled by root layout detecting isLoggedIn()
  };

  const handlePasswordResetSuccess = () => {
    setAuthFlow('login');
  };

  return (
    <View style={styles.container}>
      {authFlow === 'landing' && (
        <LandingScreen onGetStarted={() => setAuthFlow('login')} />
      )}
      {authFlow === 'login' && (
        <LoginScreen
          onSuccess={handleLoginSuccess}
          onForgotPassword={() => setAuthFlow('forgotPassword')}
          onSignup={() => setAuthFlow('signup')}
        />
      )}
      {authFlow === 'signup' && (
        <SignupScreen
          onSuccess={handleSignupSuccess}
          onLogin={() => setAuthFlow('login')}
        />
      )}
      {authFlow === 'forgotPassword' && (
        <PasswordResetScreen
          onSuccess={handlePasswordResetSuccess}
          onBackToLogin={() => setAuthFlow('login')}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
