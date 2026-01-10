# Domain Model

## Core Entities (high-level)
- User(id, roles[], email/phone, displayName, avatarUrl)
- Profile(userId FK, student|guardian|tutor details)
- Location(userId FK, lat, lng, address, updatedAt)
- Academy(id, ownerUserId FK, name, description)
- Class(id, academyId FK, name, term, subject)
- Enrollment(id, classId FK, studentUserId FK, role)
- Friendship(id, requesterUserId, addresseeUserId, status: PENDING|ACCEPTED|BLOCKED)
- Assignment(id, classId FK, title, description, contentBlocks[], tools[], dueAt)
- AssignmentTool(id, assignmentId FK, type, uri, metadata)
- Schedule(id, studentUserId FK, assignmentId FK, startsAt, endsAt, visibility: PRIVATE|FRIENDS|CLASS)
- Attempt(id, assignmentId FK, userId FK, mode: SOLO|MULTI, state, score, startedAt, endedAt)
- Submission(id, attemptId FK, payload, status, submittedAt)
- MultiplayerRoom(id, assignmentId FK, hostUserId FK, status, createdAt)
- PlayerState(id, roomId FK, userId FK, turnOrder, isConnected, lastActiveAt)
- EmojiReaction(id, roomId FK, fromUserId FK, toUserId FK, type, at)
- Subscription(id, userId FK, tier, status, expiresAt)
- Ticket(id, userId FK, type, balance)
- PaymentTransaction(id, userId FK, provider, amount, currency, status, reference, createdAt)
- ContentAsset(id, type: ILLUSTRATION|AUDIO|PDF, uri, checksum, ownerUserId)
- Reward(id, guardianUserId FK, studentUserId FK, condition, message, grantType, payload)
- Notification(id, userId FK, type, payload, readAt)
- Device(id, userId FK, pushToken, platform)
 - GamificationProfile(id, userId FK, points, level, theme)
 - PointsLedger(id, userId FK, delta, reason, meta, at)
 - Achievement(id, userId FK, key, name, earnedAt, meta)

## Relationships (selected)
- User 1–1 Profile; User 1–N Device; User N–N Friendship; User N–N Class via Enrollment.
- Academy 1–N Class; Class 1–N Assignment; Assignment 1–N Attempt; Attempt 1–1 Submission.
- Assignment 1–N AssignmentTool; Assignment N–N ContentAsset; Assignment 1–N Schedule.
- MultiplayerRoom 1–N PlayerState and 1–N EmojiReaction.

## ERD (ASCII)
```
User --1..1--> Profile
User --1..*--> Device
User --*..*--> Class (via Enrollment)
User --*..*--> User (Friendship)
Class --1..*--> Assignment --1..*--> Attempt --1..1--> Submission
Assignment --1..*--> AssignmentTool
Assignment --1..*--> Schedule --*..1--> User
Assignment --1..*--> MultiplayerRoom --1..*--> PlayerState
User --1..1--> GamificationProfile --1..*--> PointsLedger
User --1..*--> Achievement
User --1..*--> Subscription, Ticket, PaymentTransaction
Guardian(User) --1..*--> Reward --*..1--> Student(User)
User --1..1--> GamificationProfile --1..*--> PointsLedger
User --1..*--> Achievement
```

## Entity Class Guidelines
- Define TypeScript entity classes/interfaces in `src/domain/entities`.
- Use code-first approach to generate DB schema (e.g., Prisma) from entities.
- All forms post/consume entity-class shapes with validation (Zod).
 - Assignment.contentBlocks types include: DEFINITION, ILLUSTRATION_PICK, FILL_IN_BLANK, REARRANGE, PARAGRAPH_GATE.
