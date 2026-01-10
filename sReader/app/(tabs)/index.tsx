import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useAppContext } from '@/src/presentation/context/AppContext';
import { GameDashboard } from '@/src/presentation/screens/GameDashboard';
import { AssignmentsScreen } from '@/src/presentation/screens/AssignmentsScreen';
import { NotificationsScreen } from '@/src/presentation/screens/NotificationsScreen';
import { LeaderboardScreen } from '@/src/presentation/screens/LeaderboardScreen';
import { ResourcesScreen } from '@/src/presentation/screens/ResourcesScreen';
import { ProfileScreen } from '@/src/presentation/screens/ProfileScreen';
import { EditProfileScreen } from '@/src/presentation/screens/EditProfileScreen';

type ScreenName =
  | 'dashboard'
  | 'assignments'
  | 'notifications'
  | 'leaderboard'
  | 'resources'
  | 'profile'
  | 'editProfile'
  | 'friends';

export default observer(function HomeTab() {
  const { authVM } = useAppContext();
  const theme = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');

  if (!authVM.isLoggedIn() || !authVM.currentUser) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.emptyContainer}>
          <Text variant="headlineSmall" style={{ marginBottom: 8, color: '#fff' }}>
            Welcome to sReader
          </Text>
          <Text variant="bodyMedium" style={{ color: '#fff' }}>
            Navigate to login from the sidebar or auth screen
          </Text>
        </View>
      </ImageBackground>
    );
  }

  const handleNavigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('dashboard');
  };

  // Render current screen
  switch (currentScreen) {
    case 'assignments':
      return <AssignmentsScreen onBack={handleBack} />;
    case 'notifications':
      return <NotificationsScreen onBack={handleBack} />;
    case 'leaderboard':
      return <LeaderboardScreen onBack={handleBack} />;
    case 'resources':
      return <ResourcesScreen onBack={handleBack} />;
    case 'profile':
      return (
        <ProfileScreen
          onEdit={() => handleNavigate('editProfile')}
          onLogout={async () => {
            await authVM.logout();
            handleNavigate('dashboard');
          }}
        />
      );
    case 'editProfile':
      return (
        <EditProfileScreen
          onCancel={() => handleNavigate('profile')}
          onSuccess={() => handleNavigate('profile')}
        />
      );
    case 'friends':
      return (
        <ImageBackground
          source={require('@/assets/images/background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <View style={styles.emptyContainer}>
            <Text variant="headlineSmall" style={{ color: '#fff' }}>Friends</Text>
            <Text variant="bodyMedium" style={{ color: '#fff' }}>
              Coming soon...
            </Text>
          </View>
        </ImageBackground>
      );
    case 'dashboard':
    default:
      return <GameDashboard onNavigate={handleNavigate} />;
  }
})
const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
