/**
 * AppContext
 * React Context for dependency injection: repos and ViewModels.
 * Prevents prop-drilling and centralizes singleton instances.
 * Uses platform-specific repository implementations.
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { IUserRepository, IAssignmentRepository, IScheduleRepository } from '../../data/repositories';
import { SQLiteUserRepository } from '../../data/sqlite/SQLiteUserRepository';
import { SQLiteAssignmentRepository } from '../../data/sqlite/SQLiteAssignmentRepository';
import { SQLiteScheduleRepository } from '../../data/sqlite/SQLiteScheduleRepository';
import { SupabaseUserRepository } from '../../data/supabase/SupabaseUserRepository';
import { SupabaseAssignmentRepository } from '../../data/supabase/SupabaseAssignmentRepository';
import { SupabaseScheduleRepository } from '../../data/supabase/SupabaseScheduleRepository';
import { InMemoryAssignmentRepository } from '../../data/memory/InMemoryAssignmentRepository';
import { InMemoryScheduleRepository } from '../../data/memory/InMemoryScheduleRepository';
import { AuthViewModel, AssignmentViewModel, ScheduleViewModel } from '../../application/viewmodels';
import { DashboardViewModel } from '../../application/viewmodels/DashboardViewModel';
import { seedInMemoryData } from '../../shared/seedInMemoryData';

interface AppContextType {
  // Repositories
  userRepo: IUserRepository;
  assignmentRepo: IAssignmentRepository;
  scheduleRepo: IScheduleRepository;

  // ViewModels
  authVM: AuthViewModel;
  assignmentVM: AssignmentViewModel;
  scheduleVM: ScheduleViewModel;
  dashboardVM: DashboardViewModel;
}

const AppContextInstance = createContext<AppContextType | undefined>(undefined);

interface AppContextProviderProps {
  children: ReactNode;
}

export function AppContextProvider(props: AppContextProviderProps) {
  const { children } = props;
  const [isSeeded, setIsSeeded] = useState(false);

  // Initialize repositories based on platform
  // Web: Use Supabase for all (database backend)
  // Native: Use SQLite for offline storage
  const userRepo = Platform.OS === 'web' ? new SupabaseUserRepository() : new SQLiteUserRepository();
  const assignmentRepo = Platform.OS === 'web' ? new SupabaseAssignmentRepository() : new SQLiteAssignmentRepository();
  const scheduleRepo = Platform.OS === 'web' ? new SupabaseScheduleRepository() : new SQLiteScheduleRepository();

  // Initialize ViewModels
  const authVM = new AuthViewModel(userRepo);
  const assignmentVM = new AssignmentViewModel(assignmentRepo);
  const scheduleVM = new ScheduleViewModel(scheduleRepo);
  const dashboardVM = new DashboardViewModel();

  // Seed Supabase data on web platform startup
  useEffect(() => {
    const seedData = async () => {
      if (Platform.OS === 'web' && !isSeeded) {
        try {
          // Supabase will auto-seed via initialization.ts if tables are empty
          console.log('✓ Using Supabase backend for web');
          setIsSeeded(true);
        } catch (error) {
          console.error('✗ Failed to initialize Supabase:', error);
        }
      }
    };
    seedData();
  }, [isSeeded]);

  const value: AppContextType = {
    userRepo,
    assignmentRepo,
    scheduleRepo,
    authVM,
    assignmentVM,
    scheduleVM,
    dashboardVM,
  };

  return (
    <AppContextInstance.Provider value={value}>
      {children}
    </AppContextInstance.Provider>
  );
}

export function useAppContext(): AppContextType {
  const context = useContext(AppContextInstance);
  if (context === undefined) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
}
