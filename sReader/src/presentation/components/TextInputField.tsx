/**
 * TextInputField
 * Reusable, single-purpose text input component.
 * No business logic, pure UI.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

interface TextInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  error?: string;
  editable?: boolean;
}

export function TextInputField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  error,
  editable = true,
}: TextInputFieldProps) {
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={numberOfLines}
      error={!!error}
      editable={editable}
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: 12,
  },
});
