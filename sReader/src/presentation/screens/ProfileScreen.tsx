import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Text, Button, Card, useTheme, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

export const ProfileScreen = observer(({ onEdit, onLogout }: {
  onEdit: () => void;
  onLogout: () => void;
}) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const user = authVM.currentUser;

  if (!user) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.emptyContainer}>
          <Text style={{ color: '#fff' }}>No user logged in</Text>
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
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.content}
      >
      {/* Welcome Header */}
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ color: theme.colors.primary, marginBottom: 4 }}>
          Welcome Back!
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
          Here's your profile information
        </Text>
      </View>

      {/* Profile Card */}
      <Card style={[styles.profileCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Card.Content style={styles.profileContent}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <Avatar.Text 
              size={80} 
              label={user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()}
              style={{ backgroundColor: theme.colors.primary }}
            />
          </View>

          {/* Name */}
          <Text variant="headlineSmall" style={[styles.userName, { color: theme.colors.onBackground }]}>
            {user.displayName}
          </Text>

          {/* Email */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              {user.email}
            </Text>
          </View>

          {/* Roles */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="shield-account" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              {user.roles.join(', ')}
            </Text>
          </View>

          {/* Member Since */}
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyMedium" style={[styles.infoText, { color: theme.colors.onSurfaceVariant }]}>
              Joined {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Status */}
      <View style={[styles.statusCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
        <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.tertiary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text variant="labelLarge" style={{ color: theme.colors.tertiary, marginBottom: 2 }}>
            Account Status
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>
            Active & Verified
          </Text>
        </View>
      </View>

      {/* Actions Section */}
      <View style={styles.actionsSection}>
        <Text variant="labelLarge" style={{ color: theme.colors.onBackground, marginBottom: 12 }}>
          Account Actions
        </Text>

        {/* Edit Profile Button */}
        <Button
          mode="outlined"
          icon="pencil"
          onPress={onEdit}
          contentStyle={styles.buttonContent}
          style={styles.actionButton}
        >
          Edit Profile
        </Button>

        {/* Settings Button */}
        <Button
          mode="outlined"
          icon="cog"
          onPress={() => {}} // TODO: Navigate to settings
          contentStyle={styles.buttonContent}
          style={styles.actionButton}
        >
          Settings & Preferences
        </Button>

        {/* Help Button */}
        <Button
          mode="outlined"
          icon="help-circle"
          onPress={() => {}} // TODO: Navigate to help
          contentStyle={styles.buttonContent}
          style={styles.actionButton}
        >
          Help & Support
        </Button>
      </View>

      {/* Danger Zone */}
      <Divider style={{ marginVertical: 24 }} />
      
      <View style={styles.dangerZone}>
        <Text variant="labelLarge" style={{ color: theme.colors.error, marginBottom: 12 }}>
          Danger Zone
        </Text>

        <Button
          mode="outlined"
          icon="logout"
          onPress={onLogout}
          contentStyle={styles.buttonContent}
          textColor={theme.colors.error}
          style={[styles.actionButton, { borderColor: theme.colors.error }]}
        >
          Logout
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
    </ImageBackground>
  );
});

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  profileCard: {
    marginBottom: 20,
    borderRadius: 12,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarSection: {
    marginBottom: 16,
  },
  userName: {
    marginBottom: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  dangerZone: {
    marginTop: 12,
  },
  bottomSpacer: {
    height: 40,
  },
});
