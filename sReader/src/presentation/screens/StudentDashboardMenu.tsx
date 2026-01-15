/**
 * Student Dashboard Navigation Menu
 * Beautiful, functional navigation for student to access all features
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { Text, Card, Icon, Avatar, Divider, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  badge?: number;
  onPress: () => void;
}

interface StudentDashboardMenuProps {
  userName: string;
  userInitials: string;
  level: string;
  academiesCount: number;
  classesCount: number;
  pendingRequests: number;
  onNavigate: (screen: string) => void;
}

export const StudentDashboardMenu: React.FC<StudentDashboardMenuProps> = ({
  userName,
  userInitials,
  level,
  academiesCount,
  classesCount,
  pendingRequests,
  onNavigate,
}) => {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const academyItems: MenuItem[] = [
    {
      id: 'academy-browser',
      title: 'Discover Academies',
      description: 'Search and explore academies',
      icon: 'magnify',
      color: '#7C6FD3',
      onPress: () => onNavigate('academyBrowser'),
    },
    {
      id: 'browse-levels',
      title: 'Browse Levels',
      description: 'View available courses',
      icon: 'chart-line',
      color: '#FF6B6B',
      onPress: () => onNavigate('browseLevels'),
    },
    {
      id: 'browse-subjects',
      title: 'Browse Subjects',
      description: 'Explore course offerings',
      icon: 'book-open-page-variant',
      color: '#4ECDC4',
      onPress: () => onNavigate('browseSubjects'),
    },
  ];

  const enrollmentItems: MenuItem[] = [
    {
      id: 'my-enrollments',
      title: 'My Enrollments',
      description: 'View active classes',
      icon: 'checkbox-marked-circle',
      color: '#7C6FD3',
      badge: classesCount,
      onPress: () => onNavigate('studentEnrollments'),
    },
    {
      id: 'enrollment-requests',
      title: 'Pending Requests',
      description: 'Registration requests',
      icon: 'clock-outline',
      color: '#FFA726',
      badge: pendingRequests,
      onPress: () => onNavigate('enrollmentRequests'),
    },
    {
      id: 'enrolled-academies',
      title: 'My Academies',
      description: 'Academies you joined',
      icon: 'school',
      color: '#66BB6A',
      badge: academiesCount,
      onPress: () => onNavigate('myAcademies'),
    },
  ];

  const learningItems: MenuItem[] = [
    {
      id: 'my-schedule',
      title: 'My Schedule',
      description: 'Class schedule & calendar',
      icon: 'calendar-month',
      color: '#7C6FD3',
      onPress: () => Alert.alert('Info', 'View your class schedule'),
    },
    {
      id: 'assignments',
      title: 'Assignments',
      description: 'Homework and tasks',
      icon: 'clipboard-list',
      color: '#FF6B6B',
      onPress: () => onNavigate('assignments'),
    },
    {
      id: 'grades',
      title: 'Grades',
      description: 'View your academic performance',
      icon: 'chart-pie',
      color: '#4ECDC4',
      onPress: () => Alert.alert('Info', 'View your grades'),
    },
  ];

  const profileItems: MenuItem[] = [
    {
      id: 'my-profile',
      title: 'My Profile',
      description: 'Edit profile information',
      icon: 'account-circle',
      color: '#7C6FD3',
      onPress: () => onNavigate('profile'),
    },
    {
      id: 'preferences',
      title: 'Preferences',
      description: 'Notification & privacy settings',
      icon: 'cog',
      color: '#FFA726',
      onPress: () => Alert.alert('Info', 'Manage preferences'),
    },
    {
      id: 'support',
      title: 'Support',
      description: 'Get help and contact us',
      icon: 'help-circle',
      color: '#66BB6A',
      onPress: () => Alert.alert('Info', 'Contact support'),
    },
  ];

  const MenuCategory = ({
    title,
    items,
    categoryId,
    icon,
  }: {
    title: string;
    items: MenuItem[];
    categoryId: string;
    icon: string;
  }) => {
    const isExpanded = expandedCategory === categoryId;

    return (
      <View style={styles.categoryContainer}>
        <TouchableOpacity
          onPress={() =>
            setExpandedCategory(isExpanded ? null : categoryId)
          }
          activeOpacity={0.7}
        >
          <Card style={styles.categoryHeader}>
            <View style={styles.categoryHeaderContent}>
              <View
                style={[
                  styles.categoryIconWrapper,
                  { backgroundColor: '#7C6FD320' },
                ]}
              >
                <Icon source={icon} size={28} color="#7C6FD3" />
              </View>
              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>{title}</Text>
                <Text style={styles.categoryCount}>
                  {items.length} options available
                </Text>
              </View>
              <Icon
                source={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#ccc"
              />
            </View>
          </Card>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.categoryItems}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <Card style={styles.menuItem}>
                  <View style={styles.menuItemContent}>
                    <View
                      style={[
                        styles.itemIconWrapper,
                        { backgroundColor: `${item.color}20` },
                      ]}
                    >
                      <Icon
                        source={item.icon}
                        size={24}
                        color={item.color}
                      />
                    </View>
                    <View style={styles.itemTextContent}>
                      <Text style={styles.itemTitle}>{item.title}</Text>
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                    </View>
                    {item.badge ? (
                      <View style={styles.badgeWrapper}>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: item.color },
                          ]}
                        >
                          <Text style={styles.badgeText}>
                            {item.badge}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Icon
                        source="chevron-right"
                        size={20}
                        color="#ccc"
                      />
                    )}
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Avatar.Text size={60} label={userInitials} />
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Welcome,</Text>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userLevel}>{level}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <QuickStat
          icon="school"
          label="Enrolled"
          value={academiesCount.toString()}
        />
        <Divider style={styles.statDivider} />
        <QuickStat
          icon="book-open"
          label="Classes"
          value={classesCount.toString()}
        />
        <Divider style={styles.statDivider} />
        <QuickStat
          icon="clock"
          label="Pending"
          value={pendingRequests.toString()}
        />
      </View>

      {/* Menu Content */}
      <ScrollView
        style={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        <MenuCategory
          title="Discover & Browse"
          items={academyItems}
          categoryId="academies"
          icon="magnify"
        />

        <MenuCategory
          title="My Enrollment"
          items={enrollmentItems}
          categoryId="enrollment"
          icon="clipboard-check"
        />

        <MenuCategory
          title="Learning"
          items={learningItems}
          categoryId="learning"
          icon="book-multiple"
        />

        <MenuCategory
          title="Profile & Settings"
          items={profileItems}
          categoryId="profile"
          icon="account"
        />

        {/* Featured Banner */}
        <Card style={styles.featuredBanner}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E72']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bannerGradient}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                🎉 New Academies Added
              </Text>
              <Text style={styles.bannerText}>
                Explore 5 new tutoring academies this month
              </Text>
              <Button
                mode="contained"
                style={styles.bannerButton}
                labelStyle={styles.bannerButtonLabel}
                onPress={() => onNavigate('academyBrowser')}
              >
                Explore Now
              </Button>
            </View>
          </LinearGradient>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Quick Stat Component
 */
interface QuickStatProps {
  icon: string;
  label: string;
  value: string;
}

const QuickStat: React.FC<QuickStatProps> = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <Icon source={icon} size={24} color="#7C6FD3" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#7C6FD3',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginTop: 2,
  },
  userLevel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#eee',
  },

  // Menu Content
  menuContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Category
  categoryContainer: {
    marginBottom: 12,
  },
  categoryHeader: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  categoryIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  categoryCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  // Menu Items
  categoryItems: {
    paddingLeft: 8,
    paddingRight: 0,
    marginTop: 8,
    gap: 8,
  },
  menuItem: {
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  itemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTextContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  itemDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  badgeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Featured Banner
  featuredBanner: {
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  bannerContent: {
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  bannerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    textAlign: 'center',
  },
  bannerButton: {
    marginTop: 12,
    backgroundColor: '#fff',
  },
  bannerButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B6B',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 40,
  },
});
