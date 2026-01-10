import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Card, Text, Button, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';

// Mock leaderboard data
const mockLeaderboard = [
  { id: 1, name: 'Alex Chen', score: 3250, level: 10, rank: 1, isYou: false, avatar: 'A' },
  { id: 2, name: 'Jordan Smith', score: 3100, level: 9, rank: 2, isYou: false, avatar: 'J' },
  { id: 3, name: 'You', score: 2450, level: 8, rank: 12, isYou: true, avatar: 'Y' },
  { id: 4, name: 'Sam Wilson', score: 2300, level: 7, rank: 13, isYou: false, avatar: 'S' },
  { id: 5, name: 'Taylor Brown', score: 2100, level: 7, rank: 14, isYou: false, avatar: 'T' },
  { id: 6, name: 'Morgan Lee', score: 1950, level: 6, rank: 15, isYou: false, avatar: 'M' },
];

export const LeaderboardScreen = observer(({ onBack }: { onBack: () => void }) => {
  const theme = useTheme();

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.primaryContainer }]}>
        <Button
          icon="arrow-left"
          mode="text"
          onPress={onBack}
          textColor={theme.colors.onPrimaryContainer}
        >
          Back
        </Button>
        <Text variant="headlineSmall" style={{ color: theme.colors.onPrimaryContainer, flex: 1 }}>
          Leaderboard
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Top 3 Podium */}
        <View style={styles.podiumSection}>
          {mockLeaderboard.slice(0, 3).map((player, index) => (
            <View key={player.id} style={styles.podiumItem}>
              <View style={[styles.medalBadge, { backgroundColor: getMedalColor(index, theme) }]}>
                <Text style={{ fontSize: 24 }}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                </Text>
              </View>
              <View
                style={[
                  styles.podiumRank,
                  {
                    height: index === 0 ? 100 : index === 1 ? 80 : 60,
                    backgroundColor:
                      index === 0
                        ? theme.colors.primaryContainer
                        : index === 1
                          ? theme.colors.secondaryContainer
                          : theme.colors.tertiaryContainer,
                  },
                ]}
              >
                <Text variant="displaySmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  #{player.rank}
                </Text>
              </View>
              <Text variant="labelSmall" numberOfLines={1} style={{ marginTop: 8 }}>
                {player.name}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                {player.score.toLocaleString()} pts
              </Text>
            </View>
          ))}
        </View>

        {/* Rankings List */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>
            Rankings
          </Text>

          {mockLeaderboard.slice(3).map((player) => (
            <Card
              key={player.id}
              style={[
                styles.card,
                {
                  backgroundColor: player.isYou ? theme.colors.surfaceVariant : theme.colors.surface,
                  borderLeftWidth: player.isYou ? 4 : 0,
                  borderLeftColor: theme.colors.primary,
                },
              ]}
            >
              <Card.Content style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={[
                    styles.rankCircle,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <Text style={{ fontWeight: 'bold' }}>#{player.rank}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text variant="labelLarge">
                    {player.name}
                    {player.isYou && (
                      <Text style={{ color: theme.colors.primary }}> (You)</Text>
                    )}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    Level {player.level}
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="labelLarge" style={{ fontWeight: 'bold' }}>
                    {player.score.toLocaleString()}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    pts
                  </Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
    </ImageBackground>
  );
});

function getMedalColor(index: number, theme: any): string {
  if (index === 0) return theme.colors.primaryContainer;
  if (index === 1) return theme.colors.secondaryContainer;
  return theme.colors.tertiaryContainer;
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  podiumSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  medalBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  podiumRank: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderRadius: 12,
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  card: {
    marginBottom: 8,
    borderRadius: 12,
  },
  rankCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
  },
});
