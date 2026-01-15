/**
 * Student Academy Browser
 * Allows students to search and browse available academies, levels, subjects, and classes
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
  FlatList,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy, TutoringSubject, ClassSchedule } from '../../../../domain/entities/tutoring';
import { ID } from '../../../../shared/types';

export interface AcademyBrowserProps {
  viewModel: TutoringViewModel;
  studentId: ID;
  onSubjectSelect?: (subjectData: TutoringSubject) => void;
  onAcademySelect?: (academy: TutoringAcademy) => void;
  onBack?: () => void;
}

export const AcademyBrowser: React.FC<AcademyBrowserProps> = observer(({
  viewModel,
  studentId,
  onSubjectSelect,
  onAcademySelect,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState<TutoringAcademy | null>(null);
  const [showSubjectDetails, setShowSubjectDetails] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<TutoringSubject | null>(null);
  const [subjectCapacity, setSubjectCapacity] = useState<{
    capacity: number;
    enrolled: number;
    available: number;
  } | null>(null);

  useEffect(() => {
    viewModel.loadAllAcademies();
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      await viewModel.searchAcademies(query);
    } else {
      await viewModel.loadAllAcademies();
    }
  };

  const displayedAcademies = searchQuery.trim() ? viewModel.searchResults : viewModel.academies;

  // Class-based logic removed - using subjects instead via LevelBrowser/SubjectBrowser
  const handleSubjectPress = async (subject: TutoringSubject) => {
    onSubjectSelect?.(subject);
  };

  const handleRequestRegistration = async (subject: TutoringSubject) => {
    if (!selectedAcademy) return;

    // For now, show a simple dialog
    // In a real app, you'd navigate to a detailed registration form
    Alert.alert(
      'Register for Subject',
      `You're about to request registration for ${subject.name}.\n\nCost: ${
        subject.costPerMonth
          ? `$${subject.costPerMonth}/month`
          : subject.costPerTerm
          ? `$${subject.costPerTerm}/term`
          : subject.costPerYear
          ? `$${subject.costPerYear}/year`
          : 'Contact academy'
      }`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Request Registration',
          onPress: async () => {
            const result = await viewModel.createRegistrationRequest(
              studentId,
              subject.id,
              {
                academyId: selectedAcademy?.id || '',
                levelId: subject.levelId,
                subjectId: subject.id,
                costTerm: 'MONTHLY',
                costAmount: subject.costPerMonth,
              }
            );

            if (result.ok) {
              Alert.alert(
                'Success',
                'Your registration request has been sent. The academy will review it shortly.'
              );
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const renderAcademyCard = ({ item: academy }: { item: TutoringAcademy }) => (
    <TouchableOpacity
      style={styles.academyCard}
      onPress={() => {
        console.log('[AcademyBrowser] Academy card pressed for:', academy.name);
        viewModel.selectAcademy(academy);
        onAcademySelect?.(academy);
      }}
    >
      <View style={styles.academyCardHeader}>
        <Text style={styles.academyName}>{academy.name}</Text>
        {academy.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
      </View>

      {academy.description && (
        <Text style={styles.academyDescription} numberOfLines={2}>
          {academy.description}
        </Text>
      )}

      <View style={styles.academyMeta}>
        {academy.location && (
          <Text style={styles.metaText}>📍 {academy.location}</Text>
        )}
        {academy.phone && (
          <Text style={styles.metaText}>📞 {academy.phone}</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.browseButton}
        onPress={(e) => {
          e.stopPropagation();
          console.log('[AcademyBrowser] Browse Levels pressed for academy:', academy.name);
          viewModel.selectAcademy(academy);
          onAcademySelect?.(academy);
        }}
      >
        <Text style={styles.browseButtonText}>Browse Levels →</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSubjectCard = ({ item: subject }: { item: TutoringSubject }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => handleSubjectPress(subject)}
    >
      <View style={styles.classHeader}>
        <Text style={styles.className}>{subject.name}</Text>
        {subject.platform && (
          <Text style={styles.platformBadge}>
            {subject.platform === 'ONLINE' ? '💻' : subject.platform === 'IN_PERSON' ? '📍' : '🔀'}
          </Text>
        )}
      </View>

      {subject.description && (
        <Text style={styles.classDescription} numberOfLines={2}>
          {subject.description}
        </Text>
      )}

      <View style={styles.classMeta}>
        {subject.schedule && (
          <Text style={styles.scheduleText}>
            📅 {(subject.schedule as ClassSchedule).days?.join(', ') || 'Check schedule'}
          </Text>
        )}
      </View>

      <View style={styles.costSection}>
        {subject.costPerMonth && (
          <Text style={styles.costText}>${subject.costPerMonth}/month</Text>
        )}
        {subject.costPerTerm && (
          <Text style={styles.costText}>${subject.costPerTerm}/term</Text>
        )}
        {subject.costPerYear && (
          <Text style={styles.costText}>${subject.costPerYear}/year</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => handleSubjectPress(subject)}
      >
        <Text style={styles.detailsButtonText}>Enroll Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerBackButton}>
          <Text style={styles.headerBackText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Academies</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Header */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search academies..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#999"
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text style={styles.clearButton}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Content */}
      {selectedAcademy ? (
        // Academy Detail View
        <ScrollView style={styles.detailView}>
          <View style={styles.academyDetail}>
            <TouchableOpacity
              onPress={() => setSelectedAcademy(null)}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Back to Academies</Text>
            </TouchableOpacity>

            <Text style={styles.detailTitle}>{selectedAcademy.name}</Text>

            {selectedAcademy.description && (
              <Text style={styles.detailDescription}>
                {selectedAcademy.description}
              </Text>
            )}

            <View style={styles.detailInfo}>
              {selectedAcademy.location && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📍 Location</Text>
                  <Text style={styles.infoValue}>{selectedAcademy.location}</Text>
                </View>
              )}
              {selectedAcademy.email && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>✉️ Email</Text>
                  <Text style={styles.infoValue}>{selectedAcademy.email}</Text>
                </View>
              )}
              {selectedAcademy.phone && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>📞 Phone</Text>
                  <Text style={styles.infoValue}>{selectedAcademy.phone}</Text>
                </View>
              )}
              {selectedAcademy.websiteUrl && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>🌐 Website</Text>
                  <Text style={styles.infoValue}>{selectedAcademy.websiteUrl}</Text>
                </View>
              )}
            </View>

            <Text style={styles.classesTitle}>Available Subjects</Text>
            {viewModel.subjects.length === 0 ? (
              <Text style={styles.noClassesText}>
                No subjects available yet. Check back soon!
              </Text>
            ) : (
              <FlatList
                data={viewModel.subjects}
                renderItem={renderSubjectCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      ) : (
        // Academy List View
        <FlatList
          data={displayedAcademies}
          renderItem={renderAcademyCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {viewModel.loading ? 'Loading...' : 'No academies found'}
              </Text>
              {!viewModel.loading && (
                <Text style={styles.emptySubtext}>
                  Try a different search or check back later
                </Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
});

AcademyBrowser.displayName = 'AcademyBrowser';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchHeader: {
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#212529',
  },
  clearButton: {
    fontSize: 18,
    color: '#999',
    marginLeft: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  academyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  academyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  academyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 18,
    color: '#28a745',
  },
  academyDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 10,
    lineHeight: 18,
  },
  academyMeta: {
    marginBottom: 12,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#6c757d',
  },
  browseButton: {
    backgroundColor: '#e7f3ff',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  browseButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
  detailView: {
    flex: 1,
  },
  academyDetail: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  infoRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
  },
  classesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
    marginTop: 20,
  },
  noClassesText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 20,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
  },
  platformBadge: {
    fontSize: 16,
  },
  classDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  classMeta: {
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 12,
    color: '#6c757d',
  },
  costSection: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  costText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#28a745',
  },
  detailsButton: {
    backgroundColor: '#e7f3ff',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  detailsButtonText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 13,
  },
  detailsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 20,
    justifyContent: 'flex-end',
  },
  detailsContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  closeDetails: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  closeDetailsText: {
    fontSize: 24,
    color: '#6c757d',
    fontWeight: '300',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212529',
    marginBottom: 12,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsInfo: {
    marginBottom: 16,
  },
  costBreakdown: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  costOption: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
  },
});
