# Architecture & MVVM

## Client (Expo/React Native)
- UI Layer: React Native + React Native Paper for theming & components.
- Navigation: expo-router (tabs/stack).
- Pattern: MVVM
  - Model: entity classes (TS) + validation schemas.
  - ViewModel: screen-level state, commands, repository calls.
  - View: RN Paper components bound to ViewModels.
- Data Access: Repository pattern (SQLite offline + network sync).
- Sync Engine: background tasks to reconcile local and server changes, with conflict policies.
- Realtime: multiplayer rooms (WebSocket or provider, e.g., Supabase Realtime), presence, turns, reactions.
 - Game Layer: turn manager, paragraph gating controller, feedback FX (particles/sound) orchestrated by ViewModels.

## Backend
- API: GraphQL or REST; consider NestJS + PostgreSQL + Prisma or Supabase for speed.
- Authentication: email/phone OTP; role/permissions enforcement.
- Realtime: WebSocket channels for multiplayer and presence.
- Storage: Postgres (cloud) + object storage for assets.
- Payments: Orange Money integration via provider/gateway; webhook processing to credit tickets/subscriptions.

## Key Design Principles
- Separation of Concerns (MVVM, repositories, services).
- Offline-first with strong consistency guarantees and retryable idempotent mutations.
- Observability (logs, tracing) and feature flags.
