/**
 * Initialization service for app startup.
 * Handles SQLite database initialization and other setup.
 */

import { Platform } from 'react-native';

export const initializeApp = async (): Promise<void> => {
  try {
    // Skip SQLite initialization on web (not supported)
    if (Platform.OS === 'web') {
      console.log('⚠ Running on web - using in-memory storage (data will not persist)');
      return;
    }

    // Only import SQLite modules on native platforms
    const { sqliteDb } = await import('../data/sqlite/SQLiteDatabase');
    const { SQLiteAssignmentRepository } = await import('../data/sqlite/SQLiteAssignmentRepository');
    const { seedDemoData } = await import('./seedData');

    await sqliteDb.initialize();
    console.log('✓ SQLite database initialized');

    // Seed demo data
    const assignmentRepo = new SQLiteAssignmentRepository();
    await seedDemoData(assignmentRepo);
  } catch (e) {
    console.error('✗ Failed to initialize app:', e);
    // Don't throw - allow app to continue with in-memory storage
  }
};
