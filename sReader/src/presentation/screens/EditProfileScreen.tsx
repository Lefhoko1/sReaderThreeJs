import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { User } from '../../domain/entities/user';

export const EditProfileScreen = observer(({ onCancel, onSuccess }: {
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const user = authVM.currentUser;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!displayName.trim()) {
      newErrors['displayName'] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && user) {
      // Update user data (displayName, phone)
      const updatedUser: User = {
        ...user,
        displayName,
        phone,
        updatedAt: new Date().toISOString(),
      };

      const userResult = await authVM.updateUserProfile(updatedUser);

      if (userResult.ok) {
        // Also update the profile
        const profileResult = await authVM.updateProfile({
          userId: user.id,
          bio: '',
          locationConsent: false,
        });

        if (profileResult.ok) {
          onSuccess();
        }
      }
    }
  };

  if (!user) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ActivityIndicator animating size="large" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text variant="headlineSmall" style={{ color: theme.colors.primary, marginBottom: 4 }}>
            Edit Profile
          </Text>
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
            Update your profile information
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Display Name */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Full Name</Text>
            <TextInput
              mode="outlined"
              label="Your full name"
              value={displayName}
              onChangeText={setDisplayName}
              error={!!errors['displayName']}
              editable={!authVM.loading}
              style={styles.input}
            />
            {errors['displayName'] && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                Name is required
              </Text>
            )}
          </View>

          {/* Email (Read-only) */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Email</Text>
            <TextInput
              mode="outlined"
              label="Your email"
              value={user.email || ''}
              editable={false}
              disabled
              style={styles.input}
            />
            <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              Email cannot be changed
            </Text>
          </View>

          {/* Phone */}
          <View style={styles.fieldContainer}>
            <Text variant="labelLarge">Phone (Optional)</Text>
            <TextInput
              mode="outlined"
              label="Your phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 (555) 000-0000"
              editable={!authVM.loading}
              style={styles.input}
            />
          </View>

          {/* Account Info */}
          <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text variant="labelLarge" style={{ marginBottom: 12, color: theme.colors.onBackground }}>
              Account Information
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>User ID:</Text> {user.id.slice(0, 8)}...
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
              <Text style={{ fontWeight: 'bold' }}>Roles:</Text> {user.roles.join(', ')}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              <Text style={{ fontWeight: 'bold' }}>Member Since:</Text> {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
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

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onCancel}
            disabled={authVM.loading}
            contentStyle={styles.buttonContent}
            style={styles.secondaryButton}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={authVM.loading}
            disabled={authVM.loading}
            contentStyle={styles.buttonContent}
            style={styles.primaryButton}
          >
            {authVM.loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  infoCard: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
