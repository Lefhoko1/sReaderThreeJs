import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { View, StyleSheet, ImageBackground, SafeAreaView, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';

import { useAppContext } from '@/src/presentation/context/AppContext';
import { GameDashboard } from '@/src/presentation/screens/GameDashboard';
import { AssignmentsScreen } from '@/src/presentation/screens/AssignmentsScreen';
import { NotificationsScreen } from '@/src/presentation/screens/NotificationsScreen';
import { LeaderboardScreen } from '@/src/presentation/screens/LeaderboardScreen';
import { ResourcesScreen } from '@/src/presentation/screens/ResourcesScreen';
import { ProfileScreen } from '@/src/presentation/screens/ProfileScreen';
import { EditProfileScreen } from '@/src/presentation/screens/EditProfileScreen';
import { PasswordResetScreen } from '@/src/presentation/screens/PasswordResetScreen';
import { LocationScreen } from '@/src/presentation/screens/LocationScreen';
import { FriendsScreen } from '@/src/presentation/screens/FriendsScreen';
import { TutoringMenu } from '@/src/presentation/components/tutoring/TutoringMenu';
import { TutoringHomeScreen } from '@/src/presentation/components/tutoring/TutoringHomeScreen';
import { AcademyManagement } from '@/src/presentation/components/tutoring/tutor/AcademyManagement';
import { AcademyBrowser } from '@/src/presentation/components/tutoring/student/AcademyBrowser';
import { StudentEnrollments } from '@/src/presentation/components/tutoring/student/StudentEnrollments';
import { AcademyMarketplace } from '@/src/presentation/screens/AcademyMarketplace';
import { AcademyDetails } from '@/src/presentation/screens/AcademyDetails';
import { LevelBrowser } from '@/src/presentation/screens/LevelBrowser';
import { SubjectBrowser } from '@/src/presentation/screens/SubjectBrowser';
import { EnhancedTutoringHome } from '@/src/presentation/screens/EnhancedTutoringHome';
import { StudentDashboardMenu } from '@/src/presentation/screens/StudentDashboardMenu';
import { AcademyEnrollmentRequest } from '@/src/presentation/screens/AcademyEnrollmentRequest';
import { TutoringViewModel } from '@/src/application/viewmodels/TutoringViewModel';
import { SupabaseTutoringRepository } from '@/src/data/supabase/SupabaseTutoringRepository';
import { TutoringAcademy, TutoringLevel } from '@/src/domain/entities/tutoring';
import { AppHeader, ScreenName } from '@/src/presentation/components/navigation/AppHeader';
import { StudentNavigation } from '@/src/presentation/components/navigation/StudentNavigation';
import { TutorNavigation } from '@/src/presentation/components/navigation/TutorNavigation';



export default observer(function HomeTab() {
  const { authVM, dashboardVM } = useAppContext();
  const theme = useTheme();
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('dashboard');
  const [tutoringVM] = useState(() => new TutoringViewModel(new SupabaseTutoringRepository()));
  const [selectedAcademy, setSelectedAcademy] = useState<TutoringAcademy | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<TutoringLevel | null>(null);

  // Determine user role (STUDENT, TUTOR, GUARDIAN, etc.)
  const userRole = authVM.currentUser?.roles?.[0] || 'STUDENT';

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

  // Render current screen content
  const renderScreenContent = () => {
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
          onBack={handleBack}
        />
      );
    case 'editProfile':
      return (
        <EditProfileScreen
          onCancel={() => handleNavigate('profile')}
          onSuccess={() => handleNavigate('profile')}
          onHome={() => handleNavigate('dashboard')}
        />
      );
    case 'resetPassword':
      return (
        <ImageBackground
          source={require('@/assets/images/background.jpg')}
          style={styles.backgroundImage}
          resizeMode="cover"
        >
          <PasswordResetScreen
            onSuccess={() => handleNavigate('dashboard')}
            onBackToLogin={handleBack}
          />
        </ImageBackground>
      );
    case 'location':
      return (
        <LocationScreen
          onCancel={() => handleNavigate('profile')}
          onSuccess={() => handleNavigate('profile')}
        />
      );
    case 'friends':
      return <FriendsScreen onBack={handleBack} />;
    case 'tutoring':
      return (
        <TutoringHomeScreen
          viewModel={tutoringVM}
          userId={authVM.currentUser?.id || ''}
          userRole={userRole as 'TUTOR' | 'STUDENT' | 'ADMIN'}
          onNavigate={handleNavigate}
          onBack={handleBack}
        />
      );
    case 'academyManagement':
      return (
        <AcademyManagement
          viewModel={tutoringVM}
          tutorId={authVM.currentUser?.id || ''}
          onBack={handleBack}
        />
      );
    case 'academyBrowser':
      return (
        <AcademyBrowser
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'studentEnrollments':
      return (
        <StudentEnrollments
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onBack={handleBack}
        />
      );
    case 'academyMarketplace':
      return (
        <AcademyMarketplace
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'academyDetails':
      return selectedAcademy ? (
        <AcademyDetails
          viewModel={tutoringVM}
          academy={selectedAcademy}
          studentId={authVM.currentUser?.id || ''}
          onBack={() => {
            setSelectedAcademy(null);
            handleNavigate('academyMarketplace');
          }}
          onBrowseLevels={() => {
            handleNavigate('levelBrowser');
          }}
          onLevelSelect={(level) => {
            setSelectedLevel(level);
            handleNavigate('subjectBrowser');
          }}
          onRequestEnrollment={(academyId) => {
            handleNavigate('enrollmentRequest');
          }}
        />
      ) : (
        <AcademyMarketplace
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'levelBrowser':
      return selectedAcademy ? (
        <LevelBrowser
          viewModel={tutoringVM}
          academy={selectedAcademy}
          studentId={authVM.currentUser?.id || ''}
          onLevelSelect={(level) => {
            setSelectedLevel(level);
            handleNavigate('subjectBrowser');
          }}
          onBack={() => {
            setSelectedLevel(null);
            handleNavigate('academyDetails');
          }}
        />
      ) : (
        <AcademyMarketplace
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'subjectBrowser':
      return selectedAcademy && selectedLevel ? (
        <SubjectBrowser
          viewModel={tutoringVM}
          academy={selectedAcademy}
          level={selectedLevel}
          studentId={authVM.currentUser?.id || ''}
          onSubjectSelect={(subject) => {
            console.log('Selected subject:', subject);
            // Could navigate to subject details if needed
          }}
          onBack={() => {
            handleNavigate('levelBrowser');
          }}
        />
      ) : (
        <AcademyMarketplace
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'enhancedTutoringHome':
      return (
        <EnhancedTutoringHome
          viewModel={tutoringVM}
          userId={authVM.currentUser?.id || ''}
          userName={authVM.currentUser?.displayName || 'Student'}
          userRole={userRole as 'TUTOR' | 'STUDENT' | 'ADMIN'}
          onNavigate={handleNavigate}
          onBack={handleBack}
        />
      );
    case 'studentDashboardMenu':
      return (
        <StudentDashboardMenu
          userName={authVM.currentUser?.displayName || 'Student'}
          userInitials={authVM.currentUser?.displayName?.substring(0, 2).toUpperCase() || 'ST'}
          level="Grade 10"
          academiesCount={2}
          classesCount={4}
          pendingRequests={1}
          onNavigate={handleNavigate}
        />
      );
    case 'enrollmentRequest':
      return selectedAcademy ? (
        <AcademyEnrollmentRequest
          academy={selectedAcademy}
          levels={tutoringVM.levels}
          subjects={tutoringVM.subjects}
          studentId={authVM.currentUser?.id || ''}
          onSubmit={(data) => {
            console.log('Enrollment request submitted:', data);
            handleNavigate('academyDetails');
          }}
          onCancel={() => handleNavigate('academyDetails')}
        />
      ) : (
        <AcademyMarketplace
          viewModel={tutoringVM}
          studentId={authVM.currentUser?.id || ''}
          onAcademySelect={(academy) => {
            setSelectedAcademy(academy);
            handleNavigate('academyDetails');
          }}
          onBack={handleBack}
        />
      );
    case 'dashboard':
    default:
      return <GameDashboard onNavigate={handleNavigate} />;
    }
  };

  // Render with persistent header and role-based bottom navigation
  return (
    <View style={styles.container}>
      <AppHeader
        currentScreen={currentScreen}
        onNavigate={handleNavigate}
        onBack={handleBack}
        userRole={userRole}
        unreadNotifications={dashboardVM.dashboardData?.unreadNotificationCount || 0}
      />
      <View style={styles.content}>
        {renderScreenContent()}
      </View>
      {userRole === 'STUDENT' ? (
        <StudentNavigation activeRoute={currentScreen} onNavigate={handleNavigate} />
      ) : (
        <TutorNavigation activeRoute={currentScreen} onNavigate={handleNavigate} />
      )}
    </View>
  );
});
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
  },
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
