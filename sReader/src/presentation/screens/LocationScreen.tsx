import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, Alert } from 'react-native';
import { Text, TextInput, Button, useTheme, ActivityIndicator } from 'react-native-paper';
import { observer } from 'mobx-react-lite';
import * as ExpoLocation from 'expo-location';
import { useAppContext } from '../context/AppContext';
import { Location } from '../../domain/entities/user';

export const LocationScreen = observer(({ onCancel, onSuccess }: {
  onCancel: () => void;
  onSuccess: () => void;
}) => {
  const theme = useTheme();
  const { authVM } = useAppContext();
  const user = authVM.currentUser;
  const currentLocation = authVM.currentLocation;

  const [latitude, setLatitude] = useState(currentLocation?.lat.toString() || '');
  const [longitude, setLongitude] = useState(currentLocation?.lng.toString() || '');
  const [address, setAddress] = useState(currentLocation?.address || '');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [gpsLoading, setGpsLoading] = useState(false);

  useEffect(() => {
    // Load user's saved location if available (don't request GPS here - violates user gesture requirement)
    if (user) {
      authVM.getLocation();
    }
  }, [user]);

  const handleGetLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use GPS');
        setGpsLoading(false);
        return;
      }

      const location = await ExpoLocation.getCurrentPositionAsync({ accuracy: ExpoLocation.Accuracy.High });
      const { latitude: lat, longitude: lng } = location.coords;
      
      setLatitude(lat.toFixed(8));
      setLongitude(lng.toFixed(8));
      setAddress(''); // User can enter address manually if desired
    } catch (error) {
      Alert.alert('Error', 'Could not get your location. Please check your GPS settings.');
    } finally {
      setGpsLoading(false);
    }
  };

  const handleSave = async () => {
    const newErrors: Record<string, boolean> = {};

    if (!latitude.trim()) {
      newErrors['latitude'] = true;
    } else {
      const lat = parseFloat(latitude);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        newErrors['latitude'] = true;
      }
    }

    if (!longitude.trim()) {
      newErrors['longitude'] = true;
    } else {
      const lng = parseFloat(longitude);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        newErrors['longitude'] = true;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && user) {
      const location: Location = {
        userId: user.id,
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        address: address.trim() || undefined,
        updatedAt: new Date().toISOString(),
      };

      const result = await authVM.saveLocation(location);

      if (result.ok) {
        onSuccess();
      }
    }
  };

  if (!user) {
    return (
      <ImageBackground
        source={require('@/assets/images/background.jpg')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.container}>
          <ActivityIndicator animating size="large" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('@/assets/images/background.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text variant="headlineSmall" style={{ color: theme.colors.primary, marginBottom: 4 }}>
              Set Your Location
            </Text>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Add your coordinates and address
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: theme.colors.surfaceVariant }]}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                📍 Location helps us provide personalized recommendations and connect you with nearby tutors and study groups.
              </Text>
            </View>

            {/* GPS Button */}
            <Button
              mode="contained-tonal"
              onPress={handleGetLocation}
              disabled={gpsLoading || authVM.loading}
              loading={gpsLoading}
              icon="crosshairs-gps"
              contentStyle={styles.gpsButtonContent}
              style={{ marginBottom: 16 }}
            >
              {gpsLoading ? 'Getting Location...' : 'Use GPS'}
            </Button>

            {/* Latitude */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge">Latitude</Text>
              <TextInput
                mode="outlined"
                label="Latitude (-90 to 90)"
                value={latitude}
                onChangeText={setLatitude}
                error={!!errors['latitude']}
                editable={!authVM.loading}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="e.g., 40.7128"
              />
              {errors['latitude'] && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  Valid latitude required (-90 to 90)
                </Text>
              )}
            </View>

            {/* Longitude */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge">Longitude</Text>
              <TextInput
                mode="outlined"
                label="Longitude (-180 to 180)"
                value={longitude}
                onChangeText={setLongitude}
                error={!!errors['longitude']}
                editable={!authVM.loading}
                keyboardType="decimal-pad"
                style={styles.input}
                placeholder="e.g., -74.0060"
              />
              {errors['longitude'] && (
                <Text style={[styles.errorText, { color: theme.colors.error }]}>
                  Valid longitude required (-180 to 180)
                </Text>
              )}
            </View>

            {/* Address (Optional) */}
            <View style={styles.fieldContainer}>
              <Text variant="labelLarge">Address (Optional)</Text>
              <TextInput
                mode="outlined"
                label="Your address or area name"
                value={address}
                onChangeText={setAddress}
                editable={!authVM.loading}
                style={styles.input}
                placeholder="e.g., New York, NY"
              />
            </View>

            {/* Quick Reference */}
            <View style={[styles.referenceCard, { backgroundColor: theme.colors.tertiaryContainer }]}>
              <Text variant="labelLarge" style={{ color: theme.colors.tertiary, marginBottom: 8 }}>
                Need coordinates?
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onTertiaryContainer }}>
                • Tap "Use GPS" to auto-detect your location{'\n'}
                • Or use Google Maps to find coordinates{'\n'}
                • Search your address and right-click for coordinates{'\n'}
                • Format: Latitude, Longitude
              </Text>
            </View>
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
              onPress={onCancel}
              disabled={authVM.loading}
              contentStyle={styles.buttonContent}
              style={styles.secondaryButton}
            >
              Skip
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={authVM.loading}
              disabled={authVM.loading}
              contentStyle={styles.buttonContent}
              style={styles.primaryButton}
            >
              {authVM.loading ? 'Saving...' : 'Save Location'}
            </Button>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  input: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  infoCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  referenceCard: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  gpsButtonContent: {
    paddingVertical: 8,
  },
  errorAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  successAlert: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
  },
  secondaryButton: {
    flex: 1,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});
