/**
 * Initialization service for app startup.
 * Handles Supabase connection and SQLite for offline sync.
 */

import { Platform } from 'react-native';

export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing app...');

    // Initialize Supabase connection (works on all platforms)
    const { default: supabase } = await import('../data/supabase/supabaseClient');
    
    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (!error) {
      console.log('✓ Supabase connected successfully');
    } else {
      console.warn('⚠ Supabase connection issue:', error.message);
    }

    // Initialize SQLite for offline storage (mobile only)
    if (Platform.OS !== 'web') {
      const { sqliteDb } = await import('../data/sqlite/SQLiteDatabase');
      await sqliteDb.initialize();
      console.log('✓ SQLite database initialized for offline sync');
    } else {
      console.log('⚠ Running on web - SQLite not available, using Supabase only');
    }

  } catch (e) {
    console.error('✗ Failed to initialize app:', e);
    // Don't throw - allow app to continue
  }
};
