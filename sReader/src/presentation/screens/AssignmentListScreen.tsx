/**
 * AssignmentListScreen
 * Displays list of assignments for a class.
 * Single responsibility: render and paginate assignment list.
 */

import React, { useEffect } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { observer } from 'mobx-react-lite';
import { Card, Paragraph, Headline } from 'react-native-paper';
import { useAppContext } from '../../presentation/context/AppContext';
import { LoadingSpinner, ErrorAlert } from '../../presentation/components';

interface AssignmentListScreenProps {
  classId: string;
}

export const AssignmentListScreen = observer(({ classId }: AssignmentListScreenProps) => {
  const { assignmentVM } = useAppContext();

  useEffect(() => {
    assignmentVM.loadAssignments(classId);
  }, [classId, assignmentVM]);

  const renderItem = ({ item }: any) => (
    <Card style={styles.card}>
      <Card.Content>
        <Headline>{item.title}</Headline>
        <Paragraph>{item.description}</Paragraph>
        {item.dueAt && <Paragraph>Due: {new Date(item.dueAt).toLocaleDateString()}</Paragraph>}
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={assignmentVM.assignments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (assignmentVM.currentPage * assignmentVM.pageSize < assignmentVM.total) {
            assignmentVM.loadAssignments(classId, assignmentVM.currentPage + 1);
          }
        }}
      />

      <ErrorAlert
        visible={!!assignmentVM.error}
        message={assignmentVM.error || ''}
        onDismiss={() => assignmentVM.clearError()}
      />

      <LoadingSpinner visible={assignmentVM.loading} />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 12,
    marginHorizontal: 8,
  },
});
