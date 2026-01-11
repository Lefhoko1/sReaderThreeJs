import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Text, Button, IconButton, useTheme, ActivityIndicator, SegmentedButtons, Searchbar } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { FriendshipViewModel } from '../../application/viewmodels/FriendshipViewModel';
import { StudentList } from '../components/StudentCard';
import { FriendRequestList } from '../components/FriendRequestCard';
import { FriendList } from '../components/FriendCard';
import { StudentProfileScreen } from './StudentProfileScreen';

type TabName = 'discover' | 'requests' | 'friends';
type ViewMode = 'list' | 'profile';

interface SelectedProfile {
  studentId: string;
  viewMode: 'profile' | 'request' | 'friend';
  friendshipId?: string;
}

export const FriendsScreen = observer(({ onBack }: { onBack?: () => void }) => {
  const theme = useTheme();
  const { authVM, userRepo, friendshipRepo } = useAppContext();
  const [currentTab, setCurrentTab] = useState<TabName>('discover');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile | null>(null);
  const [friendshipVM] = useState(
    () => new FriendshipViewModel(
      friendshipRepo,
      userRepo
    )
  );
  const [searchQuery, setSearchQuery] = useState('');

  const user = authVM.currentUser;

  // Load data when tab changes
  useEffect(() => {
    if (user && viewMode === 'list') {
      loadTabData(currentTab);
    }
  }, [currentTab, user, viewMode]);

  // Initial load - load all data so counters are populated
  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    await Promise.all([
      friendshipVM.loadStudents(user.id),
      friendshipVM.loadPendingRequests(user.id),
      friendshipVM.loadFriends(user.id),
    ]);
  };

  const loadTabData = async (tab: TabName) => {
    if (!user) return;

    switch (tab) {
      case 'discover':
        await friendshipVM.loadStudents(user.id);
        break;
      case 'requests':
        await friendshipVM.loadPendingRequests(user.id);
        break;
      case 'friends':
        await friendshipVM.loadFriends(user.id);
        break;
    }
  };

  const handleViewProfile = (studentId: string) => {
    setSelectedProfile({
      studentId,
      viewMode: 'profile',
    });
    setViewMode('profile');
  };

  const handleViewRequestProfile = (friendshipId: string, studentId: string) => {
    setSelectedProfile({
      studentId,
      viewMode: 'request',
      friendshipId,
    });
    setViewMode('profile');
  };

  const handleProfileBack = () => {
    setViewMode('list');
    setSelectedProfile(null);
  };

  const handleProfileAction = async () => {
    // After profile action, go back and reload
    handleProfileBack();
    await loadTabData(currentTab);
  };

  const handleAddFriend = async (studentId: string) => {
    if (!user) return;
    const result = await friendshipVM.sendFriendRequest(studentId, user.id);
    if (result.ok) {
      // Reload discover list
      await friendshipVM.loadStudents(user.id);
    }
  };

  const handleAcceptRequest = async (friendshipId: string) => {
    const result = await friendshipVM.acceptRequest(friendshipId);
    if (result.ok) {
      await friendshipVM.loadPendingRequests(user?.id || '');
      await friendshipVM.loadFriends(user?.id || '');
    }
  };

  const handleDeclineRequest = async (friendshipId: string) => {
    const result = await friendshipVM.declineRequest(friendshipId);
    if (result.ok) {
      await friendshipVM.loadPendingRequests(user?.id || '');
    }
  };

  const handleRemoveFriend = async (friendshipId: string) => {
    const result = await friendshipVM.removeFriend(friendshipId);
    if (result.ok) {
      await friendshipVM.loadFriends(user?.id || '');
    }
  };

  if (!user) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.emptyContainer}>
          <Text variant="bodyMedium" style={{ color: '#fff' }}>
            Please login to view friends
          </Text>
        </View>
      </ImageBackground>
    );
  }

  // Show profile screen if viewing a profile
  if (viewMode === 'profile' && selectedProfile) {
    return (
      <StudentProfileScreen
        studentId={selectedProfile.studentId}
        viewMode={selectedProfile.viewMode}
        friendshipId={selectedProfile.friendshipId}
        onBack={handleProfileBack}
        onAction={handleProfileAction}
      />
    );
  }

  const filteredStudents = friendshipVM.students.filter((s) =>
    s.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    if (friendshipVM.loading && (currentTab === 'discover' ? friendshipVM.students.length === 0 : currentTab === 'requests' ? friendshipVM.receivedRequests.length === 0 : friendshipVM.friends.length === 0)) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={{ marginTop: 12, color: theme.colors.onSurface }}>
            Loading...
          </Text>
        </View>
      );
    }

    switch (currentTab) {
      case 'discover':
        return (
          <View style={styles.tabContent}>
            <Searchbar
              placeholder="Search students..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            <StudentList
              students={filteredStudents}
              onAddFriend={handleAddFriend}
              onSelectStudent={handleViewProfile}
              operatingId={friendshipVM.operatingFriendshipId}
            />
          </View>
        );
      case 'requests':
        console.log('📋 Rendering requests tab:', {
          requestsCount: friendshipVM.receivedRequests.length,
          requests: friendshipVM.receivedRequests,
          loading: friendshipVM.loading
        });
        return (
          <View style={styles.tabContent}>
            <FriendRequestList
              requests={friendshipVM.receivedRequests}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
              onViewProfile={(friendshipId) => {
                const request = friendshipVM.receivedRequests.find(r => r.id === friendshipId);
                if (request?.user) {
                  handleViewRequestProfile(friendshipId, request.user.id);
                }
              }}
              operatingId={friendshipVM.operatingFriendshipId}
            />
          </View>
        );
      case 'friends':
        console.log('👥 Rendering friends tab:', {
          friendsCount: friendshipVM.friends.length,
          friends: friendshipVM.friends,
          loading: friendshipVM.loading
        });
        return (
          <View style={styles.tabContent}>
            <FriendList
              friends={friendshipVM.friends}
              onRemove={handleRemoveFriend}
              onViewProfile={(friendshipId, studentId) => {
                setSelectedProfile({
                  studentId,
                  viewMode: 'friend',
                  friendshipId,
                });
                setViewMode('profile');
              }}
              operatingId={friendshipVM.operatingFriendshipId}
            />
          </View>
        );
    }
  };

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
        <Text variant="titleLarge" style={[styles.topBarTitle, { color: '#fff' }]}>
          Friends
        </Text>
      </View>

      {/* Error Message */}
      {friendshipVM.error && (
        <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.error }}>
            {friendshipVM.error}
          </Text>
          <IconButton
            icon="close"
            size={16}
            iconColor={theme.colors.error}
            onPress={() => friendshipVM.clearMessages()}
          />
        </View>
      )}

      {/* Success Message */}
      {friendshipVM.successMessage && (
        <View style={[styles.successContainer, { backgroundColor: theme.colors.secondaryContainer }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.secondary, flex: 1 }}>
            {friendshipVM.successMessage}
          </Text>
          <IconButton
            icon="close"
            size={16}
            iconColor={theme.colors.secondary}
            onPress={() => friendshipVM.clearMessages()}
          />
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={currentTab}
          onValueChange={(value) => setCurrentTab(value as TabName)}
          buttons={[
            { value: 'discover', label: `Discover (${friendshipVM.students.length})` },
            { value: 'requests', label: `Requests (${friendshipVM.receivedRequests.length})` },
            { value: 'friends', label: `Friends (${friendshipVM.friends.length})` },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 4,
  },
  backButton: {
    margin: 0,
  },
  topBarTitle: {
    flex: 1,
    marginLeft: 8,
  },
  tabsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  segmentedButtons: {
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  tabContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  searchbar: {
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
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
