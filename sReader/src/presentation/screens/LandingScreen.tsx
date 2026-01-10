import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const LandingScreen = ({ onGetStarted }: { onGetStarted: () => void }) => {
  const theme = useTheme();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Spacer */}
      <View style={styles.topSpacer} />

      {/* Logo & Brand */}
      <View style={styles.logoSection}>
        <View style={[styles.logoContainer, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons 
            name="book-open-page-variant" 
            size={64} 
            color={theme.colors.primary}
          />
        </View>
        <Text variant="displaySmall" style={[styles.brandName, { color: theme.colors.primary }]}>
          sReader
        </Text>
        <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
          Interactive Learning Platform
        </Text>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text 
          variant="headlineMedium" 
          style={[styles.headline, { color: theme.colors.onBackground }]}
        >
          Learn Smarter, Not Harder
        </Text>
        <Text 
          variant="bodyLarge" 
          style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
        >
          Engage with interactive assignments, compete with friends, and unlock your learning potential through gamified education.
        </Text>
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <FeatureCard
          icon="lightning-bolt"
          title="Interactive Learning"
          description="Dynamic assignments with real-time feedback"
          color={theme.colors.primary}
        />
        <FeatureCard
          icon="trophy"
          title="Gamified Progress"
          description="Earn points, badges, and compete on leaderboards"
          color={theme.colors.primary}
        />
        <FeatureCard
          icon="account-multiple"
          title="Social Learning"
          description="Collaborate with classmates and build your network"
          color={theme.colors.primary}
        />
      </View>

      {/* CTA Buttons */}
      <View style={styles.ctaSection}>
        <Button
          mode="contained"
          onPress={onGetStarted}
          contentStyle={styles.buttonContent}
          style={styles.primaryButton}
        >
          Get Started
        </Button>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textAlign: 'center' }}>
          Join thousands of students transforming their learning journey
        </Text>
      </View>

      {/* Footer Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  color: string;
}) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.featureCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={[styles.featureIconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={28} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="labelLarge" style={{ color: theme.colors.onBackground, marginBottom: 4 }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {description}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topSpacer: {
    height: 20,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandName: {
    fontWeight: 'bold',
  },
  heroSection: {
    marginBottom: 48,
  },
  headline: {
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresSection: {
    marginBottom: 48,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaSection: {
    marginBottom: 32,
    gap: 12,
  },
  buttonContent: {
    paddingVertical: 10,
  },
  primaryButton: {
    borderRadius: 8,
  },
  bottomInfo: {
    marginBottom: 24,
  },
  bottomSpacer: {
    height: 40,
  },
});
