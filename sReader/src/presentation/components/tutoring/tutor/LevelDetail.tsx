/**
 * Level Detail View Component
 * Displays detailed information about a tutoring level
 */

import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TutoringLevel } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';

export interface LevelDetailProps {
  level: TutoringLevel;
  onBack: () => void;
  onEdit: (level: TutoringLevel) => void;
  onDelete: (levelId: ID) => void;
  onManageSubjects?: () => void;
}

export const LevelDetail: React.FC<LevelDetailProps> = ({
  level,
  onBack,
  onEdit,
  onDelete,
  onManageSubjects,
}) => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Level Details</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Level Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileIconContainer}>
          <MaterialCommunityIcons name="layers" size={48} color="#007AFF" />
        </View>

        <Text style={styles.profileName}>{level.name}</Text>
        
        <View style={styles.badgeContainer}>
          <View style={styles.codeBadge}>
            <Text style={styles.codeBadgeText}>{level.code}</Text>
          </View>
        </View>

        {level.description && (
          <Text style={styles.profileDescription}>{level.description}</Text>
        )}
      </View>

      {/* Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Information</Text>

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="identifier" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Code</Text>
            <Text style={styles.infoValue}>{level.code}</Text>
          </View>
        </View>

        {level.description && (
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="file-document-outline" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoValue}>{level.description}</Text>
            </View>
          </View>
        )}

        <View style={styles.infoItem}>
          <MaterialCommunityIcons name="calendar" size={20} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Created</Text>
            <Text style={styles.infoValue}>
              {new Date(level.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {onManageSubjects && (
          <TouchableOpacity
            style={[styles.actionButton, styles.manageSubjectsButton]}
            onPress={onManageSubjects}
          >
            <MaterialCommunityIcons name="book-plus" size={20} color="#007AFF" />
            <Text style={styles.manageSubjectsButtonText}>Manage Subjects</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.editButtonStyle]}
          onPress={() => onEdit(level)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color="#ffc107" />
          <Text style={styles.editButtonText}>Edit Level</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButtonStyle]}
          onPress={() => onDelete(level.id)}
        >
          <MaterialCommunityIcons name="trash-can" size={20} color="#dc3545" />
          <Text style={styles.deleteButtonText}>Delete Level</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

LevelDetail.displayName = 'LevelDetail';

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
  },
  actionSection: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  manageSubjectsButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  manageSubjectsButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
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
});
