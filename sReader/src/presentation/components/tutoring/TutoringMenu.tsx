/**
 * TutoringMenu Component
 * Horizontal navigation menu for tutoring system
 * Displays different options based on user role (tutor vs student)
 */

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { observer } from 'mobx-react-lite';

export interface TutoringMenuProps {
  userRole: 'TUTOR' | 'STUDENT' | 'ADMIN';
  activeTab?: string;
  onTabChange: (tab: string) => void;
}

export const TutoringMenu: React.FC<TutoringMenuProps> = observer(({
  userRole,
  activeTab = 'home',
  onTabChange,
}) => {
  const { width } = useWindowDimensions();

  // Menu items based on user role
  const getMenuItems = () => {
    if (userRole === 'TUTOR') {
      return [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'academies', label: 'My Academies', icon: '🏫' },
        { id: 'levels', label: 'Levels', icon: '📊' },
        { id: 'subjects', label: 'Subjects', icon: '📚' },
        { id: 'classes', label: 'Classes', icon: '👥' },
        { id: 'requests', label: 'Student Requests', icon: '📋' },
        { id: 'analytics', label: 'Analytics', icon: '📈' },
      ];
    }

    if (userRole === 'STUDENT') {
      return [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'browse', label: 'Browse Academies', icon: '🔍' },
        { id: 'search', label: 'Find Classes', icon: '🎓' },
        { id: 'requests', label: 'My Requests', icon: '📝' },
        { id: 'enrollments', label: 'My Classes', icon: '✅' },
        { id: 'payments', label: 'Payments', icon: '💳' },
      ];
    }

    // Admin role
    return [
      { id: 'home', label: 'Home', icon: '🏠' },
      { id: 'academies', label: 'All Academies', icon: '🏫' },
      { id: 'users', label: 'Users', icon: '👥' },
      { id: 'reports', label: 'Reports', icon: '📊' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];
  };

  const menuItems = getMenuItems();
  const isWeb = width > 768;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              activeTab === item.id && styles.menuItemActive,
            ]}
            onPress={() => onTabChange(item.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.menuLabel,
                activeTab === item.id && styles.menuLabelActive,
              ]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
});

TutoringMenu.displayName = 'TutoringMenu';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    paddingVertical: 0,
  },
  scroll: {
    maxHeight: 70,
  },
  scrollContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    minWidth: 100,
    justifyContent: 'center',
  },
  menuItemActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  menuLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#495057',
    flexWrap: 'wrap',
  },
  menuLabelActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
