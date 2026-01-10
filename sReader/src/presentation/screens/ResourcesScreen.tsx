import React from 'react';
import { View, StyleSheet, ScrollView, ImageBackground } from 'react-native';
import { Card, Text, Button, useTheme, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';

const mockResources = [
  {
    id: 1,
    title: 'Algebra Mastery Path',
    description: 'Complete guide from basics to advanced algebra',
    level: 'Beginner',
    progress: 45,
    icon: 'math-integral-box',
  },
  {
    id: 2,
    title: 'Geometry Essentials',
    description: 'Learn shapes, angles, and spatial reasoning',
    level: 'Intermediate',
    progress: 20,
    icon: 'triangle',
  },
  {
    id: 3,
    title: 'Advanced Calculus',
    description: 'Deep dive into calculus concepts and applications',
    level: 'Advanced',
    progress: 0,
    icon: 'function',
  },
  {
    id: 4,
    title: 'Statistics & Probability',
    description: 'Master data analysis and probability theory',
    level: 'Intermediate',
    progress: 60,
    icon: 'chart-box',
  },
];

export const ResourcesScreen = observer(({ onBack }: { onBack: () => void }) => {
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
          Resources
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Learning Paths */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>
            📚 Learning Paths
          </Text>

          {mockResources.map((resource) => (
            <Card key={resource.id} style={styles.card}>
              <Card.Content>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: theme.colors.primaryContainer },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={resource.icon as any}
                      size={28}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="labelLarge">{resource.title}</Text>
                    <Text
                      variant="bodySmall"
                      numberOfLines={1}
                      style={{ color: theme.colors.outline, marginTop: 2 }}
                    >
                      {resource.description}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Chip compact icon="star">
                    {resource.level}
                  </Chip>
                  {resource.progress > 0 && (
                    <Chip compact icon="progress-check">
                      {resource.progress}%
                    </Chip>
                  )}
                </View>

                {resource.progress > 0 && (
                  <View style={{ marginBottom: 12 }}>
                    <View
                      style={[
                        styles.progressBar,
                        { backgroundColor: theme.colors.surfaceVariant },
                      ]}
                    >
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${resource.progress}%`,
                            backgroundColor: theme.colors.primary,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                <Button
                  mode={resource.progress > 0 ? 'contained' : 'contained-tonal'}
                  compact
                  style={{ alignSelf: 'flex-start' }}
                >
                  {resource.progress > 0 ? 'Continue' : 'Start'}
                </Button>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Study Tips */}
        <View style={styles.section}>
          <Text variant="titleSmall" style={{ marginBottom: 12 }}>
            💡 Study Tips
          </Text>

          {[
            {
              title: 'Practice Regularly',
              description: 'Daily practice improves retention by 40%',
            },
            {
              title: 'Join Study Groups',
              description: 'Collaborative learning boosts understanding',
            },
            {
              title: 'Take Breaks',
              description: 'Use the Pomodoro technique for focus',
            },
          ].map((tip, index) => (
            <Card key={index} style={styles.card}>
              <Card.Content>
                <Text variant="labelLarge">{tip.title}</Text>
                <Text
                  variant="bodySmall"
                  style={{ color: theme.colors.outline, marginTop: 4 }}
                >
                  {tip.description}
                </Text>
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
