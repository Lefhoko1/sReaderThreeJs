/**
 * Academy Marketplace Screen
 * Beautiful UI for students to discover, search, and view academies
 * Features: Search, filtering, ratings, staff preview, and more
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ImageBackground,
  SafeAreaView,
} from 'react-native';
import { Text, Card, Chip, Button, Icon, Avatar, Badge, Searchbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy } from '../../domain/entities/tutoring';
import { ID } from '../../shared/types';

interface AcademyMarketplaceProps {
  viewModel: TutoringViewModel;
  studentId: ID;
  onAcademySelect: (academy: TutoringAcademy) => void;
  onBack: () => void;
}

type FilterType = 'all' | 'verified' | 'topRated' | 'new';
type SortType = 'name' | 'rating' | 'students';

export const AcademyMarketplace: React.FC<AcademyMarketplaceProps> = observer(
  ({ viewModel, studentId, onAcademySelect, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [sortType, setSortType] = useState<SortType>('rating');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
      viewModel.loadAllAcademies();
    }, []);

    // Filter logic
    let filteredAcademies = viewModel.academies;

    if (searchQuery.trim()) {
      filteredAcademies = filteredAcademies.filter(
        (academy) =>
          academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          academy.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    switch (filterType) {
      case 'verified':
        filteredAcademies = filteredAcademies.filter((a) => a.isVerified);
        break;
      case 'topRated':
        // Mock rating - would come from backend
        filteredAcademies = filteredAcademies.filter((_, i) => i % 3 !== 0);
        break;
      case 'new':
        filteredAcademies = filteredAcademies.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    // Sort
    switch (sortType) {
      case 'name':
        filteredAcademies = [...filteredAcademies].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'students':
        // Mock student count
        filteredAcademies = [...filteredAcademies].sort((a, b) => {
          const countA = Math.floor(Math.random() * 500);
          const countB = Math.floor(Math.random() * 500);
          return countB - countA;
        });
        break;
    }

    const handleSearch = (query: string) => {
      setSearchQuery(query);
      if (query.trim()) {
        viewModel.searchAcademies(query);
        setIsSearching(true);
      } else {
        viewModel.loadAllAcademies();
        setIsSearching(false);
      }
    };

    const renderAcademyCard = ({ item }: { item: TutoringAcademy }) => (
      <AcademyCard
        academy={item}
        onPress={() => onAcademySelect(item)}
        isVerified={item.isVerified}
      />
    );

    return (
      <SafeAreaView style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Icon source="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Discover Academies</Text>
            <View style={{ width: 32 }} />
          </View>

          <Text style={styles.headerSubtitle}>Find the perfect academy for your learning journey</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search academies..."
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchBar}
            iconColor="#7C6FD3"
            placeholderTextColor="#999"
            inputStyle={styles.searchInput}
          />
        </View>

        {/* Filter and Sort Controls */}
        <View style={styles.controlsSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <Chip
              selected={filterType === 'all'}
              onPress={() => setFilterType('all')}
              style={[styles.chip, filterType === 'all' && styles.chipSelected]}
              textStyle={{ fontSize: 12 }}
            >
              All
            </Chip>
            <Chip
              selected={filterType === 'verified'}
              onPress={() => setFilterType('verified')}
              style={[styles.chip, filterType === 'verified' && styles.chipSelected]}
              textStyle={{ fontSize: 12 }}
            >
              ✓ Verified
            </Chip>
            <Chip
              selected={filterType === 'topRated'}
              onPress={() => setFilterType('topRated')}
              style={[styles.chip, filterType === 'topRated' && styles.chipSelected]}
              textStyle={{ fontSize: 12 }}
            >
              ⭐ Top Rated
            </Chip>
            <Chip
              selected={filterType === 'new'}
              onPress={() => setFilterType('new')}
              style={[styles.chip, filterType === 'new' && styles.chipSelected]}
              textStyle={{ fontSize: 12 }}
            >
              🆕 New
            </Chip>
          </ScrollView>
        </View>

        {/* Sort Controls */}
        <View style={styles.sortSection}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            <TouchableOpacity
              onPress={() => setSortType('rating')}
              style={[styles.sortButton, sortType === 'rating' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortType === 'rating' && styles.sortButtonTextActive]}>
                Rating
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortType('name')}
              style={[styles.sortButton, sortType === 'name' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortType === 'name' && styles.sortButtonTextActive]}>
                A-Z
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSortType('students')}
              style={[styles.sortButton, sortType === 'students' && styles.sortButtonActive]}
            >
              <Text style={[styles.sortButtonText, sortType === 'students' && styles.sortButtonTextActive]}>
                Popular
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Academy List */}
        {viewModel.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C6FD3" />
            <Text style={styles.loadingText}>Loading academies...</Text>
          </View>
        ) : filteredAcademies.length > 0 ? (
          <FlatList
            data={filteredAcademies}
            renderItem={renderAcademyCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Icon source="folder-open" size={80} color="#ddd" />
            <Text style={styles.emptyTitle}>No academies found</Text>
            <Text style={styles.emptyText}>Try adjusting your search or filters</Text>
          </View>
        )}

        {viewModel.error && (
          <View style={styles.errorContainer}>
            <Icon source="alert-circle" size={24} color="#d32f2f" />
            <Text style={styles.errorText}>{viewModel.error}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
);

/**
 * Academy Card Component
 * Displays academy summary with preview and action button
 */
interface AcademyCardProps {
  academy: TutoringAcademy;
  onPress: () => void;
  isVerified?: boolean;
}

const AcademyCard: React.FC<AcademyCardProps> = ({ academy, onPress, isVerified }) => {
  // Mock data for preview
  const staffCount = Math.floor(Math.random() * 20) + 5;
  const studentCount = Math.floor(Math.random() * 500) + 50;
  const rating = (Math.random() * 1 + 4).toFixed(1);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.academyCard}>
        <LinearGradient
          colors={['#7C6FD3', '#5A50A3']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleSection}>
              <Text style={styles.academyName} numberOfLines={2}>
                {academy.name}
              </Text>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <Icon source="check-circle" size={16} color="#fff" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>
            <Avatar.Text size={50} label={academy.name.substring(0, 2)} />
          </View>

          <Text style={styles.academyLocation} numberOfLines={1}>
            📍 {academy.location || 'Online & In-person'}
          </Text>

          <Text style={styles.academyDescription} numberOfLines={2}>
            {academy.description || 'Premium tutoring academy'}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon source="star" size={16} color="#FFD700" />
              <Text style={styles.statText}>{rating}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon source="account-multiple" size={16} color="#fff" />
              <Text style={styles.statText}>{studentCount} students</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Icon source="teach" size={16} color="#fff" />
              <Text style={styles.statText}>{staffCount} tutors</Text>
            </View>
          </View>

          {/* Staff Preview */}
          <View style={styles.staffPreview}>
            <Text style={styles.staffLabel}>Top Tutors:</Text>
            <View style={styles.staffAvatars}>
              {Array(3)
                .fill(0)
                .map((_, i) => (
                  <Avatar.Text
                    key={i}
                    size={32}
                    label={`T${i + 1}`}
                    style={[styles.staffAvatar, { marginLeft: i > 0 ? -12 : 0 }]}
                  />
                ))}
              <Text style={styles.moreStaff}>+{Math.max(0, staffCount - 3)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Footer Action */}
        <View style={styles.cardFooter}>
          <Button
            mode="contained"
            onPress={onPress}
            style={styles.viewButton}
            labelStyle={styles.viewButtonLabel}
          >
            View Details
          </Button>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },

  // Header
  headerSection: {
    backgroundColor: '#7C6FD3',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },

  // Search
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#f8f9fc',
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    fontSize: 14,
  },

  // Controls
  controlsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fc',
  },
  filterScroll: {
    flexDirection: 'row',
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#7C6FD3',
    borderColor: '#7C6FD3',
  },

  // Sort
  sortSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fc',
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#7C6FD3',
    borderColor: '#7C6FD3',
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Loading & Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },

  // Error
  errorContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: '#d32f2f',
    marginLeft: 8,
    flex: 1,
  },

  // Academy Card
  academyCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardGradient: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  academyName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
  },
  academyLocation: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  academyDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statText: {
    fontSize: 11,
    color: '#fff',
    marginLeft: 4,
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },

  // Staff Preview
  staffPreview: {
    marginBottom: 12,
  },
  staffLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  staffAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffAvatar: {
    borderWidth: 2,
    borderColor: '#7C6FD3',
  },
  moreStaff: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },

  // Footer
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  viewButton: {
    backgroundColor: '#7C6FD3',
    borderRadius: 8,
  },
  viewButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
