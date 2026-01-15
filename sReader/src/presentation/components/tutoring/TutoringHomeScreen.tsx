/**
 * Tutoring Home Screen
 * Main entry point for tutoring system
 * Provides role-based menu to access tutoring features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '@/src/application/viewmodels/TutoringViewModel';
import { ID } from '@/src/shared/types';

export interface TutoringHomeScreenProps {
  viewModel: TutoringViewModel;
  userId: ID;
  userRole?: 'TUTOR' | 'STUDENT' | 'ADMIN';
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export const TutoringHomeScreen: React.FC<TutoringHomeScreenProps> = observer(({
  viewModel,
  userId,
  userRole = 'STUDENT',
  onNavigate,
  onBack,
}) => {
  const theme = useTheme();

  const tutorOptions = [
    {
      id: 'academyManagement',
      title: 'My Academies',
      description: 'Create and manage your tutoring academies',
      icon: 'school',
      color: theme.colors.primary,
    },
    {
      id: 'levels',
      title: 'Manage Levels',
      description: 'Create grades, years, and educational levels',
      icon: 'chart-line',
      color: theme.colors.secondary,
    },
    {
      id: 'subjects',
      title: 'Manage Subjects',
      description: 'Add courses and modules to your levels',
      icon: 'book-open',
      color: theme.colors.tertiary,
    },
    {
      id: 'classes',
      title: 'Manage Classes',
      description: 'Create classes and set schedules',
      icon: 'door-open',
      color: theme.colors.tertiary,
    },
  ];

  const studentOptions = [
    {
      id: 'academyBrowser',
      title: 'Browse Academies',
      description: 'Search and discover available tutoring academies',
      icon: 'magnify',
      color: theme.colors.primary,
    },
    {
      id: 'studentEnrollments',
      title: 'My Enrollment',
      description: 'View your registration requests and active classes',
      icon: 'checkbox-marked-circle',
      color: theme.colors.secondary,
    },
  ];

  const options = userRole === 'TUTOR' ? tutorOptions : studentOptions;

  const MenuCard = ({ item }: any) => (
    <TouchableOpacity
      onPress={() => onNavigate(item.id)}
      activeOpacity={0.7}
    >
      <Card style={[styles.card, { borderLeftColor: item.color, borderLeftWidth: 4 }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons
              name={item.icon}
              size={40}
              color={item.color}
            />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {item.description}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text variant="headlineMedium" style={styles.title}>
          {userRole === 'TUTOR' ? '🎓 Tutor Hub' : '📚 Student Learning'}
        </Text>
      </View>

      {/* Role Indicator */}
      <Card style={[styles.roleCard, { backgroundColor: theme.colors.primaryContainer }]}>
        <Card.Content style={styles.roleContent}>
          <Text variant="labelMedium" style={{ color: theme.colors.onPrimaryContainer, opacity: 0.8 }}>
            Role
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onPrimaryContainer, marginTop: 4 }}>
            {userRole === 'TUTOR' ? '👨‍🏫 Tutor' : '👨‍🎓 Student'}
          </Text>
        </Card.Content>
      </Card>

      {/* Menu Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <MenuCard key={option.id} item={option} />
        ))}
      </View>

      {/* Loading Indicator */}
      {viewModel.loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      {/* Error Display */}
      {viewModel.error && (
        <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
          <Card.Content>
            <Text style={{ color: theme.colors.error }}>{viewModel.error}</Text>
            <Button
              mode="text"
              onPress={() => viewModel.clearError()}
              style={{ marginTop: 8 }}
            >
              Dismiss
            </Button>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    flex: 1,
    marginLeft: 8,
  },
  roleCard: {
    marginBottom: 16,
  },
  roleContent: {
    padding: 8,
  },
  optionsContainer: {
    gap: 12,
  },
  card: {
    marginBottom: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  loadingContainer: {
    marginVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    marginTop: 16,
  },
});
