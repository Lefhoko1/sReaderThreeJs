import React, { useState } from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { CompanyProfileModal } from './CompanyProfileModal';

export type ScreenName =
  | 'dashboard'
  | 'assignments'
  | 'notifications'
  | 'leaderboard'
  | 'resources'
  | 'profile'
  | 'editProfile'
  | 'resetPassword'
  | 'location'
  | 'friends'
  | 'tutoring'
  | 'academyManagement'
  | 'academyBrowser'
  | 'studentEnrollments'
  | 'academyMarketplace'
  | 'academyDetails'
  | 'levelBrowser'
  | 'subjectBrowser'
  | 'enhancedTutoringHome'
  | 'studentDashboardMenu'
  | 'enrollmentRequest';

interface AppHeaderProps {
  currentScreen: ScreenName;
  onNavigate: (screen: string) => void;
  onBack: () => void;
  userRole: string;
  unreadNotifications: number;
}

export const AppHeader = ({
  currentScreen,
  onNavigate,
  onBack,
  userRole,
  unreadNotifications,
}: AppHeaderProps) => {
  const theme = useTheme();
  const [companyProfileVisible, setCompanyProfileVisible] = useState(false);

  const getTitleForScreen = (screen: ScreenName): string => {
    const titles: Record<ScreenName, string> = {
      dashboard: userRole === 'TUTOR' ? 'Tutor Hub' : 'My Learning',
      assignments: 'Assignments',
      notifications: 'Notifications',
      leaderboard: 'Leaderboard',
      resources: 'Resources',
      profile: 'Profile',
      editProfile: 'Edit Profile',
      resetPassword: 'Reset Password',
      location: 'Location',
      friends: 'Friends',
      tutoring: 'Tutoring',
      academyManagement: 'My Academies',
      academyBrowser: 'Browse Academies',
      studentEnrollments: 'My Enrollments',
      academyMarketplace: 'Academy Marketplace',
      academyDetails: 'Academy Details',
      levelBrowser: 'Levels',
      subjectBrowser: 'Subjects',
      enhancedTutoringHome: 'Tutoring',
      studentDashboardMenu: 'Student Dashboard',
      enrollmentRequest: 'Enrollment Request',
    };
    return titles[screen];
  };

  return (
    <>
      {/* Company Info Bar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.primary }} elevated>
        <Appbar.Action
          icon="menu-book"
          iconColor={theme.colors.onPrimary}
          onPress={() => setCompanyProfileVisible(true)}
        />
        <Appbar.Content
          title="sReader"
          titleStyle={{ color: theme.colors.onPrimary, fontWeight: '700', fontSize: 18 }}
          subtitle="Learn through Gaming"
          subtitleStyle={{ color: theme.colors.onPrimary, opacity: 0.9, fontSize: 12 }}
        />
        <Appbar.Action
          icon="cog"
          iconColor={theme.colors.onPrimary}
          onPress={() => onNavigate('profile')}
        />
      </Appbar.Header>

      {/* Navigation Bar */}
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated>
        {currentScreen !== 'dashboard' && (
          <Appbar.BackAction onPress={onBack} />
        )}
        <Appbar.Content title={getTitleForScreen(currentScreen)} />
        {currentScreen !== 'profile' && (
          <Appbar.Action
            icon="account-circle"
            onPress={() => onNavigate('profile')}
          />
        )}
        {currentScreen !== 'notifications' && userRole === 'STUDENT' && (
          <Appbar.Action
            icon="bell"
            onPress={() => onNavigate('notifications')}
            {...(unreadNotifications > 0 && { badge: true })}
          />
        )}
        {currentScreen !== 'friends' && userRole === 'STUDENT' && (
          <Appbar.Action
            icon="account-multiple"
            onPress={() => onNavigate('friends')}
          />
        )}
      </Appbar.Header>

      {/* Company Profile Modal */}
      <CompanyProfileModal
        visible={companyProfileVisible}
        onDismiss={() => setCompanyProfileVisible(false)}
      />
    </>
  );
};
