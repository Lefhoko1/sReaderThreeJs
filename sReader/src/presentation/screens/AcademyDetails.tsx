/**
 * Academy Details Screen
 * Comprehensive view of academy with levels, subjects, tutors, pricing, and enrollment
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
  Dimensions,
} from 'react-native';
import { Text, Card, Chip, Button, Avatar, Divider, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { observer } from 'mobx-react-lite';
import { TutoringViewModel } from '../../application/viewmodels/TutoringViewModel';
import { TutoringAcademy, TutoringLevel, TutoringSubject } from '../../domain/entities/tutoring';
import { ID } from '../../shared/types';

interface AcademyDetailsProps {
  viewModel: TutoringViewModel;
  academy: TutoringAcademy;
  studentId: ID;
  onBack: () => void;
  onBrowseLevels?: () => void;
  onLevelSelect?: (level: TutoringLevel) => void;
  onRequestEnrollment?: (academyId: ID) => void;
}

export const AcademyDetails: React.FC<AcademyDetailsProps> = observer(
  ({ viewModel, academy, studentId, onBack, onBrowseLevels, onLevelSelect, onRequestEnrollment }) => {
    const theme = useTheme();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
      { key: 'overview', title: 'Overview' },
      { key: 'levels', title: 'Levels' },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      // Load levels for this academy
      console.log('[AcademyDetails] Loading levels for academy:', academy.id, academy.name);
      loadLevels();
    }, [academy.id]);

    const loadLevels = async () => {
      setLoading(true);
      try {
        const result = await viewModel.loadLevelsByAcademyId(academy.id);
        console.log('[AcademyDetails] Levels loaded:', result);
        if (!result.ok) {
          console.warn('[AcademyDetails] Failed to load levels:', result.error);
        }
      } catch (error) {
        console.error('[AcademyDetails] Error loading levels:', error);
      } finally {
        setLoading(false);
      }
    };

    const displayedLevels = viewModel.levels.filter((l) => l.academyId === academy.id);

    const handleEnrollmentRequest = () => {
      Alert.alert('Enrollment Request', `Request to join ${academy.name}?`, [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Request',
          onPress: () => {
            onRequestEnrollment?.(academy.id);
            Alert.alert('Success', 'Your enrollment request has been sent!');
          },
        },
      ]);
    };

    function renderHeader() {
      return (
        <View>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {academy.name}
            </Text>
            <MaterialCommunityIcons name="heart-outline" size={28} color="#fff" />
          </View>

          {/* Hero Section */}
          <LinearGradient
            colors={[theme.colors.primaryContainer, theme.colors.secondaryContainer]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroContent}>
              <Avatar.Text size={100} label={academy.name.substring(0, 2)} />
              <View style={styles.heroInfo}>
                {academy.isVerified && (
                  <View style={styles.verificationBadge}>
                    <MaterialCommunityIcons name="check-circle" size={18} color="#4CAF50" />
                    <Text style={styles.verificationText}>Verified Academy</Text>
                  </View>
                )}
                <View style={styles.ratingRow}>
                  <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
                  <Text style={styles.ratingText}>{`4.8/5.0 (324 reviews)`}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Browse Subjects Button - Prominent CTA */}
          <View style={[styles.browseButtonContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Button
              mode="contained"
              style={styles.browseSubjectsButton}
              labelStyle={styles.browseSubjectsButtonLabel}
              onPress={async () => {
                console.log('[AcademyDetails] Browse Subjects button pressed for academy:', academy.id);
                setIndex(1);
                await loadLevels();
              }}
            >
              Browse Subjects & Levels
            </Button>
          </View>

          {/* Tab Navigation */}
          <View style={[styles.tabBar, { backgroundColor: theme.colors.surfaceVariant }]}>
            {routes.map((route, i) => (
              <TouchableOpacity
                key={route.key}
                style={[styles.tabButton, index === i && styles.tabButtonActive]}
                onPress={() => setIndex(i)}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    index === i && styles.tabLabelActive,
                  ]}
                >
                  {route.title}
                </Text>
                {index === i && <View style={styles.tabIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* Overview Tab Content */}
          {index === 0 && (
            <View style={styles.tabContent}>
              {/* Description Card */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>About Academy</Text>
                  <Text style={styles.descriptionText}>{academy.description || 'Premium tutoring academy'}</Text>

                  <Divider style={styles.divider} />

                  <View style={styles.infoRow}>
                    <MaterialCommunityIcons name="map-marker" size={20} color={theme.colors.primary} />
                    <Text style={styles.infoText}>{academy.location || 'Online & In-person'}</Text>
                  </View>

                  {academy.phone && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="phone" size={20} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{academy.phone}</Text>
                    </View>
                  )}

                  {academy.email && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="email" size={20} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{academy.email}</Text>
                    </View>
                  )}

                  {academy.websiteUrl && (
                    <View style={styles.infoRow}>
                      <MaterialCommunityIcons name="web" size={20} color={theme.colors.primary} />
                      <Text style={styles.infoText}>{academy.websiteUrl}</Text>
                    </View>
                  )}

                  <Divider style={styles.divider} />

                  <Button
                    mode="contained"
                    style={styles.exploreLevelsButton}
                    labelStyle={styles.exploreLevelsButtonLabel}
                    onPress={async () => {
                      console.log('[AcademyDetails.Overview] Explore Levels button pressed');
                      setIndex(1);
                      await loadLevels();
                    }}
                  >
                    Explore Levels & Subjects
                  </Button>
                </Card.Content>
              </Card>

              {/* Stats Card */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Academy Stats</Text>
                  <View style={styles.statsGrid}>
                    <StatItem icon="account-multiple" label="Students" value="2,450" />
                    <StatItem icon="teach" label="Tutors" value="85" />
                    <StatItem icon="book-open" label="Subjects" value="42" />
                    <StatItem icon="school" label="Levels" value="8" />
                  </View>
                </Card.Content>
              </Card>

              {/* Highlights */}
              <Card style={styles.sectionCard}>
                <Card.Content>
                  <Text style={styles.sectionTitle}>Why Choose Us?</Text>
                  <View style={styles.highlightList}>
                    <HighlightItem text="Expert, verified tutors" icon="check-circle" />
                    <HighlightItem text="Flexible scheduling" icon="clock" />
                    <HighlightItem text="Affordable pricing" icon="tag" />
                    <HighlightItem text="Online & in-person classes" icon="laptop" />
                    <HighlightItem text="Personalized learning paths" icon="target" />
                    <HighlightItem text="24/7 student support" icon="headset" />
                  </View>
                </Card.Content>
              </Card>
            </View>
          )}
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <FlatList
          ListHeaderComponent={renderHeader}
          data={index === 0 ? [] : displayedLevels}
          keyExtractor={(item, i) => item?.id || `level-${i}`}
          renderItem={({ item }) => {
            if (!item) return null;
            return (
              <Card key={item.id} style={styles.levelCard}>
                <Card.Content>
                  <View style={styles.levelHeader}>
                    <View>
                      <Text style={styles.levelName}>{item.name}</Text>
                      <Text style={styles.levelCode}>{item.code}</Text>
                    </View>
                    <View style={styles.levelBadge}>
                      <Text style={styles.levelBadgeText}>{viewModel.subjects.filter(s => s.levelId === item.id).length} subjects</Text>
                    </View>
                  </View>
                  <Text style={styles.levelDescription}>{item.description}</Text>
                  <Button
                    mode="outlined"
                    style={styles.levelButton}
                    labelStyle={styles.levelButtonLabel}
                    onPress={() => {
                      console.log('[AcademyDetails] View Subjects pressed for level:', item.id);
                      onLevelSelect?.(item);
                    }}
                  >
                    View Subjects
                  </Button>
                </Card.Content>
              </Card>
            );
          }}
          ListEmptyComponent={index === 0 ? null : (loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator animating={true} color={theme.colors.primary} size="large" />
              <Text style={styles.loadingText}>Loading levels...</Text>
            </View>
          ) : (
            <View style={styles.centerContainer}>
              <MaterialCommunityIcons name="school" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No levels available</Text>
              <Text style={styles.emptySubtext}>Check back later</Text>
            </View>
          ))}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: theme.colors.surfaceVariant }}
        />
      </SafeAreaView>
    );
  }
);

