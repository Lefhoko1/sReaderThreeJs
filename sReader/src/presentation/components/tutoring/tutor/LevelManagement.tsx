/**
 * Tutor Level Management Screen
 * Allows tutors to create, view, and manage levels within their academies
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
import { TutoringLevel, TutoringAcademy } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';
import { LevelDetail } from './LevelDetail';
import { SubjectManagement } from './SubjectManagement';

export interface LevelManagementProps {
  viewModel: TutoringViewModel;
  academy: TutoringAcademy;
  tutorId: ID;
  onBack: () => void;
}

export const LevelManagement: React.FC<LevelManagementProps> = observer(({
  viewModel,
  academy,
  tutorId,
  onBack,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<TutoringLevel | null>(null);
  const [selectedLevelForDetail, setSelectedLevelForDetail] = useState<TutoringLevel | null>(null);
  const [managingSubjectsFor, setManagingSubjectsFor] = useState<TutoringLevel | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
  });

  useEffect(() => {
    viewModel.loadLevelsByAcademyId(academy.id);
  }, [academy.id]);

  const handleCreateLevel = async () => {
    if (!formData.name.trim() || !formData.code.trim()) {
      alert('Error: Level name and code are required');
      return;
    }

    const result = await viewModel.createLevel(academy.id, {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
    });

    if (result.ok) {
      setFormData({
        name: '',
        code: '',
        description: '',
      });
      setShowCreateForm(false);
      alert('Success! Level created successfully');
    } else {
      alert('Error: ' + (result.error || 'Failed to create level'));
    }
  };

  const handleUpdateLevel = async () => {
    if (!editingLevel) return;

    const result = await viewModel.updateLevel(editingLevel.id, {
      ...editingLevel,
      ...formData,
    });

    if (result.ok) {
      setFormData({
        name: '',
        code: '',
        description: '',
      });
      setShowEditForm(false);
      setEditingLevel(null);
      alert('Success! Level updated successfully');
    } else {
      alert('Error: ' + (result.error || 'Failed to update level'));
    }
  };

  const handleViewLevel = (level: TutoringLevel) => {
    setSelectedLevelForDetail(level);
  };

  const handleEditLevel = (level: TutoringLevel) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      code: level.code,
      description: level.description || '',
    });
    setShowEditForm(true);
  };

  const handleDeleteLevel = async (levelId: ID) => {
    // Cross-platform confirmation: web uses window.confirm, mobile uses Alert.alert
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web: Use native confirm dialog
      const confirmed = window.confirm(
        'Are you sure you want to delete this level? All associated subjects and classes will be deleted. This action cannot be undone.'
      );
      
      if (confirmed) {
        console.log('[Component] Delete confirmed, proceeding with deletion for level:', levelId);
        performDelete(levelId);
      } else {
        console.log('[Component] Delete cancelled by user');
      }
    } else {
      // Mobile: Use React Native Alert
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this level? All associated subjects and classes will be deleted.',
        [
          { text: 'Cancel', onPress: () => console.log('[Component] Delete cancelled by user') },
          {
            text: 'Delete',
            onPress: () => {
              console.log('[Component] Delete confirmed, proceeding with deletion for level:', levelId);
              performDelete(levelId);
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const performDelete = async (levelId: ID) => {
    try {
      console.log('[Component] Starting async delete for level:', levelId);
      const result = await viewModel.deleteLevel(levelId);
      console.log('[Component] Delete result:', result);
      
      if (result.ok) {
        console.log('[Component] Delete successful, reloading levels');
        // Force reload levels
        await viewModel.loadLevelsByAcademyId(academy.id);
        alert('Success! Level deleted successfully');
      } else {
        console.error('[Component] Delete failed:', result.error);
        alert('Error: ' + (result.error || 'Failed to delete level'));
      }
    } catch (error) {
      console.error('[Component] Delete error:', error);
      alert('Error: An unexpected error occurred while deleting the level');
    }
  };

  // Show subject management if requested
  if (managingSubjectsFor) {
    return (
      <SubjectManagement
        viewModel={viewModel}
        academy={academy}
        level={managingSubjectsFor}
        tutorId={tutorId}
        onBack={() => setManagingSubjectsFor(null)}
      />
    );
  }

  // Show detail view if level selected
  if (selectedLevelForDetail) {
    return (
      <LevelDetail
        level={selectedLevelForDetail}
        onBack={() => setSelectedLevelForDetail(null)}
        onEdit={handleEditLevel}
        onDelete={handleDeleteLevel}
        onManageSubjects={() => {
          setManagingSubjectsFor(selectedLevelForDetail);
          setSelectedLevelForDetail(null);
        }}
      />
    );
  }

  if (viewModel.loading && viewModel.levels.length === 0) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: '#6c757d' }}>Loading levels...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} scrollEnabled={viewModel.levels.length > 2} nestedScrollEnabled={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Levels</Text>
        <TouchableOpacity
          onPress={() => {
            setShowCreateForm(true);
            setFormData({ name: '', code: '', description: '' });
          }}
          style={styles.createButton}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Academy Info */}
      <View style={{ backgroundColor: '#e3f2fd', padding: 16, marginHorizontal: 12, marginVertical: 12, borderRadius: 8 }}>
        <Text style={{ fontSize: 14, color: '#1976d2', fontWeight: '600' }}>Academy:</Text>
        <Text style={{ fontSize: 16, fontWeight: '700', color: '#212529', marginTop: 4 }}>{academy.name}</Text>
      </View>

      {/* Levels List */}
      {viewModel.levels.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="folder-open-outline" size={48} color="#dee2e6" />
          <Text style={styles.emptyText}>No levels yet</Text>
          <Text style={styles.emptySubtext}>Tap + to create your first level</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {viewModel.levels.map((level) => (
            <View key={level.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleSection}>
                  <MaterialCommunityIcons name="layers" size={24} color="#007AFF" />
                  <Text style={styles.cardTitle}>{level.name}</Text>
                </View>
              </View>

              {level.description && (
                <Text style={styles.cardDescription}>{level.description}</Text>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: '600' }}>Code:</Text> {level.code}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton]}
                  onPress={() => handleViewLevel(level)}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    console.log('Edit pressed for', level.name);
                    handleEditLevel(level);
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    console.log('Delete pressed for', level.name);
                    handleDeleteLevel(level.id);
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
                {showEditForm ? 'Edit Level' : 'Create New Level'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setFormData({
                    name: '',
                    code: '',
                    description: '',
                  });
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Level Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Grade 10, Advanced"
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
                placeholder="e.g., GR10, ADV"
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
                placeholder="Describe this level..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={showEditForm ? handleUpdateLevel : handleCreateLevel}
                disabled={viewModel.loading}
              >
                {viewModel.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {showEditForm ? 'Update Level' : 'Create Level'}
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

LevelManagement.displayName = 'LevelManagement';

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
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    maxHeight: '90%',
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
