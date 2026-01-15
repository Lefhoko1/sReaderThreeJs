/**
 * Academy Enrollment Request Screen
 * Beautiful form for students to request enrollment in academies
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { Text, Card, Button, Icon, TextInput, Avatar, Chip, SegmentedButtons, RadioButton } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { TutoringAcademy, TutoringLevel, TutoringSubject } from '../../domain/entities/tutoring';
import { ID } from '../../shared/types';

interface AcademyEnrollmentRequestProps {
  academy: TutoringAcademy;
  levels: TutoringLevel[];
  subjects: TutoringSubject[];
  studentId: ID;
  onSubmit: (data: EnrollmentRequestData) => void;
  onCancel: () => void;
}

export interface EnrollmentRequestData {
  academyId: ID;
  studentId: ID;
  levelId?: ID;
  subjectIds: ID[];
  costTerm: 'MONTHLY' | 'TERMLY' | 'YEARLY';
  message: string;
  agreeToTerms: boolean;
}

export const AcademyEnrollmentRequest: React.FC<AcademyEnrollmentRequestProps> = ({
  academy,
  levels,
  subjects,
  studentId,
  onSubmit,
  onCancel,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<ID | undefined>();
  const [selectedSubjects, setSelectedSubjects] = useState<Set<ID>>(new Set());
  const [costTerm, setCostTerm] = useState<'MONTHLY' | 'TERMLY' | 'YEARLY'>('MONTHLY');
  const [message, setMessage] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubjectToggle = (subjectId: ID) => {
    const newSubjects = new Set(selectedSubjects);
    if (newSubjects.has(subjectId)) {
      newSubjects.delete(subjectId);
    } else {
      newSubjects.add(subjectId);
    }
    setSelectedSubjects(newSubjects);
  };

  const handleSubmit = async () => {
    if (!selectedLevel) {
      Alert.alert('Error', 'Please select a level');
      return;
    }

    if (selectedSubjects.size === 0) {
      Alert.alert('Error', 'Please select at least one subject');
      return;
    }

    if (!agreeToTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      onSubmit({
        academyId: academy.id,
        studentId,
        levelId: selectedLevel,
        subjectIds: Array.from(selectedSubjects),
        costTerm,
        message,
        agreeToTerms,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = selectedLevel
    ? subjects.filter((s) => s.levelId === selectedLevel)
    : [];

  const estimatedCost = 99; // Mock price

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Icon source="chevron-left" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enrollment Request</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Academy Summary */}
        <Card style={styles.academySummary}>
          <LinearGradient
            colors={['#7C6FD3', '#5A50A3']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <Avatar.Text size={60} label={academy.name.substring(0, 2)} />
              <View style={styles.summaryText}>
                <Text style={styles.academyName}>{academy.name}</Text>
                {academy.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Icon source="check-circle" size={14} color="#4CAF50" />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </Card>

        {/* Level Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Level</Text>
          <Text style={styles.sectionDescription}>Choose the educational level you want to enroll in</Text>

          <View style={styles.levelGrid}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                onPress={() => {
                  setSelectedLevel(level.id);
                  setSelectedSubjects(new Set()); // Reset subjects when level changes
                }}
                activeOpacity={0.7}
              >
                <Card
                  style={[
                    styles.levelCard,
                    selectedLevel === level.id && styles.levelCardSelected,
                  ]}
                >
                  <View style={styles.levelCardContent}>
                    <Icon
                      source={selectedLevel === level.id ? 'check-circle' : 'circle-outline'}
                      size={24}
                      color={selectedLevel === level.id ? '#7C6FD3' : '#ccc'}
                    />
                    <View style={styles.levelCardText}>
                      <Text style={styles.levelName}>{level.name}</Text>
                      <Text style={styles.levelCode}>{level.code}</Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject Selection */}
        {selectedLevel && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Subjects</Text>
            <Text style={styles.sectionDescription}>Choose one or more subjects to enroll in</Text>

            {filteredSubjects.length > 0 ? (
              <View style={styles.subjectList}>
                {filteredSubjects.map((subject) => (
                  <TouchableOpacity
                    key={subject.id}
                    onPress={() => handleSubjectToggle(subject.id)}
                    activeOpacity={0.7}
                  >
                    <Card
                      style={[
                        styles.subjectCard,
                        selectedSubjects.has(subject.id) && styles.subjectCardSelected,
                      ]}
                    >
                      <View style={styles.subjectCardContent}>
                        <Icon
                          source={
                            selectedSubjects.has(subject.id)
                              ? 'checkbox-marked-circle'
                              : 'checkbox-blank-circle-outline'
                          }
                          size={24}
                          color={
                            selectedSubjects.has(subject.id) ? '#7C6FD3' : '#ccc'
                          }
                        />
                        <View style={styles.subjectInfo}>
                          <Text style={styles.subjectName}>{subject.name}</Text>
                          <Text style={styles.subjectCode}>{subject.code}</Text>
                        </View>
                        {subject.costPerMonth && (
                          <Text style={styles.subjectPrice}>
                            ${subject.costPerMonth}/mo
                          </Text>
                        )}
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon source="folder-open" size={48} color="#ddd" />
                <Text style={styles.emptyText}>No subjects available for this level</Text>
              </View>
            )}
          </View>
        )}

        {/* Pricing Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Billing Cycle</Text>
          <Text style={styles.sectionDescription}>Choose how you want to pay</Text>

          <View style={styles.pricingOptions}>
            <TouchableOpacity
              onPress={() => setCostTerm('MONTHLY')}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.pricingOption,
                  costTerm === 'MONTHLY' && styles.pricingOptionSelected,
                ]}
              >
                <View style={styles.pricingOptionContent}>
                  <RadioButton
                    value="MONTHLY"
                    status={costTerm === 'MONTHLY' ? 'checked' : 'unchecked'}
                    onPress={() => setCostTerm('MONTHLY')}
                    color="#7C6FD3"
                  />
                  <View style={styles.pricingInfo}>
                    <Text style={styles.pricingTitle}>Monthly</Text>
                    <Text style={styles.pricingPrice}>${estimatedCost}/month</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCostTerm('TERMLY')}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.pricingOption,
                  costTerm === 'TERMLY' && styles.pricingOptionSelected,
                ]}
              >
                <View style={styles.pricingOptionContent}>
                  <RadioButton
                    value="TERMLY"
                    status={costTerm === 'TERMLY' ? 'checked' : 'unchecked'}
                    onPress={() => setCostTerm('TERMLY')}
                    color="#7C6FD3"
                  />
                  <View style={styles.pricingInfo}>
                    <Text style={styles.pricingTitle}>Per Term (Save 10%)</Text>
                    <Text style={styles.pricingPrice}>${Math.round(estimatedCost * 3 * 0.9)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCostTerm('YEARLY')}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.pricingOption,
                  costTerm === 'YEARLY' && styles.pricingOptionSelected,
                ]}
              >
                <View style={styles.pricingOptionContent}>
                  <RadioButton
                    value="YEARLY"
                    status={costTerm === 'YEARLY' ? 'checked' : 'unchecked'}
                    onPress={() => setCostTerm('YEARLY')}
                    color="#7C6FD3"
                  />
                  <View style={styles.pricingInfo}>
                    <Text style={styles.pricingTitle}>Yearly (Save 20%)</Text>
                    <Text style={styles.pricingPrice}>${Math.round(estimatedCost * 12 * 0.8)}</Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Message (Optional)</Text>
          <TextInput
            mode="outlined"
            placeholder="Tell us why you're interested in this academy..."
            multiline
            numberOfLines={4}
            value={message}
            onChangeText={setMessage}
            style={styles.messageInput}
            placeholderTextColor="#999"
          />
        </View>

        {/* Terms Checkbox */}
        <View style={styles.termsSection}>
          <TouchableOpacity
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            activeOpacity={0.7}
            style={styles.termsCheckbox}
          >
            <Icon
              source={
                agreeToTerms ? 'checkbox-marked' : 'checkbox-blank-outline'
              }
              size={24}
              color={agreeToTerms ? '#7C6FD3' : '#ccc'}
            />
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>terms and conditions</Text> and{' '}
              <Text style={styles.termsLink}>privacy policy</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonSection}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={styles.cancelButton}
            labelStyle={styles.buttonLabel}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading || !selectedLevel || selectedSubjects.size === 0}
            style={styles.submitButton}
            labelStyle={styles.buttonLabel}
          >
            Submit Request
          </Button>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

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
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  // Academy Summary
  academySummary: {
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  summaryGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: 12,
    flex: 1,
  },
  academyName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },

  // Level Grid
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelCard: {
    width: (width - 48) / 2,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  levelCardSelected: {
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#7C6FD3',
  },
  levelCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  levelCardText: {
    marginLeft: 12,
    flex: 1,
  },
  levelName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  levelCode: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },

  // Subject List
  subjectList: {
    gap: 8,
  },
  subjectCard: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  subjectCardSelected: {
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#7C6FD3',
  },
  subjectCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  subjectInfo: {
    flex: 1,
    marginLeft: 12,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  subjectCode: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  subjectPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C6FD3',
  },

  // Empty State
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
    marginTop: 8,
  },

  // Pricing Options
  pricingOptions: {
    gap: 10,
  },
  pricingOption: {
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  pricingOptionSelected: {
    backgroundColor: '#F3E5F5',
    borderWidth: 2,
    borderColor: '#7C6FD3',
  },
  pricingOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  pricingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  pricingTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  pricingPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C6FD3',
    marginTop: 2,
  },

  // Message Input
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
  },

  // Terms
  termsSection: {
    marginBottom: 24,
  },
  termsCheckbox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: '#7C6FD3',
    fontWeight: '600',
  },

  // Buttons
  buttonSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    borderColor: '#ddd',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#7C6FD3',
  },
  buttonLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Bottom Spacing
  bottomSpacing: {
    height: 20,
  },
});
