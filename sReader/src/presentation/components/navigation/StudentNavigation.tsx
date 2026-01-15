import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BottomNavigation, Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface StudentNavigationProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export const StudentNavigation = ({ activeRoute, onNavigate }: StudentNavigationProps) => {
  const theme = useTheme();

  const navigationItems = [
    { key: 'dashboard', title: 'Home', icon: 'home' },
    { key: 'assignments', title: 'Assignments', icon: 'clipboard-list' },
    { key: 'leaderboard', title: 'Leaderboard', icon: 'trophy' },
    { key: 'profile', title: 'Profile', icon: 'account' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.navContainer}>
        {navigationItems.map((item) => (
          <View key={item.key} style={styles.navItem}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={24}
              color={
                activeRoute === item.key
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant
              }
              onPress={() => onNavigate(item.key)}
              style={styles.iconButton}
            />
            <Text
              variant="labelSmall"
              style={[
                styles.label,
                {
                  color:
                    activeRoute === item.key
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                },
              ]}
            >
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 8,
  },
  label: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
  },
});
