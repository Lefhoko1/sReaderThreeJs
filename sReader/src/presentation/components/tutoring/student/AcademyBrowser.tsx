/**
 * Student Academy Browser
 * Allows students to search and browse available academies, levels, subjects, and classes
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { Text, useTheme, Button, Card, IconButton } from 'react-native-paper';
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
  const theme = useTheme();
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
    <Card
      style={[styles.academyCard, { backgroundColor: theme.colors.primaryContainer }]}
      mode="elevated"
      onPress={() => {
        console.log('[AcademyBrowser] Academy card pressed for:', academy.name);
        viewModel.selectAcademy(academy);
        onAcademySelect?.(academy);
      }}
    >
      <Card.Content>
        <View style={styles.academyCardHeader}>
          <Text variant="titleMedium" style={[styles.academyName, { color: theme.colors.onSurface }]}>
            {academy.name}
          </Text>
          {academy.isVerified && (
            <Text style={[styles.verifiedBadge, { color: theme.colors.primary }]}>✓</Text>
          )}
        </View>

        {academy.description && (
          <Text variant="bodySmall" style={[styles.academyDescription, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {academy.description}
          </Text>
        )}

        <View style={styles.academyMeta}>
          {academy.location && (
            <Text variant="labelSmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              📍 {academy.location}
            </Text>
          )}
          {academy.phone && (
            <Text variant="labelSmall" style={[styles.metaText, { color: theme.colors.onSurfaceVariant }]}>
              📞 {academy.phone}
            </Text>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode="contained-tonal"
          onPress={(e) => {
            e.stopPropagation();
            console.log('[AcademyBrowser] Browse Levels pressed for academy:', academy.name);
            viewModel.selectAcademy(academy);
            setSelectedAcademy(academy);
            onAcademySelect?.(academy);
          }}
        >
          Browse Levels
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderSubjectCard = ({ item: subject }: { item: TutoringSubject }) => (
    <Card
      style={[styles.classCard, { backgroundColor: theme.colors.secondaryContainer }]}
      mode="elevated"
      onPress={() => handleSubjectPress(subject)}
    >
      <Card.Content>
        <View style={styles.classHeader}>
          <Text variant="titleSmall" style={[styles.className, { color: theme.colors.onSurface }]}>
            {subject.name}
          </Text>
          {subject.platform && (
            <Text style={styles.platformBadge}>
              {subject.platform === 'ONLINE' ? '💻' : subject.platform === 'IN_PERSON' ? '📍' : '🔀'}
            </Text>
          )}
        </View>

        {subject.description && (
          <Text variant="bodySmall" style={[styles.classDescription, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
            {subject.description}
          </Text>
        )}

        <View style={styles.classMeta}>
          {subject.schedule && (
            <Text variant="labelSmall" style={[styles.scheduleText, { color: theme.colors.onSurfaceVariant }]}>
              📅 {(subject.schedule as ClassSchedule).days?.join(', ') || 'Check schedule'}
            </Text>
          )}
        </View>

        <View style={[styles.costSection, { backgroundColor: theme.colors.tertiaryContainer }]}>
          {subject.costPerMonth && (
            <Text variant="labelMedium" style={[styles.costText, { color: theme.colors.onSecondaryContainer, fontWeight: '600' }]}>
              ${subject.costPerMonth}/month
            </Text>
          )}
          {subject.costPerTerm && (
            <Text variant="labelMedium" style={[styles.costText, { color: theme.colors.onSecondaryContainer, fontWeight: '600' }]}>
              ${subject.costPerTerm}/term
            </Text>
          )}
          {subject.costPerYear && (
            <Text variant="labelMedium" style={[styles.costText, { color: theme.colors.onSecondaryContainer, fontWeight: '600' }]}>
              ${subject.costPerYear}/year
            </Text>
          )}
        </View>
      </Card.Content>

      <Card.Actions>
        <Button
          mode="contained"
          onPress={() => handleRequestRegistration(subject)}
        >
          Enroll Now
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={true}>
      {/* Search Header - removed Appbar.Header as it's now in the persistent header */}
      {!selectedAcademy && (
        <View style={[styles.searchHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.surfaceVariant }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.colors.secondaryContainer }]}>
            <Text style={styles.searchIcon}>🔍</Text>
            <Text
              style={[styles.searchInput, { color: theme.colors.onSurface }]}
              placeholder="Search academies..."
            />
            {searchQuery !== '' && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Text style={styles.clearButton}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Main Content */}
      {selectedAcademy ? (
        // Academy Detail View
        <ScrollView style={styles.detailView} nestedScrollEnabled={true} scrollEventThrottle={16}>
          <View style={styles.academyDetail}>
            <Button
              mode="text"
              onPress={() => setSelectedAcademy(null)}
              contentStyle={styles.backButtonContent}
              labelStyle={styles.backButtonLabel}
            >
              ← Back to Academies
            </Button>

            <Text variant="headlineMedium" style={[styles.detailTitle, { color: theme.colors.onSurface }]}>
              {selectedAcademy.name}
            </Text>

            {selectedAcademy.description && (
              <Text variant="bodyMedium" style={[styles.detailDescription, { color: theme.colors.onSurfaceVariant }]}>
                {selectedAcademy.description}
              </Text>
            )}

            <Card style={[styles.detailInfo, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                {selectedAcademy.location && (
                  <View style={[styles.infoRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      📍 Location
                    </Text>
                    <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {selectedAcademy.location}
                    </Text>
                  </View>
                )}
                {selectedAcademy.email && (
                  <View style={[styles.infoRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      ✉️ Email
                    </Text>
                    <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {selectedAcademy.email}
                    </Text>
                  </View>
                )}
                {selectedAcademy.phone && (
                  <View style={[styles.infoRow, { borderBottomColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      📞 Phone
                    </Text>
                    <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {selectedAcademy.phone}
                    </Text>
                  </View>
                )}
                {selectedAcademy.websiteUrl && (
                  <View style={[styles.infoRow, { borderBottomWidth: 0, borderBottomColor: theme.colors.surfaceVariant }]}>
                    <Text variant="labelSmall" style={[styles.infoLabel, { color: theme.colors.onSurfaceVariant }]}>
                      🌐 Website
                    </Text>
                    <Text variant="bodySmall" style={[styles.infoValue, { color: theme.colors.onSurface }]}>
                      {selectedAcademy.websiteUrl}
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            <Text variant="titleLarge" style={[styles.classesTitle, { color: theme.colors.onSurface }]}>
              Available Subjects
            </Text>
            {viewModel.subjects.length === 0 ? (
              <Text variant="bodyMedium" style={[styles.noClassesText, { color: theme.colors.onSurfaceVariant }]}>
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
          renderItem={({ item }) => renderAcademyCard({ item, index: 0 })}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={[styles.emptyTitle, { color: theme.colors.onSurfaceVariant }]}>
                {viewModel.loading ? 'Loading academies...' : 'No academies found'}
              </Text>
              {!viewModel.loading && (
                <Text variant="bodyMedium" style={[styles.emptySubtext, { color: theme.colors.onSurfaceVariant }]}>
                  Try a different search or check back later
                </Text>
              )}
            </View>
          }
          contentContainerStyle={styles.listContent}
          scrollEventThrottle={16}
        />
      )}
    </ScrollView>
  );
});

AcademyBrowser.displayName = 'AcademyBrowser';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBackButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  headerBackText: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  searchHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  clearButton: {
    fontSize: 18,
    marginLeft: 8,
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
    flexGrow: 1,
  },
  academyCard: {
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  academyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  academyName: {
    flex: 1,
  },
  verifiedBadge: {
    fontSize: 18,
  },
  academyDescription: {
    marginBottom: 10,
    lineHeight: 18,
  },
  academyMeta: {
    marginBottom: 12,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
  },
  browseButton: {
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  browseButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  detailView: {
    flexGrow: 1,
  },
  academyDetail: {
    padding: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonContent: {
    justifyContent: 'flex-start',
  },
  backButtonLabel: {
    fontSize: 14,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailTitle: {
    marginBottom: 12,
  },
  detailDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  detailInfo: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontWeight: '500',
  },
  classesTitle: {
    marginBottom: 12,
    marginTop: 20,
  },
  noClassesText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
  classCard: {
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    flex: 1,
  },
  platformBadge: {
    fontSize: 16,
  },
  classDescription: {
    marginBottom: 8,
    lineHeight: 16,
  },
  classMeta: {
    marginBottom: 8,
  },
  scheduleText: {
    fontSize: 12,
  },
  costSection: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  costText: {
    fontWeight: '600',
  },
  detailsButton: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
  },
  detailsButtonText: {
    fontWeight: '600',
    fontSize: 13,
  },
  detailsModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 20,
    justifyContent: 'flex-end',
  },
  detailsContent: {
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
    fontWeight: '300',
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailsDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  detailsInfo: {
    marginBottom: 16,
  },
  costBreakdown: {
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    gap: 6,
  },
  costOption: {
    fontSize: 14,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});
