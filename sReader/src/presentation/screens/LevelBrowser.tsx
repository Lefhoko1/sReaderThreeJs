/**
 * Level Browser Screen
 * Browse educational levels and drill down to subjects
 * Features: Search levels, view subject counts, navigate to subjects
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
import { Text, Card, Searchbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy, TutoringLevel } from '../../domain/entities/tutoring';
import { ID } from '../../shared/types';

interface LevelBrowserProps {
  viewModel: TutoringViewModel;
  academy: TutoringAcademy;
  studentId: ID;
  onLevelSelect: (level: TutoringLevel) => void;
  onBack: () => void;
}

export const LevelBrowser: React.FC<LevelBrowserProps> = observer(
  ({ viewModel, academy, studentId, onLevelSelect, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadLevels();
    }, [academy.id]);

    const loadLevels = async () => {
      setLoading(true);
      try {
        console.log('Loading levels for academy:', academy.id);
        const result = await viewModel.loadLevelsByAcademyId(academy.id);
        console.log('Levels result:', result);
        if (!result.ok) {
          console.warn('Failed to load levels:', result.error);
        }
      } catch (error) {
        console.error('Error loading levels:', error);
      } finally {
        setLoading(false);
      }
    };

    // Use levels from viewModel that are filtered for this academy
    const displayedLevels = useMemo(() => {
      return viewModel.levels.filter((l: TutoringLevel) => l.academyId === academy.id);
    }, [viewModel.levels, academy.id]);

    const filteredLevels = useMemo(() => {
      return displayedLevels.filter(
        (level) =>
          level.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          level.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }, [displayedLevels, searchQuery]);

    const renderLevelCard = ({ item }: { item: TutoringLevel }) => {
      return (
        <Card style={styles.levelCard}>
          <LinearGradient
            colors={['#7C6FD3', '#5A50A3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.levelCardGradient}
          >
            <View style={styles.levelCardInner}>
              <View style={styles.levelIconWrapper}>
                <MaterialCommunityIcons name="school" size={32} color="#fff" />
              </View>

              <View style={styles.levelInfo}>
                <Text style={styles.levelName}>{item.name}</Text>
                <Text style={styles.levelCode}>{item.code}</Text>
                <Text style={styles.levelDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              </View>

              <Button
                mode="contained"
                onPress={() => {
                  console.log('[LevelBrowser] Browse pressed for level:', item.id);
                  onLevelSelect(item);
                }}
                style={styles.browseButton}
                labelStyle={styles.browseButtonLabel}
              >
                Browse
              </Button>
            </View>
          </LinearGradient>
        </Card>
      );
    };

    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {academy.name}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Breadcrumb */}
        <View style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>Academy</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color="#7C6FD3" />
          <Text style={styles.breadcrumbTextActive}>Levels</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search levels by name or code..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            placeholderTextColor="#999"
          />
        </View>

        {/* Levels List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="loading" size={48} color="#7C6FD3" />
            <Text style={styles.loadingText}>Loading levels...</Text>
          </View>
        ) : filteredLevels.length === 0 ? (
          <View style={styles.centerContainer}>
            <MaterialCommunityIcons name="magnify" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No levels found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search</Text>
          </View>
        ) : (
          <FlatList
            data={filteredLevels}
            renderItem={renderLevelCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            scrollEnabled={true}
          />
        )}

        {/* Stats Footer */}
        <View style={styles.footer}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="book" size={20} color="#7C6FD3" />
            <Text style={styles.statText}>{filteredLevels.length} Levels</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="school" size={20} color="#7C6FD3" />
            <Text style={styles.statText}>Multiple Subjects</Text>
          </View>
        </View>
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
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
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
  },
  breadcrumbText: {
    fontSize: 12,
    color: '#666',
  },
  breadcrumbTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C6FD3',
    marginLeft: 6,
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

  // List
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  levelCardWrapper: {
    marginBottom: 12,
  },
  levelCard: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    marginBottom: 12,
  },
  levelCardGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  levelCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  levelCode: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 16,
  },
  browseButton: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  browseButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 12,
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