/**
 * Helper Components
 */

interface StatItemProps {
  icon: string;
  label: string;
  value: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => (
  <View style={styles.statItem}>
    <MaterialCommunityIcons name={icon as any} size={28} color="#7C6FD3" />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

interface HighlightItemProps {
  text: string;
  icon: string;
}

const HighlightItem: React.FC<HighlightItemProps> = ({ text, icon }) => (
  <View style={styles.highlightItem}>
    <MaterialCommunityIcons name={icon as any} size={20} color="#7C6FD3" />
    <Text style={styles.highlightText}>{text}</Text>
  </View>
);

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#7C6FD3',
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

  // Hero
  heroSection: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  verificationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 6,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#1C1B1F',
    marginLeft: 6,
    fontWeight: '600',
  },

  // Browse Button
  browseButtonContainer: {
    backgroundColor: '#E7E0EC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  browseSubjectsButton: {
    backgroundColor: '#6750A4',
    borderRadius: 8,
  },
  browseSubjectsButtonLabel: {
    fontSize: 14,
    fontWeight: '700',
    paddingVertical: 6,
  },

  // Tabs
  tabBar: {
    backgroundColor: '#E7E0EC',
    elevation: 2,
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#6750A4',
  },
  tabIndicator: {
    backgroundColor: '#6750A4',
    height: 3,
    marginTop: 8,
    width: '100%',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#79747E',
  },
  tabLabelActive: {
    color: '#6750A4',
    fontWeight: '700',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContentInner: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: '#6750A4',
    marginTop: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 6,
  },

