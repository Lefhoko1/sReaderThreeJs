/**
 * Enhanced Tutoring Home Screen
 * Beautiful dashboard for students and tutors with staff display
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { Text, Card, Button, Icon, Avatar, Chip, Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../application/viewmodels/TutoringViewModel';
import { ID } from '../../shared/types';

interface EnhancedTutoringHomeProps {
  viewModel: TutoringViewModel;
  userId: ID;
  userName?: string;
  userRole?: 'TUTOR' | 'STUDENT' | 'ADMIN';
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export const EnhancedTutoringHome: React.FC<EnhancedTutoringHomeProps> = observer(
  ({ viewModel, userId, userName = 'Student', userRole = 'STUDENT', onNavigate, onBack }) => {
    const [notificationCount] = useState(3);

    const studentMenuItems = [
      {
        id: 'academyBrowser',
        title: 'Browse Academies',
        description: 'Discover tutoring academies',
        icon: 'magnify',
        color: '#7C6FD3',
      },
      {
        id: 'studentEnrollments',
        title: 'My Enrollment',
        description: 'View your classes',
        icon: 'book-open-page-variant',
        color: '#FF6B6B',
      },
    ];

    const tutorMenuItems = [
      {
        id: 'academyManagement',
        title: 'My Academies',
        description: 'Manage your academies',
        icon: 'school',
        color: '#7C6FD3',
      },
      {
        id: 'levels',
        title: 'Levels',
        description: 'Manage levels',
        icon: 'chart-line',
        color: '#FF6B6B',
      },
    ];

    const menuItems = userRole === 'TUTOR' ? tutorMenuItems : studentMenuItems;

    return (
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Icon source="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Icon source="bell-outline" size={24} color="#fff" />
            {notificationCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Quick Stats Card */}
          {userRole === 'STUDENT' && (
            <View style={styles.statsSection}>
              <Card style={styles.statsCard}>
                <LinearGradient
                  colors={['#7C6FD3', '#5A50A3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statsGradient}
                >
                  <View style={styles.statsContent}>
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>2</Text>
                      <Text style={styles.statLabel}>Active Classes</Text>
                    </View>
                    <Divider style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>84%</Text>
                      <Text style={styles.statLabel}>Attendance</Text>
                    </View>
                    <Divider style={styles.statDivider} />
                    <View style={styles.statBox}>
                      <Text style={styles.statNumber}>3.8</Text>
                      <Text style={styles.statLabel}>GPA</Text>
                    </View>
                  </View>
                </LinearGradient>
              </Card>
            </View>
          )}

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Access</Text>
              <Chip
                icon="arrow-right"
                style={styles.seeAllChip}
                textStyle={{ fontSize: 12 }}
              >
                See All
              </Chip>
            </View>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => onNavigate(item.id)}
                activeOpacity={0.7}
              >
                <Card style={styles.menuCard}>
                  <View style={styles.menuCardContent}>
                    <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
                      <Icon source={item.icon} size={32} color={item.color} />
                    </View>
                    <View style={styles.menuTextContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </View>
                    <Icon source="chevron-right" size={24} color="#ccc" />
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>

          {/* Staff Section - Display staff based on role and academy */}
          <View style={styles.staffSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {userRole === 'STUDENT' ? 'Meet Our Tutors' : 'Your Team'}
              </Text>
            </View>

            <Text style={styles.staffSubtitle}>
              {userRole === 'STUDENT'
                ? 'Expert instructors ready to help'
                : 'Tutors and staff members'}
            </Text>

            {/* Staff Grid */}
            <View style={styles.staffGrid}>
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={styles.staffRole}>Staff profiles coming soon</Text>
              </View>
            </View>
          </View>

          {/* Announcements/News Section */}
          <View style={styles.announcementSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Announcements</Text>
            </View>

            <Card style={styles.announcementCard}>
              <Card.Content>
                <View style={styles.announcementHeader}>
                  <Icon source="bell-alert" size={24} color="#FF6B6B" />
                  <Text style={styles.announcementTitle}>New Courses Available</Text>
                </View>
                <Text style={styles.announcementText}>
                  Check out our new Advanced Physics and Chemistry courses for the upcoming semester.
                </Text>
                <Button
                  mode="text"
                  labelStyle={styles.announcementButtonLabel}
                  onPress={() => onNavigate('academyBrowser')}
                >
                  Explore Now →
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.announcementCard}>
              <Card.Content>
                <View style={styles.announcementHeader}>
                  <Icon source="calendar-check" size={24} color="#7C6FD3" />
                  <Text style={styles.announcementTitle}>Enrollment Deadline</Text>
                </View>
                <Text style={styles.announcementText}>
                  Early bird discounts end on February 28. Register your classes now to get a 20% discount.
                </Text>
                <Button
                  mode="text"
                  labelStyle={styles.announcementButtonLabel}
                  onPress={() => {}}
                >
                  Register Now →
                </Button>
              </Card.Content>
            </Card>
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </SafeAreaView>
    );
  }
);

const { width } = Dimensions.get('window');
const STAFF_CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },

  // Header
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7C6FD3',
    paddingTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  greeting: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  // Scroll Content
  scrollContent: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Stats Section
  statsSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  statsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsGradient: {
    paddingVertical: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },

  // Menu Section
  menuSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  seeAllChip: {
    backgroundColor: '#f0f0f0',
  },
  menuCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  menuCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },
  menuDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },

  // Staff Section
  staffSection: {
    marginBottom: 24,
  },
  staffSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  staffGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  staffCardWrapper: {
    width: STAFF_CARD_WIDTH,
    marginBottom: 12,
  },
  staffCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  staffCardContent: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  staffAvatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#4CAF50',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  staffName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  staffRole: {
    fontSize: 11,
    color: '#7C6FD3',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  staffSpecialization: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'center',
  },
  staffViewButton: {
    marginTop: 8,
  },
  staffViewButtonLabel: {
    fontSize: 11,
    color: '#7C6FD3',
  },

  // Announcement Section
  announcementSection: {
    marginBottom: 24,
  },
  announcementCard: {
    marginBottom: 10,
    borderRadius: 12,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  announcementText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  announcementButtonLabel: {
    fontSize: 12,
    color: '#7C6FD3',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 40,
  },
});
