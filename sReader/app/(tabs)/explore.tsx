import { observer } from 'mobx-react-lite';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Button, ActivityIndicator, Snackbar, Appbar, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';

import { useAppContext } from '@/src/presentation/context/AppContext';

export default observer(function AssignmentsTab() {
  const { authVM, assignmentVM } = useAppContext();
  const theme = useTheme();
  const [classId] = useState('demo-class-1');

  useEffect(() => {
    assignmentVM.loadAssignments(classId);
  }, [classId, assignmentVM]);

  const renderItem = ({ item }: any) => (
    <Card style={styles.card} mode="elevated" elevation={1}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>{item.title}</Text>
        <Text variant="bodyMedium" style={styles.description}>{item.description}</Text>
        {item.dueAt && (
          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={styles.dueDate}>
              Due: {new Date(item.dueAt).toLocaleDateString()}
            </Text>
            <Text variant="bodySmall" style={styles.taskCount}>
              {item.contentBlocks?.length || 0} tasks
            </Text>
          </View>
        )}
      </Card.Content>
      <Card.Actions>
        <Button mode="text">View Details</Button>
      </Card.Actions>
    </Card>
  );

  if (!authVM.isLoggedIn()) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
          <Appbar.Content title="Assignments" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <Text variant="headlineSmall">Please log in</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Log in from the Home tab to view assignments
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={{ backgroundColor: theme.colors.surface }}>
        <Appbar.Content title="Assignments" />
        <Appbar.Action icon="refresh" onPress={() => assignmentVM.loadAssignments(classId)} />
      </Appbar.Header>

      {assignmentVM.loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : assignmentVM.assignments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text variant="bodyLarge">No assignments yet</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Check back soon!</Text>
        </View>
      ) : (
        <FlatList
          data={assignmentVM.assignments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Snackbar
        visible={!!assignmentVM.error}
        onDismiss={() => assignmentVM.clearError()}
        duration={3000}
      >
        {assignmentVM.error}
      </Snackbar>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    marginTop: 8,
    opacity: 0.7,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: 12,
    opacity: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dueDate: {
    opacity: 0.6,
  },
  taskCount: {
    opacity: 0.6,
  },
});
