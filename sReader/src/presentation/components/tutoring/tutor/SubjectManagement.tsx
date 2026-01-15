/**
 * Tutor Subject/Module Management Screen
 * Allows tutors to create, view, and manage subjects within levels
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../../../application/viewmodels/TutoringViewModel';
import { TutoringSubject, TutoringLevel, TutoringAcademy } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';
import { SubjectDetail } from './SubjectDetail';
import { ReadingAssignmentManagement } from './ReadingAssignmentManagement';

export interface SubjectManagementProps {
  viewModel: TutoringViewModel;
  academy: TutoringAcademy;
  level: TutoringLevel;
  tutorId: ID;
  onBack: () => void;
}

export const SubjectManagement: React.FC<SubjectManagementProps> = observer(({
  viewModel,
  academy,
  level,
  tutorId,
  onBack,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<TutoringSubject | null>(null);
  const [selectedSubjectForDetail, setSelectedSubjectForDetail] = useState<TutoringSubject | null>(null);
  const [showAssignmentManagement, setShowAssignmentManagement] = useState(false);
  const [selectedSubjectForAssignments, setSelectedSubjectForAssignments] = useState<{ id: ID; name: string } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    creditHours: '',
    costPerMonth: '',
    costPerTerm: '',
    costPerYear: '',
    capacity: '',
    syllabusUrl: '',
    prerequisites: '',
    learningOutcomes: '',
  });

  useEffect(() => {
    viewModel.loadSubjectsByLevelId(level.id);
  }, [level.id]);

  const handleCreateSubject = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Error: Subject name and code are required');
      return;
    }

    const result = await viewModel.createSubject(academy.id, level.id, {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      creditHours: formData.creditHours ? parseInt(formData.creditHours) : undefined,
      costPerMonth: formData.costPerMonth ? parseFloat(formData.costPerMonth) : undefined,
      costPerTerm: formData.costPerTerm ? parseFloat(formData.costPerTerm) : undefined,
      costPerYear: formData.costPerYear ? parseFloat(formData.costPerYear) : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      syllabusUrl: formData.syllabusUrl || undefined,
      prerequisites: formData.prerequisites || undefined,
      learningOutcomes: formData.learningOutcomes || undefined,
    });

    if (result.ok) {
      setFormData({
        name: '',
        code: '',
        description: '',
        creditHours: '',
        costPerMonth: '',
        costPerTerm: '',
        costPerYear: '',
        capacity: '',
        syllabusUrl: '',
        prerequisites: '',
        learningOutcomes: '',
      });
      setShowCreateForm(false);
      alert('Success! Subject created successfully');
    } else {
      alert('Error: ' + (result.error || 'Failed to create subject'));
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject) return;

    const result = await viewModel.updateSubject(editingSubject.id, {
      ...editingSubject,
      ...formData,
      creditHours: formData.creditHours ? parseInt(formData.creditHours) : undefined,
      costPerMonth: formData.costPerMonth ? parseFloat(formData.costPerMonth) : undefined,
      costPerTerm: formData.costPerTerm ? parseFloat(formData.costPerTerm) : undefined,
      costPerYear: formData.costPerYear ? parseFloat(formData.costPerYear) : undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
    });

    if (result.ok) {
      setFormData({
        name: '',
        code: '',
        description: '',
        creditHours: '',
        costPerMonth: '',
        costPerTerm: '',
        costPerYear: '',
        capacity: '',
        syllabusUrl: '',
        prerequisites: '',
        learningOutcomes: '',
      });
      setShowEditForm(false);
      setEditingSubject(null);
      alert('Success! Subject updated successfully');
    } else {
      alert('Error: ' + (result.error || 'Failed to update subject'));
    }
  };

  const handleViewSubject = (subject: TutoringSubject) => {
    setSelectedSubjectForDetail(subject);
  };

  const handleEditSubject = (subject: TutoringSubject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      description: subject.description || '',
      creditHours: subject.creditHours?.toString() || '',
      costPerMonth: subject.costPerMonth?.toString() || '',
      costPerTerm: subject.costPerTerm?.toString() || '',
      costPerYear: subject.costPerYear?.toString() || '',
      capacity: subject.capacity?.toString() || '',
      syllabusUrl: subject.syllabusUrl || '',
      prerequisites: subject.prerequisites || '',
      learningOutcomes: subject.learningOutcomes || '',
    });
    setShowEditForm(true);
  };

  const handleDeleteSubject = async (subjectId: ID) => {
    // Cross-platform confirmation: web uses window.confirm, mobile uses Alert.alert
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web: Use native confirm dialog
      const confirmed = window.confirm(
        'Are you sure you want to delete this subject? All associated classes will be deleted. This action cannot be undone.'
      );
      
      if (confirmed) {
        console.log('[Component] Delete confirmed, proceeding with deletion for subject:', subjectId);
        performDelete(subjectId);
      } else {
        console.log('[Component] Delete cancelled by user');
      }
    } else {
      // Mobile: Use React Native Alert
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this subject? All associated classes will be deleted.',
        [
          { text: 'Cancel', onPress: () => console.log('[Component] Delete cancelled by user') },
          {
            text: 'Delete',
            onPress: () => {
              console.log('[Component] Delete confirmed, proceeding with deletion for subject:', subjectId);
              performDelete(subjectId);
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const performDelete = async (subjectId: ID) => {
    try {
      console.log('[Component] Starting async delete for subject:', subjectId);
      const result = await viewModel.deleteSubject(subjectId);
      console.log('[Component] Delete result:', result);
      
      if (result.ok) {
        console.log('[Component] Delete successful, reloading subjects');
        // Force reload subjects
        await viewModel.loadSubjectsByLevelId(level.id);
        alert('Success! Subject deleted successfully');
      } else {
        console.error('[Component] Delete failed:', result.error);
        alert('Error: ' + (result.error || 'Failed to delete subject'));
      }
    } catch (error) {
      console.error('[Component] Delete error:', error);
      alert('Error: An unexpected error occurred while deleting the subject');
    }
  };

  // Show detail view if subject selected
  if (selectedSubjectForDetail) {
    return (
      <SubjectDetail
        subject={selectedSubjectForDetail}
        onBack={() => setSelectedSubjectForDetail(null)}
        onEdit={handleEditSubject}
        onDelete={handleDeleteSubject}
        onManageAssignments={(subjectId, subjectName) => {
          setSelectedSubjectForDetail(null); // Clear detail view
          setSelectedSubjectForAssignments({ id: subjectId, name: subjectName });
          setShowAssignmentManagement(true);
        }}
      />
    );
  }

  // Show assignment management if selected
  if (showAssignmentManagement && selectedSubjectForAssignments) {
    return (
      <ReadingAssignmentManagement
        subjectId={selectedSubjectForAssignments.id}
        subjectName={selectedSubjectForAssignments.name}
        tutorId={tutorId}
        onClose={() => {
          setShowAssignmentManagement(false);
          setSelectedSubjectForAssignments(null);
        }}
      />
    );
  }

  if (viewModel.loading && viewModel.subjects.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6c757d' }}>Loading subjects...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} scrollEnabled={viewModel.subjects.length > 2} nestedScrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Subjects</Text>
        <TouchableOpacity
          onPress={() => {
            setShowCreateForm(true);
            setFormData({
              name: '',
              code: '',
              description: '',
              creditHours: '',
              costPerMonth: '',
              costPerTerm: '',
              costPerYear: '',
              capacity: '',
              syllabusUrl: '',
              prerequisites: '',
              learningOutcomes: '',
            });
          }}
          style={styles.createButton}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Context Info */}
      <View style={{ backgroundColor: '#e3f2fd', padding: 16, marginHorizontal: 12, marginVertical: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 12, color: '#1976d2', fontWeight: '600' }}>Academy:</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#212529' }}>{academy.name}</Text>
        <Text style={{ fontSize: 12, color: '#1976d2', fontWeight: '600', marginTop: 8 }}>Level:</Text>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#212529' }}>{level.name} ({level.code})</Text>
      </View>

      {/* Subjects List */}
      {viewModel.subjects.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="book-open-outline" size={48} color="#dee2e6" />
          <Text style={styles.emptyText}>No subjects yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first subject</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {viewModel.subjects.map((subject) => (
            <View key={subject.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleSection}>
                  <MaterialCommunityIcons name="book-multiple" size={24} color="#007AFF" />
                  <Text style={styles.cardTitle}>{subject.name}</Text>
                </View>
              </View>

              {subject.description && (
                <Text style={styles.cardDescription}>{subject.description}</Text>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: '600' }}>Code:</Text> {subject.code}
                </Text>
                {subject.creditHours && (
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '600' }}>Credits:</Text> {subject.creditHours}
                  </Text>
                )}
                {(subject.costPerMonth || subject.costPerTerm || subject.costPerYear) && (
                  <View style={{ marginTop: 4 }}>
                    <Text style={{ fontWeight: '600', color: '#6c757d', fontSize: 13 }}>Pricing:</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                      {subject.costPerMonth && (
                        <Text style={styles.infoText}>
                          Monthly: ${subject.costPerMonth.toFixed(2)}
                        </Text>
                      )}
                      {subject.costPerTerm && (
                        <Text style={styles.infoText}>
                          Term: ${subject.costPerTerm.toFixed(2)}
                        </Text>
                      )}
                      {subject.costPerYear && (
                        <Text style={styles.infoText}>
                          Year: ${subject.costPerYear.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton]}
                  onPress={() => handleViewSubject(subject)}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    console.log('Edit pressed for', subject.name);
                    handleEditSubject(subject);
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    console.log('Delete pressed for', subject.name);
                    handleDeleteSubject(subject.id);
                  }}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Create/Edit Modal */}
      <Modal
        visible={showCreateForm || showEditForm}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {showEditForm ? 'Edit Subject' : 'Create New Subject'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setFormData({
                    name: '',
                    code: '',
                    description: '',
                    creditHours: '',
                    costPerMonth: '',
                    costPerTerm: '',
                    costPerYear: '',
                    capacity: '',
                    syllabusUrl: '',
                    prerequisites: '',
                    learningOutcomes: '',
                  });
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Basic Information */}
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Mathematics, English"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Code *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., MATH101, ENG201"
                value={formData.code}
                onChangeText={(text) =>
                  setFormData({ ...formData, code: text.toUpperCase() })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe this subject..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Academic Information */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Academic Information</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Credit Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 3"
                value={formData.creditHours}
                onChangeText={(text) =>
                  setFormData({ ...formData, creditHours: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Capacity</Text>
              <TextInput
                style={styles.input}
                placeholder="Max students, e.g., 30"
                value={formData.capacity}
                onChangeText={(text) =>
                  setFormData({ ...formData, capacity: text })
                }
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Prerequisites</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Grade 9 or equivalent"
                value={formData.prerequisites}
                onChangeText={(text) =>
                  setFormData({ ...formData, prerequisites: text })
                }
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Learning Outcomes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What students will learn..."
                value={formData.learningOutcomes}
                onChangeText={(text) =>
                  setFormData({ ...formData, learningOutcomes: text })
                }
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Pricing Information */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pricing</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cost Per Month</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 50.00"
                value={formData.costPerMonth}
                onChangeText={(text) =>
                  setFormData({ ...formData, costPerMonth: text })
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cost Per Term</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 150.00"
                value={formData.costPerTerm}
                onChangeText={(text) =>
                  setFormData({ ...formData, costPerTerm: text })
                }
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Cost Per Year</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500.00"
                value={formData.costPerYear}
                onChangeText={(text) =>
                  setFormData({ ...formData, costPerYear: text })
                }
                keyboardType="decimal-pad"
              />
            </View>

            {/* Resources */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Resources</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Syllabus URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/syllabus.pdf"
                value={formData.syllabusUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, syllabusUrl: text })
                }
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={showEditForm ? handleUpdateSubject : handleCreateSubject}
                disabled={viewModel.loading}
              >
                {viewModel.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {showEditForm ? 'Update Subject' : 'Create Subject'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Success/Error Messages */}
      {viewModel.successMessage && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>✓ {viewModel.successMessage}</Text>
        </View>
      )}

      {viewModel.error && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>✕ {viewModel.error}</Text>
        </View>
      )}
    </ScrollView>
  );
});

SubjectManagement.displayName = 'SubjectManagement';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
  list: {
    padding: 12,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
  },
  cardDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 12,
    lineHeight: 20,
  },
  cardInfo: {
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#6c757d',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#e7f3ff',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  editButton: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  actionButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 13,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 13,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '95%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
  },
  closeButton: {
    fontSize: 28,
    color: '#6c757d',
    fontWeight: '300',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    marginTop: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212529',
  },
  textArea: {
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  formActions: {
    marginTop: 24,
    marginBottom: 40,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
    padding: 12,
    margin: 12,
    borderRadius: 4,
  },
  successText: {
    color: '#155724',
    fontWeight: '600',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    padding: 12,
    margin: 12,
    borderRadius: 4,
  },
  errorText: {
    color: '#721c24',
    fontWeight: '600',
  },
});
