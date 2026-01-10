import React from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, useTheme } from 'react-native-paper';
import { User } from '../../domain/entities/user';

interface StudentCardProps {
  student: User;
  onAddFriend: () => void;
  onPress?: () => void;
  loading?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onAddFriend,
  onPress,
  loading = false,
}) => {
  const theme = useTheme();

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.cardContent}>
        <TouchableOpacity onPress={onPress} style={styles.studentInfo}>
          {student.avatarUrl ? (
            <Image
              source={{ uri: student.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={styles.avatarText}>
                {student.displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.info}>
            <Text variant="titleMedium" style={styles.name}>
              {student.displayName}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
              {student.email || 'No email'}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onAddFriend}
          disabled={loading}
          style={[styles.addButton, { opacity: loading ? 0.6 : 1 }]}
        >
          <IconButton icon="plus" size={20} />
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );
};

interface StudentListProps {
  students: User[];
  onAddFriend: (studentId: string) => void;
  onSelectStudent?: (studentId: string) => void;
  loading?: boolean;
  operatingId?: string | null;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
}

export const StudentList: React.FC<StudentListProps> = ({
  students,
  onAddFriend,
  onSelectStudent,
  loading = false,
  operatingId = null,
  onEndReached,
  isLoadingMore = false,
}) => {
  if (loading && students.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyMedium">Loading students...</Text>
      </View>
    );
  }

  if (students.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text variant="bodyMedium">No students found</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={students}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <StudentCard
          student={item}
          onAddFriend={() => onAddFriend(item.id)}
          onPress={() => onSelectStudent?.(item.id)}
          loading={operatingId === item.id}
        />
      )}
      contentContainerStyle={styles.listContent}
      scrollEnabled={false}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? (
          <View style={styles.centerContainer}>
            <Text variant="bodySmall">Loading more...</Text>
          </View>
        ) : null
      }
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
  studentInfo: {
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
  addButton: {
    margin: 0,
  },
  listContent: {
    paddingHorizontal: 12,
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
});
