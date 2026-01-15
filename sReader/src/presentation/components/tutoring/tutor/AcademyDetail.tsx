/**
 * Academy Detail View Screen
 * Displays detailed information about a selected tutoring academy
 */

import React from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TutoringAcademy } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';

export interface AcademyDetailProps {
  academy: TutoringAcademy;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageLevels?: () => void;
}

export const AcademyDetail: React.FC<AcademyDetailProps> = ({
  academy,
  onBack,
  onEdit,
  onDelete,
  onManageLevels,
}) => {
  const handleCall = () => {
    if (academy.phone) {
      Linking.openURL(`tel:${academy.phone}`).catch(() => {
        Alert.alert('Error', 'Unable to open phone dialer');
      });
    }
  };

  const handleEmail = () => {
    if (academy.email) {
      Linking.openURL(`mailto:${academy.email}`).catch(() => {
        Alert.alert('Error', 'Unable to open email client');
      });
    }
  };

  const handleWebsite = () => {
    if (academy.websiteUrl) {
      let url = academy.websiteUrl;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open website');
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <MaterialCommunityIcons name="chevron-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academy Details</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Academy Card */}
        <View style={styles.card}>
          {/* Name & Verified Badge */}
          <View style={styles.section}>
            <View style={styles.titleRow}>
              <Text style={styles.academyName}>{academy.name}</Text>
              {academy.isVerified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#28a745" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
          </View>

          {/* Description */}
          {academy.description && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>About</Text>
              <Text style={styles.description}>{academy.description}</Text>
            </View>
          )}

          {/* Location */}
          {academy.location && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#007AFF" />
                <Text style={styles.infoText}>{academy.location}</Text>
              </View>
            </View>
          )}

          {/* Contact Information */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Contact Information</Text>

            {academy.email && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleEmail}
              >
                <MaterialCommunityIcons name="email" size={20} color="#007AFF" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>{academy.email}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}

            {academy.phone && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleCall}
              >
                <MaterialCommunityIcons name="phone" size={20} color="#007AFF" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>{academy.phone}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}

            {academy.websiteUrl && (
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleWebsite}
              >
                <MaterialCommunityIcons name="web" size={20} color="#007AFF" />
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Website</Text>
                  <Text style={styles.contactValue} numberOfLines={1}>
                    {academy.websiteUrl}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            )}
          </View>

          {/* Metadata */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Information</Text>
            <View style={styles.metadataRow}>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Created</Text>
                <Text style={styles.metadataValue}>
                  {new Date(academy.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.metadataItem}>
                <Text style={styles.metadataLabel}>Status</Text>
                <Text style={[styles.metadataValue, { color: academy.isVerified ? '#28a745' : '#ffc107' }]}>
                  {academy.isVerified ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {(onEdit || onDelete || onManageLevels) && (
          <View style={styles.actions}>
            {onManageLevels && (
              <TouchableOpacity
                style={[styles.actionButton, styles.manageLevelsButton]}
                onPress={onManageLevels}
              >
                <MaterialCommunityIcons name="layers-plus" size={20} color="#007AFF" />
                <Text style={styles.manageLevelsButtonText}>Manage Levels</Text>
              </TouchableOpacity>
            )}

            {onEdit && (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
              >
                <MaterialCommunityIcons name="pencil" size={20} color="#ffc107" />
                <Text style={styles.editButtonText}>Edit Academy</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <MaterialCommunityIcons name="trash-can" size={20} color="#dc3545" />
                <Text style={styles.deleteButtonText}>Delete Academy</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  academyName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d4edda',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  verifiedText: {
    color: '#28a745',
    fontWeight: '600',
    fontSize: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 15,
    color: '#495057',
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#495057',
    flex: 1,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  contactInfo: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
  },
  contactValue: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  metadataRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metadataItem: {
    flex: 1,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '500',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  manageLevelsButton: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  manageLevelsButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 15,
  },
  editButton: {
    backgroundColor: '#fff3cd',
    borderWidth: 2,
    borderColor: '#ffc107',
  },
  editButtonText: {
    color: '#ffc107',
    fontWeight: '600',
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: '#f8d7da',
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 15,
  },
});
