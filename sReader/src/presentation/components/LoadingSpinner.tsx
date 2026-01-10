/**
 * LoadingSpinner
 * Generic loading indicator.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

interface LoadingSpinnerProps {
  visible: boolean;
}

export function LoadingSpinner({ visible }: LoadingSpinnerProps) {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
