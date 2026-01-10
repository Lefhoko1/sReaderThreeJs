import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, useTheme, Button } from 'react-native-paper';
import { FriendshipWithUser } from '../../application/viewmodels/FriendshipViewModel';
import { User } from '../../domain/entities/user';

interface FriendRequestCardProps {
  friendship: FriendshipWithUser;
  user?: User;
  onAccept: () => void;
  onDecline: () => void;
  onViewProfile?: () => void;
  loading?: boolean;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  friendship,
  user,
  onAccept,
  onDecline,
  onViewProfile,
  loading = false,
}) => {
  const theme = useTheme();
  const displayUser = user || friendship.user;

  if (!displayUser) return null;

  const handleProfilePress = () => {
    onViewProfile?.();
  };

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.7}>
          <View style={styles.requesterInfo}>
            {displayUser.avatarUrl ? (
              <Image
                source={{ uri: displayUser.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
                <Text style={styles.avatarText}>
                  {displayUser.displayName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.info}>
              <Text variant="titleMedium" style={styles.name}>
                {displayUser.displayName}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                Wants to add you as a friend
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={onAccept}
            disabled={loading}
            style={styles.acceptButton}
          >
            Accept
          </Button>
          <Button
            mode="outlined"
            onPress={onDecline}
            disabled={loading}
            style={styles.declineButton}
          >
            Decline
          </Button>
        </View>
      </Card.Content>
    </Card>
  );
};

interface FriendRequestListProps {
  requests: FriendshipWithUser[];
  onAccept: (friendshipId: string) => void;
  onDecline: (friendshipId: string) => void;
  onViewProfile?: (friendshipId: string) => void;
  loading?: boolean;
  operatingId?: string | null;
}

export const FriendRequestList: React.FC<FriendRequestListProps> = ({
  requests,
  onAccept,
  onDecline,
  onViewProfile,
  loading = false,
  operatingId = null,
}) => {
  if (requests.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium">No friend requests</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendRequestCard
          friendship={item}
          user={item.user}
          onAccept={() => onAccept(item.id)}
          onViewProfile={() => onViewProfile?.(item.id)}
          onDecline={() => onDecline(item.id)}
          loading={operatingId === item.id}
        />
      )}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  cardContent: {
    paddingVertical: 12,
  },
  requesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
});
