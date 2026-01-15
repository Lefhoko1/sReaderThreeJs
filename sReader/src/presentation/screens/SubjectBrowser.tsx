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
import { Text, Card, Searchbar, Chip } from 'react-native-paper';
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
                color="#7C6FD3"
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

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleWrapper}>
            <Text style={styles.headerSubtitle}>{academy.name}</Text>
            <Text style={styles.headerTitle}>{level.name}</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Academy</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color="#7C6FD3" />
          <Text style={styles.breadcrumbText}>{level.name}</Text>
          <MaterialCommunityIcons name="chevron-right" size={14} color="#7C6FD3" />
          <Text style={styles.breadcrumbTextActive}>Subjects</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search subjects..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            placeholderTextColor="#999"
          />
        </View>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
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

        {/* Subjects List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="loading" size={48} color="#7C6FD3" />
            <Text style={styles.loadingText}>Loading subjects...</Text>
          </View>
        ) : filteredAndSortedSubjects.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No subjects found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedSubjects}
            renderItem={renderSubjectCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={true}
          />
        )}

        {/* Stats Footer */}
        {filteredAndSortedSubjects.length > 0 && (
          <View style={styles.footer}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="book-multiple" size={20} color="#7C6FD3" />
              <Text style={styles.statText}>{filteredAndSortedSubjects.length} Subjects</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="currency-usd" size={20} color="#7C6FD3" />
              <Text style={styles.statText}>
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
        )}
      </SafeAreaView>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7C6FD3',
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
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Breadcrumb
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    fontSize: 11,
    color: '#666',
    marginHorizontal: 4,
  },
  breadcrumbTextActive: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C6FD3',
    marginHorizontal: 4,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchbar: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
  },

  // Sort
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sortScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  sortChip: {
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  sortChipActive: {
    backgroundColor: '#7C6FD3',
  },
  sortChipText: {
    color: '#666',
    fontSize: 11,
  },
  sortChipTextActive: {
    color: '#fff',
  },

  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    backgroundColor: '#f0f0f0',
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
    color: '#333',
    marginBottom: 2,
  },
  subjectCode: {
    fontSize: 11,
    color: '#7C6FD3',
    fontWeight: '600',
    marginBottom: 4,
  },
  subjectDescription: {
    fontSize: 11,
    color: '#666',
    lineHeight: 15,
    marginBottom: 6,
  },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  creditText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
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
    backgroundColor: 'rgba(124, 111, 211, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceLabel: {
    fontSize: 9,
    color: '#999',
    fontWeight: '500',
  },
  priceAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  priceAmountHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: '#7C6FD3',
    marginTop: 2,
  },
  enrollButton: {
    flexDirection: 'row',
    backgroundColor: '#7C6FD3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enrollButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 4,
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
    color: '#7C6FD3',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
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
    color: '#666',
    marginLeft: 6,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#e0e0e0',
  },
});
