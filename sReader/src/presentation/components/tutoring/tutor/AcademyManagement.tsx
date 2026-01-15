/**
 * Tutor Academy Management Screen
 * Allows tutors to create, view, and manage their tutoring academies
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
import { useTheme, Card, Button, Snackbar } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';
import { AcademyDetail } from './AcademyDetail';
import { LevelManagement } from './LevelManagement';

export interface AcademyManagementProps {
  viewModel: TutoringViewModel;
  tutorId: ID;
  onBack: () => void;
  onAcademySelect?: (academy: TutoringAcademy) => void;
}

export const AcademyManagement: React.FC<AcademyManagementProps> = observer(({
  viewModel,
  tutorId,
  onBack,
  onAcademySelect,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<TutoringAcademy | null>(null);
  const [selectedAcademyForDetail, setSelectedAcademyForDetail] = useState<TutoringAcademy | null>(null);
  const [managingLevelsFor, setManagingLevelsFor] = useState<TutoringAcademy | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    websiteUrl: '',
  });

  useEffect(() => {
    viewModel.loadMyAcademies(tutorId);
  }, [tutorId]);

  const handleCreateAcademy = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Academy name is required');
      return;
    }

    const result = await viewModel.createAcademy(tutorId, {
      name: formData.name,
      description: formData.description || undefined,
      location: formData.location || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      websiteUrl: formData.websiteUrl || undefined,
    });

    if (result.ok) {
      setFormData({
        name: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        websiteUrl: '',
      });
      setShowCreateForm(false);
      Alert.alert('Success', 'Academy created successfully');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleUpdateAcademy = async () => {
    if (!editingAcademy) return;

    const result = await viewModel.updateAcademy(editingAcademy.id, {
      ...editingAcademy,
      ...formData,
    });

    if (result.ok) {
      setFormData({
        name: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        websiteUrl: '',
      });
      setShowEditForm(false);
      setEditingAcademy(null);
      Alert.alert('Success', 'Academy updated successfully');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleEditAcademy = (academy: TutoringAcademy) => {
    setEditingAcademy(academy);
    setFormData({
      name: academy.name,
      description: academy.description || '',
      location: academy.location || '',
      phone: academy.phone || '',
      email: academy.email || '',
      websiteUrl: academy.websiteUrl || '',
    });
    setShowEditForm(true);
  };

  const handleDeleteAcademy = async (academyId: ID) => {
    // Cross-platform confirmation: web uses window.confirm, mobile uses Alert.alert
    const isWeb = typeof window !== 'undefined';
    
    if (isWeb) {
      // Web: Use native confirm dialog
      const confirmed = window.confirm(
        'Are you sure you want to delete this academy? All associated data will be deleted. This action cannot be undone.'
      );
      
      if (confirmed) {
        console.log('[Component] Delete confirmed, proceeding with deletion for academy:', academyId);
        performDelete(academyId);
      } else {
        console.log('[Component] Delete cancelled by user');
      }
    } else {
      // Mobile: Use React Native Alert
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this academy? All associated data will be deleted.',
        [
          { text: 'Cancel', onPress: () => console.log('[Component] Delete cancelled by user') },
          {
            text: 'Delete',
            onPress: () => {
              console.log('[Component] Delete confirmed, proceeding with deletion for academy:', academyId);
              performDelete(academyId);
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  const performDelete = async (academyId: ID) => {
    try {
      console.log('[Component] Starting async delete for academy:', academyId);
      const result = await viewModel.deleteAcademy(academyId);
      console.log('[Component] Delete result:', result);
      
      if (result.ok) {
        console.log('[Component] Delete successful, reloading academies');
        // Force reload academies
        await viewModel.loadMyAcademies(tutorId);
        alert('Success! Academy deleted successfully');
      } else {
        console.error('[Component] Delete failed:', result.error);
        alert('Error: ' + (result.error || 'Failed to delete academy'));
      }
    } catch (error) {
      console.error('[Component] Delete error:', error);
      alert('Error: An unexpected error occurred while deleting the academy');
    }
  };

  if (viewModel.loading && viewModel.academies.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Show level management if requested
  if (managingLevelsFor) {
    return (
      <LevelManagement
        viewModel={viewModel}
        academy={managingLevelsFor}
        tutorId={tutorId}
        onBack={() => setManagingLevelsFor(null)}
      />
    );
  }

  if (selectedAcademyForDetail) {
    return (
      <AcademyDetail
        academy={selectedAcademyForDetail}
        onBack={() => setSelectedAcademyForDetail(null)}
        onEdit={() => {
          handleEditAcademy(selectedAcademyForDetail);
          setSelectedAcademyForDetail(null);
        }}
        onDelete={() => {
          setSelectedAcademyForDetail(null);
          handleDeleteAcademy(selectedAcademyForDetail.id);
        }}
        onManageLevels={() => {
          setManagingLevelsFor(selectedAcademyForDetail);
          setSelectedAcademyForDetail(null);
        }}
      />
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      scrollEnabled={viewModel.academies.length > 2}
      nestedScrollEnabled={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBack}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>My Academies</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateForm(true)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Academies List */}
      {viewModel.academies.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No academies yet</Text>
          <Text style={styles.emptySubtext}>Create your first tutoring academy</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {viewModel.academies.map((academy: TutoringAcademy) => (
            <View key={academy.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleSection}>
                  <Text style={styles.cardTitle}>{academy.name}</Text>
                  {academy.isVerified && (
                    <Text style={styles.badge}>✓ Verified</Text>
                  )}
                </View>
              </View>

              {academy.description && (
                <Text style={styles.cardDescription}>{academy.description}</Text>
              )}

              <View style={styles.cardInfo}>
                {academy.location && (
                  <Text style={styles.infoText}>📍 {academy.location}</Text>
                )}
                {academy.email && (
                  <Text style={styles.infoText}>✉️ {academy.email}</Text>
                )}
                {academy.phone && (
                  <Text style={styles.infoText}>📞 {academy.phone}</Text>
                )}
              </View>

              <View style={styles.cardActions} pointerEvents="auto">
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.actionButton}
                  onPress={() => {
                    console.log('View pressed for', academy.name);
                    setSelectedAcademyForDetail(academy);
                  }}
                >
                  <Text style={styles.actionButtonText}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => {
                    console.log('Edit pressed for', academy.name);
                    handleEditAcademy(academy);
                  }}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.6}
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => {
                    console.log('Delete pressed for', academy.name);
                    handleDeleteAcademy(academy.id);
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
                {showEditForm ? 'Edit Academy' : 'Create New Academy'}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCreateForm(false);
                  setShowEditForm(false);
                  setFormData({
                    name: '',
                    description: '',
                    location: '',
                    phone: '',
                    email: '',
                    websiteUrl: '',
                  });
                }}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Academy Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Elite Math Academy"
                value={formData.name}
                onChangeText={(text) =>
                  setFormData({ ...formData, name: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell students about your academy..."
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="City or address"
                value={formData.location}
                onChangeText={(text) =>
                  setFormData({ ...formData, location: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="academy@example.com"
                value={formData.email}
                onChangeText={(text) =>
                  setFormData({ ...formData, email: text })
                }
                keyboardType="email-address"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="+1234567890"
                value={formData.phone}
                onChangeText={(text) =>
                  setFormData({ ...formData, phone: text })
                }
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Website</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com"
                value={formData.websiteUrl}
                onChangeText={(text) =>
                  setFormData({ ...formData, websiteUrl: text })
                }
              />
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={showEditForm ? handleUpdateAcademy : handleCreateAcademy}
                disabled={viewModel.loading}
              >
                {viewModel.loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {showEditForm ? 'Update Academy' : 'Create Academy'}
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

AcademyManagement.displayName = 'AcademyManagement';

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
  badge: {
    backgroundColor: '#28a745',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 12,
    fontWeight: '600',
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
