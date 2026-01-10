# SReader Architecture Setup

## Overview
A fully layered, type-safe mobile app with **MVVM pattern**, **offline-first SQLite**, and **best-practice separation of concerns**.

## Structure

```
src/
  domain/entities/              ← Pure data models (no logic)
    user.ts, academy.ts, assignment.ts, schedule.ts, attempt.ts, 
    multiplayer.ts, billing.ts, reward.ts, gamification.ts, notification.ts, social.ts

  data/repositories/            ← Repository interfaces (contracts)
    IUserRepository.ts, IAcademyRepository.ts, IAssignmentRepository.ts, etc.

  data/sqlite/                  ← Local SQLite implementations
    SQLiteDatabase.ts (schema & connection)
    SQLiteUserRepository.ts, SQLiteAssignmentRepository.ts, SQLiteScheduleRepository.ts

  application/viewmodels/       ← MVVM controllers (business logic, observable state)
    AuthViewModel.ts, AssignmentViewModel.ts, ScheduleViewModel.ts

  presentation/
    context/                    ← Dependency injection (AppContext)
    components/                 ← Reusable UI (Button, TextInputField, ErrorAlert, LoadingSpinner)
    screens/                    ← Full-page views wired to ViewModels
      RegisterScreen.tsx, AssignmentListScreen.tsx
    theme/                      ← React Native Paper theming

  shared/
    types.ts                    ← Enums (Role, Visibility), type aliases
    result.ts                   ← Error handling (Ok/Err pattern)
    validation/                 ← Zod schemas for input validation
    initialization.ts           ← App startup bootstrap

app/
  _layout.tsx                   ← Root layout with AppContextProvider + PaperProvider
```

## Key Principles

### 1. **Single Responsibility**
- **Entities**: Data shapes only, no methods.
- **Repositories**: Data access contracts; implementations handle SQLite/network.
- **ViewModels**: Business logic and state management; coordinate repos.
- **Components**: Pure UI; no business logic.
- **Screens**: Glue ViewModels to component trees.

### 2. **Dependency Inversion**
- ViewModels depend on repository *interfaces*, not implementations.
- Screens depend on ViewModels via injected context.
- Easy to swap SQLite for network repos or mock for testing.

### 3. **Type Safety**
- TypeScript for compile-time safety.
- Zod schemas for runtime validation of inputs.
- Result<T> for explicit error handling (no exceptions).

### 4. **Reactive UI (MobX)**
- `@observer` decorators bind components to ViewModel state.
- Changes automatically trigger re-renders.
- No manual subscription management.

### 5. **Offline-First**
- SQLite stores assignments, schedules, friendships locally.
- ViewModels read/write to repos; network sync TBD.

## Usage

### Inject Dependencies
Components access repos and ViewModels via `useAppContext()`:

```tsx
import { useAppContext } from '@/src/presentation/context/AppContext';
import { observer } from 'mobx-react-lite';

export const MyScreen = observer(() => {
  const { authVM, assignmentVM } = useAppContext();
  // Use ViewModels...
});
```

### Add a New Entity & ViewModel

1. **Define entity** in `src/domain/entities/myentity.ts`.
2. **Create repo interface** in `src/data/repositories/IMyEntityRepository.ts`.
3. **Implement repo** in `src/data/sqlite/SQLiteMyEntityRepository.ts`.
4. **Create ViewModel** in `src/application/viewmodels/MyEntityViewModel.ts` with MobX.
5. **Inject in AppContext** (`src/presentation/context/AppContext.tsx`).
6. **Build screens** that consume the ViewModel via `useAppContext()`.

### Validate Input

```tsx
import { AssignmentSchema } from '@/src/shared/validation';

const result = AssignmentSchema.safeParse(inputData);
if (!result.success) {
  console.error(result.error);
  return;
}
const validated = result.data;
```

## Running the App

```bash
cd sReader
npm install
npm start          # Start Expo CLI

# In Expo CLI:
# i  - iOS simulator
# a  - Android emulator
# w  - Web browser
```

## Next Steps

1. **Network Sync**: Implement RemoteRepository for cloud sync (Supabase/NestJS backend).
2. **Multiplayer**: Add multiplayer ViewModels and WebSocket presence.
3. **Game Layer**: Paragraph gating, turn manager, FX orchestration in dedicated service.
4. **Auth Flow**: Integrate OTP login and session management.
5. **E2E Tests**: Detox tests for critical flows.

## Stack

- **Framework**: Expo (React Native)
- **UI**: React Native Paper
- **State**: MobX + mobx-react-lite
- **Data**: expo-sqlite
- **Validation**: Zod
- **Routing**: expo-router
- **Type**: TypeScript
- **Linting**: ESLint + Expo config
