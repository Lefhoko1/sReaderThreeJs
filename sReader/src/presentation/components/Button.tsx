/**
 * Button
 * Simple, reusable button component.
 * No business logic.
 */

import React from 'react';
import { Button as PaperButton } from 'react-native-paper';

interface ButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'text' | 'outlined' | 'contained';
}

export function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
}: ButtonProps) {
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
    >
      {label}
    </PaperButton>
  );
}
