import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator, Card, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { observer } from 'mobx-react-lite';
import { useAppContext } from '../context/AppContext';
import { User } from '../../domain/entities/user';
import { Role } from '../../shared/types';

export const EditProfileScreen = observer(({ onCancel, onSuccess, onHome }: {
  onCancel: () => void;
  onSuccess: () => void;
  onHome?: () => void;
}) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const user = authVM.currentUser;

  // General fields
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState('');
  
  // Student fields
  const [gradeLevel, setGradeLevel] = useState('');
  const [schoolName, setSchoolName] = useState('');
  
  // Tutor fields
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  
  // Guardian fields
  const [relationshipToStudent, setRelationshipToStudent] = useState('');
  const [occupation, setOccupation] = useState('');
  
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const isStudent = user?.roles.includes(Role.STUDENT);
  const isTutor = user?.roles.includes(Role.TUTOR);
  const isGuardian = user?.roles.includes(Role.GUARDIAN);

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!displayName.trim()) {
      newErrors['displayName'] = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && user) {
      // Update user data (displayName, phone)
      const updatedUser: User = {
        ...user,
        displayName,
        phone,
        updatedAt: new Date().toISOString(),
      };

      const userResult = await authVM.updateUserProfile(updatedUser);

      if (userResult.ok) {
        // Update the profile
        const profileResult = await authVM.updateProfile({
          userId: user.id,
          bio,
          locationConsent: false,
        });

        // Update role-specific data
        if (isStudent && gradeLevel) {
          await authVM.updateStudentProfile({
            id: user.id,
            gradeLevel,
            schoolName,
          });
        }

        if (isGuardian && relationshipToStudent) {
          await authVM.updateGuardianProfile({
            id: user.id,
            relationshipToStudent,
            occupation,
          });
        }

        if (isTutor && yearsOfExperience) {
          await authVM.updateTutorProfile({
            id: user.id,
            yearsOfExperience: parseInt(yearsOfExperience, 10),
            specializations: specializations.split(',').map(s => s.trim()),
            educationLevel,
            hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0,
          });
        }

        if (profileResult.ok) {
          onSuccess();
        }
      }
    }
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator animating size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Card */}
          <Card style={[styles.headerCard, { backgroundColor: theme.colors.primary }]}>
            <Card.Content style={styles.headerContent}>
              <MaterialCommunityIcons name="pencil-circle" size={32} color="#fff" />
              <Text variant="headlineSmall" style={[styles.headerTitle, { color: '#fff', marginLeft: 12 }]}>
                Edit Profile
              </Text>
            </Card.Content>
          </Card>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Display Name */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                Full Name
              </Text>
              <TextInput
                mode="outlined"
                label="Your full name"
                value={displayName}
                onChangeText={setDisplayName}
                error={!!errors['displayName']}
                editable={!authVM.loading}
                style={styles.input}
              />
              {errors['displayName'] && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  Name is required
                </Text>
              )}
            </View>

            {/* Email (Read-only) */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                Email
              </Text>
              <TextInput
                mode="outlined"
                label="Your email"
                value={user.email || ''}
                editable={false}
                disabled
                style={styles.input}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                Email cannot be changed
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                Phone (Optional)
              </Text>
              <TextInput
                mode="outlined"
                label="Your phone number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="+1 (555) 000-0000"
                editable={!authVM.loading}
                style={styles.input}
              />
            </View>

            {/* Bio */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                Bio (Optional)
              </Text>
              <TextInput
                mode="outlined"
                label="Tell us about yourself"
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={4}
                maxLength={500}
                editable={!authVM.loading}
                style={styles.input}
              />
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {bio.length}/500 characters
              </Text>
            </View>

            {/* Student-specific fields */}
            {isStudent && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginVertical: 16 }}>
                  📚 Student Information
                </Text>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Grade Level (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="e.g., 10th Grade"
                    value={gradeLevel}
                    onChangeText={setGradeLevel}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    School Name (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="Your school name"
                    value={schoolName}
                    onChangeText={setSchoolName}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            {/* Guardian-specific fields */}
            {isGuardian && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginVertical: 16 }}>
                  👨‍👩‍👧 Guardian Information
                </Text>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Relationship (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="e.g., Parent, Grandparent"
                    value={relationshipToStudent}
                    onChangeText={setRelationshipToStudent}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Occupation (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="Your occupation"
                    value={occupation}
                    onChangeText={setOccupation}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            {/* Tutor-specific fields */}
            {isTutor && (
              <>
                <Divider style={styles.divider} />
                <Text variant="titleMedium" style={{ color: theme.colors.primary, marginVertical: 16 }}>
                  🎓 Tutor Information
                </Text>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Years of Experience (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="e.g., 5"
                    value={yearsOfExperience}
                    onChangeText={setYearsOfExperience}
                    keyboardType="number-pad"
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Specializations (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="e.g., Math, Physics (comma separated)"
                    value={specializations}
                    onChangeText={setSpecializations}
                    multiline
                    numberOfLines={2}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Education Level (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="e.g., Bachelor, Master, PhD"
                    value={educationLevel}
                    onChangeText={setEducationLevel}
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
                <View style={styles.fieldContainer}>
                  <Text variant="labelLarge" style={{ color: theme.colors.primary, marginBottom: 8 }}>
                    Hourly Rate (Optional)
                  </Text>
                  <TextInput
                    mode="outlined"
                    label="$0.00"
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="decimal-pad"
                    editable={!authVM.loading}
                    style={styles.input}
                  />
                </View>
              </>
            )}

            {/* Account Info Card */}
            <Divider style={styles.divider} />
            <Card style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Card.Content>
                <Text variant="labelLarge" style={{ marginBottom: 12, color: theme.colors.onBackground }}>
                  Account Information
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>User ID:</Text> {user.id.slice(0, 8)}...
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                  <Text style={{ fontWeight: 'bold' }}>Roles:</Text> {user.roles.join(', ')}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  <Text style={{ fontWeight: 'bold' }}>Member Since:</Text> {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </Card.Content>
            </Card>
          </View>

          {/* Error Message */}
          {authVM.error && (
            <View style={[styles.errorAlert, { backgroundColor: theme.colors.errorContainer }]}>
              <Text style={{ color: theme.colors.error }}>⚠ {authVM.error}</Text>
            </View>
          )}

          {/* Success Message */}
          {authVM.successMessage && (
            <View style={[styles.successAlert, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Text style={{ color: theme.colors.tertiary }}>✓ {authVM.successMessage}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              icon="close"
              onPress={onCancel}
              disabled={authVM.loading}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              icon="check"
              onPress={handleSave}
              loading={authVM.loading}
              disabled={authVM.loading}
              contentStyle={styles.buttonContent}
              style={styles.button}
            >
              {authVM.loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </View>

          {/* Home Button */}
          {onHome && (
            <Button
              mode="outlined"
              icon="home"
              onPress={onHome}
              disabled={authVM.loading}
              contentStyle={styles.buttonContent}
              style={[styles.button, styles.homeButton]}
            >
              Go to Home
            </Button>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 16,
  },
  headerCard: {
    marginBottom: 24,
    borderRadius: 12,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  form: {
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  divider: {
    marginVertical: 24,
  },
  infoCard: {
    borderRadius: 12,
    marginTop: 16,
  },
  errorAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  successAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    borderRadius: 8,
  },
  homeButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
