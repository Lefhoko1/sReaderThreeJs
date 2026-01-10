import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, useTheme, Divider, Avatar, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';

export const ProfileScreen = observer(({ onEdit, onLogout, onManageLocation, onBack }: {
  onEdit: () => void;
  onLogout: () => void;
  onManageLocation?: () => void;
  onBack?: () => void;
}) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const user = authVM.currentUser;

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.colors.onBackground }}>No user logged in</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.colors.primary }]}>
        {onBack && (
          <IconButton
            icon="arrow-left"
            iconColor="#fff"
            size={24}
            onPress={onBack}
            style={styles.backButton}
          />
        )}
        <Text variant="titleLarge" style={[styles.topBarTitle, { color: '#fff', flex: 1 }]}>
          My Profile
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
        <Card style={[styles.statusCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
          <Card.Content style={styles.statusContent}>
            <View style={styles.statusRow}>
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
          </Card.Content>
        </Card>

        {/* Location Section */}
        {authVM.currentLocation && (
          <Card style={[styles.locationCard, { backgroundColor: theme.colors.primaryContainer }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.primary} />
                <Text variant="titleMedium" style={[styles.locationTitle, { color: theme.colors.primary, marginLeft: 8 }]}>
                  Your Location
                </Text>
              </View>
              <Divider style={{ marginVertical: 8 }} />
              <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer, marginBottom: 4 }}>
                <Text style={{ fontWeight: 'bold' }}>Coordinates:</Text> {authVM.currentLocation.lat.toFixed(4)}, {authVM.currentLocation.lng.toFixed(4)}
              </Text>
              {authVM.currentLocation.address && (
                <Text variant="bodySmall" style={{ color: theme.colors.onPrimaryContainer }}>
                  <Text style={{ fontWeight: 'bold' }}>Address:</Text> {authVM.currentLocation.address}
                </Text>
              )}
              {onManageLocation && (
                <Button
                  mode="text"
                  compact
                  onPress={onManageLocation}
                  contentStyle={{ marginTop: 8 }}
                  labelStyle={{ color: theme.colors.primary }}
                >
                  Update Location
                </Button>
              )}
            </Card.Content>
          </Card>
        )}

        {!authVM.currentLocation && onManageLocation && (
          <Card style={[styles.noLocationCard, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Card.Content>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialCommunityIcons name="map-marker-off" size={24} color={theme.colors.secondary} />
                <Text variant="titleMedium" style={[{ color: theme.colors.secondary, marginLeft: 8 }]}>
                  No Location Set
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSecondaryContainer, marginBottom: 12 }}>
                Add your location to help us provide better recommendations and connect with nearby tutors.
              </Text>
              <Button
                mode="contained"
                compact
                onPress={onManageLocation}
                contentStyle={{ marginTop: 8 }}
              >
                Add Location
              </Button>
            </Card.Content>
          </Card>
        )}

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
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    elevation: 4,
  },
  backButton: {
    margin: 0,
  },
  topBarTitle: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  profileCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
  },
  locationCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  locationTitle: {
    fontWeight: 'bold',
  },
  noLocationCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
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
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  statusContent: {
    padding: 0,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
