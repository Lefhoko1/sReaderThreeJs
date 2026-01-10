# Data Persistence & Sync

## Local
- SQLite for offline storage of entities (assignments, attempts, schedules, submissions, friendships, etc.).
- Migrations versioned alongside entity classes.

## Cloud
- PostgreSQL as source of truth; message bus (optional) for sync events.
- Conflict Resolution
  - Schedules: last-writer-wins with audit trail.
  - Attempts: server appends; submissions immutable after posted.
  - Friendships: state machine with timestamps.

## Repositories
- Each entity has a repository interface and implementation: `LocalRepo` (SQLite) and `RemoteRepo` (API).
- ViewModels depend only on repository interfaces.

## Sync Flow
- Outbox pattern: mutations queued locally with `opId` for idempotency.
- Background sync reconciles and resolves with policies.

## Security
- Per-user and per-class ACLs; schedule visibility rules enforced server-side.
