/**
 * Subject Browser Screen
 * Browse subjects for a specific level with detailed cost information
 * Features: Search subjects, filter by cost, view pricing options
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, Card, Searchbar, Chip, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy, TutoringLevel, TutoringSubject } from '../../domain/entities/tutoring';
import { ID } from '../../shared/types';

interface SubjectBrowserProps {
  viewModel: TutoringViewModel;
  academy: TutoringAcademy;
  level: TutoringLevel;
  studentId: ID;
  onSubjectSelect?: (subject: TutoringSubject) => void;
  onBack: () => void;
}

type SortType = 'name' | 'price-low' | 'price-high';

export const SubjectBrowser: React.FC<SubjectBrowserProps> = observer(
  ({ viewModel, academy, level, studentId, onSubjectSelect, onBack }) => {
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortType, setSortType] = useState<SortType>('name');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadSubjects();
    }, [level.id, academy.id]);

    const loadSubjects = async () => {
      console.log(`[SubjectBrowser] Loading subjects for academy ${academy.id}, level ${level.id}`);
      setLoading(true);
      try {
        const result = await viewModel.loadSubjectsByLevelId(level.id);
        if (!result.ok) {
          console.warn('[SubjectBrowser] Failed to load subjects:', (result as any).error);
        } else {
          console.log('[SubjectBrowser] Subjects loaded successfully');
        }
      } catch (error) {
        console.error('[SubjectBrowser] Error loading subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    // Use subjects from viewModel that are filtered for this level
    const allSubjects = useMemo(() => {
      const filtered = viewModel.subjects.filter((s: TutoringSubject) => s.levelId === level.id);
      console.log('[SubjectBrowser.useMemo] Total subjects in viewModel:', viewModel.subjects.length);
      console.log('[SubjectBrowser.useMemo] Filtered subjects for level', level.id, ':', filtered.length);
      filtered.forEach((s) => console.log('  - Subject:', s.id, s.name, 'levelId:', s.levelId));
      return filtered;
    }, [viewModel.subjects, level.id]);

    // Filter and sort subjects based on search and sort type
    const filteredAndSortedSubjects = useMemo(() => {
      let filtered = allSubjects.filter(
        (subject: TutoringSubject) =>
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Sort
      switch (sortType) {
        case 'name':
          filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'price-low':
          filtered = [...filtered].sort((a, b) => (a.costPerMonth || 0) - (b.costPerMonth || 0));
          break;
        case 'price-high':
          filtered = [...filtered].sort((a, b) => (b.costPerMonth || 0) - (a.costPerMonth || 0));
          break;
      }

      return filtered;
    }, [allSubjects, searchQuery, sortType]);

    const renderSubjectCard = ({ item }: { item: TutoringSubject }) => (
      <Card style={styles.subjectCard}>
        <View style={styles.subjectCardContent}>
          {/* Left Section - Subject Info */}
          <View style={styles.subjectInfoSection}>
            <View style={styles.subjectIconWrapper}>
              <MaterialCommunityIcons
                name={
                  (['calculator', 'atom', 'flask', 'dna', 'book-open', 'history'][
                    allSubjects.indexOf(item) % 6
                  ] as any)
                }
                size={28}
                color={theme.colors.primary}
              />
            </View>

            <View style={styles.subjectInfo}>
              <Text style={styles.subjectName}>{item.name}</Text>
              <Text style={styles.subjectCode}>{item.code}</Text>
              <Text style={styles.subjectDescription} numberOfLines={2}>
                {item.description}
              </Text>

              {/* Credit Hours */}
              {item.creditHours && (
                <View style={styles.creditBadge}>
                  <MaterialCommunityIcons name="school" size={12} color="#666" />
                  <Text style={styles.creditText}>{item.creditHours} credits</Text>
                </View>
              )}
            </View>
          </View>

          {/* Right Section - Pricing & Actions */}
          <View style={styles.pricingSection}>
            {item.costPerMonth && (
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Monthly</Text>
                <Text style={styles.priceAmount}>${item.costPerMonth}</Text>
              </View>
            )}

            {item.costPerTerm && (
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>Per Term</Text>
                <Text style={styles.priceAmount}>${item.costPerTerm}</Text>
              </View>
            )}

            {item.costPerYear && (
              <View style={styles.priceBoxHighlight}>
                <Text style={styles.priceLabel}>Annual</Text>
                <Text style={styles.priceAmountHighlight}>${item.costPerYear}</Text>
              </View>
            )}

            {/* Enroll Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => onSubjectSelect?.(item)}
              style={styles.enrollButton}
            >
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
              <Text style={styles.enrollButtonText}>Enroll</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    );

    function renderHeader() {
      return (
        <View>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={28} color={theme.colors.onPrimary} />
            </TouchableOpacity>
            <View style={styles.headerTitleWrapper}>
              <Text style={[styles.headerSubtitle, { color: theme.colors.onPrimary }]}>{academy.name}</Text>
              <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>{level.name}</Text>
            </View>
            <View style={{ width: 28 }} />
          </View>

          {/* Breadcrumb */}
          <View style={[styles.breadcrumb, { backgroundColor: theme.colors.surfaceVariant, borderBottomColor: 'rgba(0, 0, 0, 0.06)' }]}>
            <Text style={[styles.breadcrumbText, { color: theme.colors.onSurfaceVariant }]}>Academy</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={theme.colors.primary} />
            <Text style={[styles.breadcrumbText, { color: theme.colors.onSurfaceVariant }]}>{level.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={14} color={theme.colors.primary} />
            <Text style={[styles.breadcrumbTextActive, { color: theme.colors.primary }]}>Subjects</Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Searchbar
              placeholder="Search subjects..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              placeholderTextColor={theme.colors.onSurfaceVariant}
            />
          </View>

          {/* Sort Options */}
          <View style={[styles.sortContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Text style={styles.sortLabel}>Sort by:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
              {(['name', 'price-low', 'price-high'] as const).map((sort) => (
                <Chip
                  key={sort}
                  selected={sortType === sort}
                  onPress={() => setSortType(sort)}
                  style={[
                    styles.sortChip,
                    sortType === sort && styles.sortChipActive,
                  ]}
                  textStyle={[
                    styles.sortChipText,
                    sortType === sort && styles.sortChipTextActive,
                  ]}
                  icon={
                    sort === 'name'
                      ? 'alphabetical'
                      : sort === 'price-low'
                        ? 'sort-ascending'
                        : 'sort-descending'
                  }
                >
                  {sort === 'name'
                    ? 'Name'
                    : sort === 'price-low'
                      ? 'Price: Low'
                      : 'Price: High'}
                </Chip>
              ))}
            </ScrollView>
          </View>
        </View>
      );
    }

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
        {loading ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="loading" size={48} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.primary }]}>Loading subjects...</Text>
          </View>
        ) : filteredAndSortedSubjects.length === 0 ? (
          <View>
            {renderHeader()}
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="magnify" size={48} color={theme.colors.surfaceVariant} />
              <Text style={styles.emptyText}>No subjects found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search</Text>
            </View>
          </View>
        ) : (
          <FlatList
            ListHeaderComponent={renderHeader}
            data={filteredAndSortedSubjects}
            renderItem={renderSubjectCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: theme.colors.surfaceVariant }}
            ListFooterComponent={
              filteredAndSortedSubjects.length > 0 ? (
                <View style={[styles.footer, { backgroundColor: theme.colors.surface, borderTopColor: 'rgba(0, 0, 0, 0.06)' }]}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="book-multiple" size={20} color={theme.colors.primary} />
                    <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>{filteredAndSortedSubjects.length} Subjects</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.colors.surfaceVariant }]} />
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="currency-usd" size={20} color={theme.colors.primary} />
                    <Text style={[styles.statText, { color: theme.colors.onSurfaceVariant }]}>
                      $
                      {Math.min(
                        ...filteredAndSortedSubjects
                          .map((s) => s.costPerMonth || 0)
                          .filter((c) => c > 0)
                      )}
                      -$
                      {Math.max(
                        ...filteredAndSortedSubjects
                          .map((s) => s.costPerMonth || 0)
                          .filter((c) => c > 0)
                      )}
                      /month
                    </Text>
                  </View>
                </View>
              ) : null
            }
          />
        )}
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 3,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 11,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    fontSize: 11,
    marginHorizontal: 4,
  },
  breadcrumbTextActive: {
    fontSize: 11,
    fontWeight: '700',
    marginHorizontal: 4,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E7E0EC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  searchbar: {
    borderRadius: 12,
  },

  // Sort
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E7E0EC',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1C1B1F',
  },
  sortScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  sortChip: {
    marginRight: 8,
  },
  sortChipActive: {
  },
  sortChipText: {
    fontSize: 11,
  },
  sortChipTextActive: {
  },

  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 40,
  },
  subjectCardWrapper: {
    marginBottom: 12,
  },
  subjectCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  subjectCardContent: {
    flexDirection: 'row',
    padding: 12,
  },

  // Subject Info
  subjectInfoSection: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 12,
  },
  subjectIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
    color: '#1C1B1F',
  },
  subjectCode: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    color: '#79747E',
  },
  subjectDescription: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 6,
    color: '#1C1B1F',
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  creditText: {
    fontSize: 10,
    marginLeft: 4,
    fontWeight: '500',
    color: '#1C1B1F',
  },

  // Pricing
  pricingSection: {
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    minWidth: 100,
  },
  priceBox: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  priceBoxHighlight: {
    alignItems: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 9,
    fontWeight: '500',
    color: '#79747E',
  },
  priceAmount: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    color: '#1C1B1F',
  },
  priceAmountHighlight: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
    color: '#6750A4',
  },
  enrollButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6750A4',
  },
  enrollButtonText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    color: '#fff',
  },

  // Center
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
    fontWeight: '600',
    color: '#6750A4',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    color: '#1C1B1F',
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 6,
    color: '#79747E',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
  },
});
