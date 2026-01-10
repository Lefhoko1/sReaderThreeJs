/**
 * ErrorAlert
 * Displays error messages from ViewModel.
 * Single responsibility: show error UI.
 */

import React from 'react';
import { Snackbar } from 'react-native-paper';

interface ErrorAlertProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export function ErrorAlert({ visible, message, onDismiss }: ErrorAlertProps) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={onDismiss}
      duration={3000}
    >
      {message}
    </Snackbar>
  );
}