  // Cards
  sectionCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 13,
    color: '#1C1B1F',
    lineHeight: 20,
    marginBottom: 16,
  },
  divider: {
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#1C1B1F',
    marginLeft: 12,
    flex: 1,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1B1F',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 4,
  },

  // Highlights
  highlightList: {
    gap: 10,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    fontSize: 13,
    color: '#1C1B1F',
    marginLeft: 12,
    flex: 1,
  },

  // Levels
  levelCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  levelName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  levelCode: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 2,
  },
  levelBadge: {
    backgroundColor: '#E8DEF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#625B71',
  },
  levelDescription: {
    fontSize: 12,
    color: '#1C1B1F',
    marginBottom: 12,
  },
  levelButton: {
    borderColor: '#6750A4',
  },
  levelButtonLabel: {
    fontSize: 12,
  },
  exploreLevelsButton: {
    marginTop: 12,
    backgroundColor: '#6750A4',
    borderRadius: 8,
  },
  exploreLevelsButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Tutors
  tutorCard: {
    marginBottom: 12,
    borderRadius: 12,
  },
  tutorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tutorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tutorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tutorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  tutorSpecialization: {
    fontSize: 12,
    color: '#6750A4',
    marginTop: 2,
    fontWeight: '600',
  },
  tutorStats: {
    flexDirection: 'row',
    marginTop: 6,
    flexWrap: 'wrap',
  },
  tutorStat: {
    fontSize: 11,
    color: '#1C1B1F',
    marginRight: 12,
    marginTop: 4,
  },
  viewTutorButton: {
    borderColor: '#6750A4',
  },
  viewTutorButtonLabel: {
    fontSize: 12,
  },

  // Pricing
  pricingCard: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pricingCardHighlight: {
    borderWidth: 2,
    borderColor: '#625B71',
  },
  bestValueBadge: {
    backgroundColor: '#625B71',
    paddingVertical: 6,
    alignItems: 'center',
  },
  bestValueText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    color: '#79747E',
    marginBottom: 12,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#6750A4',
  },
  period: {
    fontSize: 12,
    color: '#79747E',
    marginLeft: 4,
  },
  pricingDivider: {
    marginVertical: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    color: '#1C1B1F',
    marginLeft: 10,
    flex: 1,
  },
  enrollButton: {
    marginTop: 8,
    backgroundColor: '#6750A4',
  },
  enrollButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
