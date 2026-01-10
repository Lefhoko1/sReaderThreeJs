import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { FriendshipWithUser } from '../../application/viewmodels/FriendshipViewModel';
import { User } from '../../domain/entities/user';

interface FriendCardProps {
  friendship: FriendshipWithUser;
  user?: User;
  onRemove: () => void;
  loading?: boolean;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friendship,
  user,
  onRemove,
  loading = false,
}) => {
  const theme = useTheme();
  const displayUser = user || friendship.user;

  if (!displayUser) return null;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.friendInfo}>
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
              {displayUser.email || 'No email'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          disabled={loading}
          style={[styles.removeButton, { opacity: loading ? 0.6 : 1 }]}
        >
          <IconButton icon="close" size={20} iconColor="#ff6b6b" />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

interface FriendListProps {
  friends: FriendshipWithUser[];
  onRemove: (friendshipId: string) => void;
  loading?: boolean;
  operatingId?: string | null;
}

export const FriendList: React.FC<FriendListProps> = ({
  friends,
  onRemove,
  loading = false,
  operatingId = null,
}) => {
  if (friends.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyMedium">No friends yet</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={friends}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <FriendCard
          friendship={item}
          user={item.user}
          onRemove={() => onRemove(item.id)}
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
    marginBottom: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  removeButton: {
    margin: 0,
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
