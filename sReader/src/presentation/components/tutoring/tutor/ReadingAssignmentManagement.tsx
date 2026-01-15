import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Platform,
  FlatList,
  TextInput,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { readingAssignmentViewModel } from '../../../../application/viewmodels/ReadingAssignmentViewModel';
import { ReadingAssignmentCreation } from '../../assignment/ReadingAssignmentCreation';

interface ReadingAssignmentManagementProps {
  subjectId: string;
  subjectName: string;
  tutorId: string;
  onClose: () => void;
}

/**
 * ReadingAssignmentManagement Component
 * Displays list of reading assignments for a subject/class
 * Allows CRUD operations (Create, Read, Update, Delete)
 */
export const ReadingAssignmentManagement = observer(
  ({ subjectId, subjectName, tutorId, onClose }: ReadingAssignmentManagementProps) => {
    const [showCreation, setShowCreation] = useState(false);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
    const [showAssignmentDetail, setShowAssignmentDetail] = useState(false);
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [filterYear, setFilterYear] = useState<string>('');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [filterDay, setFilterDay] = useState<string>('');

    const vm = readingAssignmentViewModel;

    // Load assignments when component mounts
    useEffect(() => {
      const loadAssignments = async () => {
        await vm.loadAssignmentsBySubject(subjectId);
      };
      loadAssignments();
    }, [subjectId]);

    const handleDeleteAssignment = (assignmentId: string, title: string) => {
      const confirmDelete = () => {
        Alert.alert(
          'Delete Assignment',
          `Are you sure you want to delete "${title}"? This action cannot be undone.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                const success = await vm.deleteAssignment(assignmentId);
                if (success) {
                  Alert.alert('Success', 'Assignment deleted');
                } else {
                  Alert.alert('Error', vm.error || 'Failed to delete assignment');
                }
              },
            },
          ]
        );
      };

      if (Platform.OS === 'web') {
        confirmDelete();
      } else {
        confirmDelete();
      }
    };

    const handleViewAssignment = (assignmentId: string) => {
      setSelectedAssignmentId(assignmentId);
      setShowAssignmentDetail(true);
    };

    const handleAssignmentCreated = async () => {
      setShowCreation(false);
      // Reload assignments
      await vm.loadAssignmentsBySubject(subjectId);
    };

    const handleApplyDateFilter = () => {
      const year = filterYear ? parseInt(filterYear) : undefined;
      const month = filterMonth ? parseInt(filterMonth) : undefined;
      const day = filterDay ? parseInt(filterDay) : undefined;
      
      vm.setDateFilter(year, month, day);
      setShowDateFilter(false);
    };

    const handleClearDateFilter = () => {
      vm.clearDateFilter();
      setFilterYear('');
      setFilterMonth('');
      setFilterDay('');
      setShowDateFilter(false);
    };

    const formatDate = (date: Date | undefined) => {
      if (!date) return 'No due date';
      return new Date(date).toLocaleDateString();
    };

    const filteredAssignments = vm.getFilteredAssignments();

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>📚 Reading Assignments</Text>
            <Text style={styles.headerSubtitle}>{subjectName}</Text>
            <Text style={styles.headerCount}>
              {filteredAssignments.length} of {vm.assignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowDateFilter(true)}
          >
            <Text style={styles.filterButtonText}>📅 Filter by Date</Text>
          </TouchableOpacity>
          {(filterYear || filterMonth || filterDay) && (
            <TouchableOpacity
              style={styles.clearFilterButton}
              onPress={handleClearDateFilter}
            >
              <Text style={styles.clearFilterText}>✕ Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Assignments List */}
        <ScrollView style={styles.content}>
          {vm.isLoading && (
            <View style={styles.centerContent}>
              <Text style={styles.loadingText}>Loading assignments...</Text>
            </View>
          )}

          {!vm.isLoading && vm.assignments.length === 0 && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>📭 No assignments yet</Text>
              <Text style={styles.emptySubtext}>Create your first reading assignment</Text>
            </View>
          )}

          {!vm.isLoading && filteredAssignments.length === 0 && vm.assignments.length > 0 && (
            <View style={styles.centerContent}>
              <Text style={styles.emptyText}>🔍 No assignments match the filter</Text>
            </View>
          )}

          {filteredAssignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <View style={styles.assignmentTitle}>
                  <Text style={styles.assignmentName} numberOfLines={2}>
                    {assignment.title}
                  </Text>
                  <Text style={styles.assignmentMeta}>
                    Created {new Date(assignment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.assignmentActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewAssignment(assignment.id)}
                  >
                    <Text style={styles.actionButtonText}>👁️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteAssignment(assignment.id, assignment.title)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Assignment Details */}
              <View style={styles.assignmentDetails}>
                {assignment.content && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Paragraph:</Text>
                    <Text style={styles.detailValue} numberOfLines={2}>
                      {assignment.content.originalParagraph}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Words with Actions:</Text>
                  <Text style={styles.detailValue}>
                    {vm.getWordsWithActions(assignment.content).length}
                  </Text>
                </View>

                {assignment.durationMinutes && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{assignment.durationMinutes} min</Text>
                  </View>
                )}

                {assignment.dueDate && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Due:</Text>
                    <Text style={styles.detailValue}>{formatDate(assignment.dueDate)}</Text>
                  </View>
                )}

                {assignment.tools && assignment.tools.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Tools:</Text>
                    <Text style={styles.detailValue}>{assignment.tools.join(', ')}</Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          <View style={styles.spacer} />
        </ScrollView>

        {/* Create Assignment Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreation(true)}
          >
            <Text style={styles.createButtonText}>+ Create Assignment</Text>
          </TouchableOpacity>
        </View>

        {/* Date Filter Modal */}
        <Modal
          visible={showDateFilter}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDateFilter(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>📅 Filter by Due Date</Text>
                <TouchableOpacity onPress={() => setShowDateFilter(false)}>
                  <Text style={styles.filterModalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterModalContent}>
                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Year:</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="e.g., 2025"
                    value={filterYear}
                    onChangeText={setFilterYear}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>

                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Month:</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="1-12"
                    value={filterMonth}
                    onChangeText={setFilterMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={styles.filterRow}>
                  <Text style={styles.filterLabel}>Day:</Text>
                  <TextInput
                    style={styles.filterInput}
                    placeholder="1-31"
                    value={filterDay}
                    onChangeText={setFilterDay}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                </View>

                <View style={styles.filterActions}>
                  <TouchableOpacity
                    style={styles.filterApplyButton}
                    onPress={handleApplyDateFilter}
                  >
                    <Text style={styles.filterApplyText}>Apply Filter</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.filterCancelButton}
                    onPress={() => setShowDateFilter(false)}
                  >
                    <Text style={styles.filterCancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Assignment Detail Modal */}
        <Modal
          visible={showAssignmentDetail}
          animationType="slide"
          onRequestClose={() => setShowAssignmentDetail(false)}
        >
          <View style={styles.detailModalContainer}>
            {selectedAssignmentId && vm.assignments.find(a => a.id === selectedAssignmentId) && (
              <ScrollView style={styles.detailContent}>
                {(() => {
                  const assignment = vm.assignments.find(a => a.id === selectedAssignmentId)!;
                  return (
                    <View>
                      {/* Header */}
                      <View style={styles.detailHeader}>
                        <TouchableOpacity onPress={() => setShowAssignmentDetail(false)}>
                          <Text style={styles.detailBackButton}>← Back</Text>
                        </TouchableOpacity>
                        <Text style={styles.detailTitle}>{assignment.title}</Text>
                        <View style={{width: 50}} />
                      </View>

                      {/* Assignment Details */}
                      <View style={styles.detailInfoContainer}>
                        {/* Created Date */}
                        <View style={styles.detailSection}>
                          <Text style={styles.sectionTitle}>📅 Created</Text>
                          <Text style={styles.sectionContent}>
                            {new Date(assignment.createdAt).toLocaleDateString()} at {new Date(assignment.createdAt).toLocaleTimeString()}
                          </Text>
                        </View>

                        {/* Due Date */}
                        {assignment.dueDate && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>📆 Due Date</Text>
                            <Text style={styles.sectionContent}>
                              {formatDate(new Date(assignment.dueDate))}
                            </Text>
                          </View>
                        )}

                        {/* Duration */}
                        {assignment.durationMinutes && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>⏱️ Duration</Text>
                            <Text style={styles.sectionContent}>
                              {assignment.durationMinutes} minutes
                            </Text>
                          </View>
                        )}

                        {/* Paragraph */}
                        {assignment.content?.originalParagraph && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>📝 Paragraph</Text>
                            <Text style={styles.sectionContent}>
                              {assignment.content.originalParagraph}
                            </Text>
                          </View>
                        )}

                        {/* Words with Actions */}
                        <View style={styles.detailSection}>
                          <Text style={styles.sectionTitle}>🎯 Word Actions</Text>
                          <Text style={styles.sectionContent}>
                            {vm.getWordsWithActions(assignment.content).length} word(s) with actions
                          </Text>
                          {vm.getWordsWithActions(assignment.content).map((wa, idx) => (
                            <View key={idx} style={styles.actionItemDetail}>
                              <Text style={styles.actionWordText}>{wa.wordId}</Text>
                              <Text style={styles.actionTypeText}>
                                {wa.action?.type ? wa.action.type.toUpperCase() : 'N/A'}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {/* Tools */}
                        {assignment.tools && assignment.tools.length > 0 && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>🛠️ Tools</Text>
                            <Text style={styles.sectionContent}>
                              {assignment.tools.join(', ')}
                            </Text>
                          </View>
                        )}

                        {/* Description */}
                        {assignment.description && (
                          <View style={styles.detailSection}>
                            <Text style={styles.sectionTitle}>📋 Description</Text>
                            <Text style={styles.sectionContent}>
                              {assignment.description}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })()}
              </ScrollView>
            )}
          </View>
        </Modal>

        {/* Assignment Creation Modal */}
        <Modal
          visible={showCreation}
          animationType="slide"
          onRequestClose={() => setShowCreation(false)}
        >
          <ReadingAssignmentCreation
            tutorId={tutorId}
            subjectId={subjectId}
            onAssignmentCreated={handleAssignmentCreated}
            onClose={() => setShowCreation(false)}
          />
        </Modal>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#bdc3c7',
    marginBottom: 2,
  },
  headerCount: {
    fontSize: 11,
    color: '#95a5a6',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#999',
  },
  assignmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
    overflow: 'hidden',
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  assignmentTitle: {
    flex: 1,
    marginRight: 8,
  },
  assignmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  assignmentMeta: {
    fontSize: 11,
    color: '#999',
  },
  assignmentActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
  },
  deleteButton: {
    backgroundColor: '#fadbd8',
  },
  actionButtonText: {
    fontSize: 16,
  },
  assignmentDetails: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
    width: 100,
  },
  detailValue: {
    flex: 1,
    fontSize: 11,
    color: '#333',
  },
  spacer: {
    height: 20,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    backgroundColor: '#fff',
  },
  createButton: {
    paddingVertical: 12,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ecf0f1',
    borderBottomWidth: 1,
    borderBottomColor: '#bdc3c7',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  filterModalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  filterModalClose: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  filterModalContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  filterRow: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#2c3e50',
  },
  filterActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  filterApplyButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  filterCancelButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#95a5a6',
    borderRadius: 6,
    alignItems: 'center',
  },
  filterCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  detailModalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  detailBackButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  detailInfoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  detailSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  actionItemDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 8,
  },
  actionWordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
  actionTypeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27ae60',
    backgroundColor: '#ecf0f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
