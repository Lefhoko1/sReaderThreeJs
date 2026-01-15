import React from 'react';
import { View, StyleSheet, ScrollView, Modal } from 'react-native';
import { Text, useTheme, IconButton, Surface } from 'react-native-paper';

interface CompanyProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function CompanyProfileModal({ visible, onDismiss }: CompanyProfileModalProps) {
  const theme = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <Surface style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.title, { color: theme.colors.onPrimary }]}>sReader</Text>
            <IconButton
              icon="close"
              iconColor={theme.colors.onPrimary}
              size={24}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Logo/Icon Section */}
            <View style={[styles.logoSection, { backgroundColor: theme.colors.primaryContainer }]}>
              <Text style={[styles.logoText, { color: '#1C1B1F' }]}>
                📚🎮
              </Text>
              <Text style={[styles.tagline, { color: '#1C1B1F' }]}>
                Learning Through Gaming
              </Text>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>About sReader</Text>
              <Text style={[styles.bodyText, { color: '#1C1B1F' }]}>
                sReader is an innovative mobile application designed to revolutionize the way students learn and engage with reading material. We combine the power of mobile gaming mechanics with educational content to create an engaging learning experience.
              </Text>
            </View>

            {/* Mission Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Our Mission</Text>
              <Text style={[styles.bodyText, { color: '#1C1B1F' }]}>
                To empower learners of all ages by gamifying education, making learning fun, interactive, and accessible. We believe that gaming and reading can coexist to create powerful learning outcomes.
              </Text>
            </View>

            {/* Features Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Features</Text>
              <FeatureItem
                icon="🎮"
                title="Gamified Learning"
                description="Earn points, badges, and unlock levels as you progress through reading assignments."
                theme={theme}
              />
              <FeatureItem
                icon="📖"
                title="Interactive Reading"
                description="Engage with dynamic reading materials designed to improve comprehension and retention."
                theme={theme}
              />
              <FeatureItem
                icon="🏆"
                title="Competitive Leaderboards"
                description="Challenge friends and other learners in global leaderboards to stay motivated."
                theme={theme}
              />
              <FeatureItem
                icon="👥"
                title="Social Learning"
                description="Connect with friends, join study groups, and share your learning achievements."
                theme={theme}
              />
              <FeatureItem
                icon="📊"
                title="Progress Tracking"
                description="Monitor your learning progress with detailed analytics and personalized insights."
                theme={theme}
              />
              <FeatureItem
                icon="🎯"
                title="Personalized Curriculum"
                description="Get learning paths tailored to your interests, pace, and educational level."
                theme={theme}
              />
            </View>

            {/* Values Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Our Values</Text>
              <ValueItem
                label="Innovation"
                description="We continuously innovate to provide the best learning experience."
                theme={theme}
              />
              <ValueItem
                label="Engagement"
                description="We make learning engaging, interactive, and enjoyable for all users."
                theme={theme}
              />
              <ValueItem
                label="Accessibility"
                description="Quality education should be accessible to everyone, everywhere."
                theme={theme}
              />
              <ValueItem
                label="Accountability"
                description="We are committed to measurable learning outcomes and student success."
                theme={theme}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: '#1C1B1F' }]}>
                Version 1.0.0
              </Text>
              <Text style={[styles.footerText, { color: '#1C1B1F' }]}>
                © 2026 sReader. All rights reserved.
              </Text>
            </View>
          </ScrollView>
        </Surface>
      </View>
    </Modal>
  );
}

interface FeatureItemProps {
  icon: string;
  title: string;
  description: string;
  theme: any;
}

function FeatureItem({ icon, title, description, theme }: FeatureItemProps) {
  return (
    <View style={[styles.featureItem, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <View style={styles.featureContent}>
        <Text style={[styles.featureTitle, { color: '#1C1B1F' }]}>{title}</Text>
        <Text style={[styles.featureDesc, { color: '#1C1B1F' }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

interface ValueItemProps {
  label: string;
  description: string;
  theme: any;
}

function ValueItem({ label, description, theme }: ValueItemProps) {
  return (
    <View style={styles.valueItem}>
      <Text style={[styles.valueLabel, { color: theme.colors.primary }]}>✓ {label}</Text>
      <Text style={[styles.valueDesc, { color: '#1C1B1F' }]}>
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  featureItem: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  valueItem: {
    marginBottom: 16,
  },
  valueLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  valueDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginLeft: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerText: {
    fontSize: 12,
    marginVertical: 4,
  },
});
