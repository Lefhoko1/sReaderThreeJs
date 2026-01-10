import { observer } from 'mobx-react-lite';
import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Headline, Paragraph, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { useEffect, useState } from 'react';

import { useAppContext } from '@/src/presentation/context/AppContext';

export default observer(function TabTwoScreen() {
  const { authVM, assignmentVM } = useAppContext();
  const [classId] = useState('demo-class-1'); // Mock class ID

  useEffect(() => {
    assignmentVM.loadAssignments(classId);
  }, [classId, assignmentVM]);

  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline>{item.title}</Headline>
        <Paragraph style={styles.description}>{item.description}</Paragraph>
        {item.dueAt && (
          <Paragraph style={styles.dueDate}>
            Due: {new Date(item.dueAt).toLocaleDateString()}
          </Paragraph>
        )}
        <Paragraph style={styles.contentCount}>
          {item.contentBlocks?.length || 0} tasks
        </Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button>View</Button>
      </Card.Actions>
    </Card>
  );

  if (!authVM.isLoggedIn()) {
    return (
      <View style={styles.centerContainer}>
        <Headline>Please register first</Headline>
        <Paragraph>Register in the Home tab to view assignments</Paragraph>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Headline>Assignments</Headline>
        <Paragraph>Class: {classId}</Paragraph>
      </View>

      {assignmentVM.loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : assignmentVM.assignments.length === 0 ? (
        <View style={styles.centerContainer}>
          <Paragraph>No assignments yet. Check back soon!</Paragraph>
        </View>
      ) : (
        <FlatList
          data={assignmentVM.assignments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
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
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 12,
  },
  description: {
    marginTop: 8,
  },
  dueDate: {
    marginTop: 8,
    fontWeight: 'bold',
  },
  contentCount: {
    marginTop: 4,
    fontSize: 12,
  },
});
