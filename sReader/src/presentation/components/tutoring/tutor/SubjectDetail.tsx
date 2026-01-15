/**
 * Subject/Module Detail View Component
 * Displays detailed information about a tutoring subject
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TutoringSubject } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';

export interface SubjectDetailProps {
  subject: TutoringSubject;
  onBack: () => void;
  onEdit: (subject: TutoringSubject) => void;
  onDelete: (subjectId: ID) => void;
  onManageAssignments?: (subjectId: ID, subjectName: string) => void;
}

export const SubjectDetail: React.FC<SubjectDetailProps> = ({
  subject,
  onBack,
  onEdit,
  onDelete,
  onManageAssignments,
}) => {
  const handleOpenSyllabus = () => {
    if (subject.syllabusUrl) {
      Linking.openURL(subject.syllabusUrl).catch(() => {
        alert('Unable to open syllabus URL');
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Subject Details</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Subject Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileIconContainer}>
          <MaterialCommunityIcons name="book-multiple" size={48} color="#007AFF" />
        </View>

        <Text style={styles.profileName}>{subject.name}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{subject.code}</Text>
          </View>
        </View>

        {subject.description && (
          <Text style={styles.profileDescription}>{subject.description}</Text>
        )}
      </View>

      {/* Academic Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="identifier" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Code</Text>
            <Text style={styles.infoValue}>{subject.code}</Text>
          </View>
        </View>

        {subject.creditHours && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="school" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Credit Hours</Text>
              <Text style={styles.infoValue}>{subject.creditHours}</Text>
            </View>
          </View>
        )}

        {subject.capacity && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="account-multiple" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Capacity</Text>
              <Text style={styles.infoValue}>{subject.capacity} students</Text>
            </View>
          </View>
        )}

        {subject.description && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{subject.description}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Pricing Section */}
      {(subject.costPerMonth || subject.costPerTerm || subject.costPerYear) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>

          {subject.costPerMonth && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Monthly</Text>
                <Text style={styles.priceValue}>${subject.costPerMonth.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {subject.costPerTerm && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Per Term</Text>
                <Text style={styles.priceValue}>${subject.costPerTerm.toFixed(2)}</Text>
              </View>
            </View>
          )}

          {subject.costPerYear && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Per Year</Text>
                <Text style={styles.priceValue}>${subject.costPerYear.toFixed(2)}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Curriculum Section */}
      {(subject.prerequisites || subject.learningOutcomes) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Curriculum</Text>

          {subject.prerequisites && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="list-box-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Prerequisites</Text>
                <Text style={styles.infoValue}>{subject.prerequisites}</Text>
              </View>
            </View>
          )}

          {subject.learningOutcomes && (
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Learning Outcomes</Text>
                <Text style={styles.infoValue}>{subject.learningOutcomes}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Resources Section */}
      {subject.syllabusUrl && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resources</Text>

          <TouchableOpacity
            style={styles.resourceButton}
            onPress={handleOpenSyllabus}
          >
            <MaterialCommunityIcons name="file-pdf-box" size={20} color="#dc3545" />
            <View style={{ flex: 1 }}>
              <Text style={styles.resourceLabel}>Syllabus</Text>
              <Text style={styles.resourceUrl} numberOfLines={1}>
                {subject.syllabusUrl}
              </Text>
            </View>
            <MaterialCommunityIcons name="open-in-new" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Metadata Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(subject.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {onManageAssignments && (
          <TouchableOpacity
            style={[styles.actionButton, styles.assignmentButtonStyle]}
            onPress={() => onManageAssignments(subject.id, subject.name)}
          >
            <MaterialCommunityIcons name="clipboard-check" size={20} color="#fff" />
            <Text style={styles.assignmentButtonText}>Manage Assignments</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.editButtonStyle]}
          onPress={() => onEdit(subject)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#ffc107" />
          <Text style={styles.editButtonText}>Edit Subject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButtonStyle]}
          onPress={() => onDelete(subject.id)}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color="#dc3545" />
          <Text style={styles.deleteButtonText}>Delete Subject</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

SubjectDetail.displayName = 'SubjectDetail';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    textAlign: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    textAlign: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  codeBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  codeBadgeText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  profileDescription: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    lineHeight: 24,
    marginTop: 12,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#212529',
    fontWeight: '500',
    lineHeight: 22,
  },
  priceValue: {
    fontSize: 18,
    color: '#28a745',
    fontWeight: '700',
  },
  resourceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    gap: 12,
  },
  resourceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  resourceUrl: {
    fontSize: 12,
    color: '#6c757d',
  },
  actionSection: {
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  editButtonStyle: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  editButtonText: {
    color: '#ffc107',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonStyle: {
    backgroundColor: '#f8d7da',
    borderWidth: 1,
    borderColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 16,
    fontWeight: '600',
  },
  assignmentButtonStyle: {
    backgroundColor: '#007AFF',
    borderWidth: 1,
    borderColor: '#0056b3',
  },
  assignmentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
