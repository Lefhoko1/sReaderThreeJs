# Next Steps (Implementation Plan)

1) Decide backend:
- Option A: Supabase (Auth, Postgres, Realtime, Storage) — fast start.
- Option B: NestJS + Postgres + Prisma + WebSockets — more control.

2) App Base (Expo)
- Add React Native Paper and theme provider.
- Set up `src/domain/entities` (TS/Zod) and `src/data` for repositories.
- Add SQLite setup with migrations.

3) Minimal Screens (MVVM)
- Home, Assignments List/Detail, Schedule, Friends.
- Guardian Rewards, Tutor Assignment Builder (skeleton).

4) Sync Service
- Outbox, retry policies, idempotent server endpoints.

5) Payments Stub
- Mock purchase flow; real Orange Money integration later.

6) Testing/CI
- Unit tests for ViewModels and repositories.
- E2E smoke (Detox) for core flows.
