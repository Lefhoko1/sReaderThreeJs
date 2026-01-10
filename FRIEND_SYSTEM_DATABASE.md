# Friend System - Database & Schema Updates

## Overview

The friend management system leverages the existing Prisma schema that already includes the `Friendship` and `Notification` models. No new database migrations are required as the schema was already prepared for this feature.

## Database Schema

### Friendship Model

```prisma
model Friendship {
  id         String   @id @default(uuid()) @db.Uuid
  fromUserId String   @map("from_user_id") @db.Uuid
  toUserId   String   @map("to_user_id") @db.Uuid
  status     String   @default("PENDING") // 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED'
  createdAt  DateTime @default(now()) @map("created_at")

  fromUser User @relation("FriendshipFrom", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser   User @relation("FriendshipTo", fields: [toUserId], references: [id], onDelete: Cascade)

  @@unique([fromUserId, toUserId])
  @@index([fromUserId])
  @@index([toUserId])
  @@map("friendships")
}
```

### Table: `friendships`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique friendship identifier |
| `from_user_id` | UUID | FOREIGN KEY (users) | User sending the request |
| `to_user_id` | UUID | FOREIGN KEY (users) | User receiving the request |
| `status` | VARCHAR | DEFAULT 'PENDING' | PENDING, ACCEPTED, REJECTED, or BLOCKED |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When friendship was created |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update time |

### Unique Constraint

- **`(from_user_id, to_user_id)`** - Prevents duplicate requests in same direction
- Note: A→B is different from B→A, so both can exist

### Indexes

- **Index on `from_user_id`** - Fast lookup of requests sent by a user
- **Index on `to_user_id`** - Fast lookup of requests received by a user

## SQL Examples

### Create a Friendship Request

```sql
INSERT INTO friendships (id, from_user_id, to_user_id, status, created_at)
VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',  -- User A
  '550e8400-e29b-41d4-a716-446655440001',  -- User B
  'PENDING',
  NOW()
);
```

### Accept a Friendship

```sql
UPDATE friendships
SET status = 'ACCEPTED'
WHERE id = '550e8400-e29b-41d4-a716-446655440002';
```

### List Friends for a User

```sql
SELECT f.*, u.display_name, u.avatar_url
FROM friendships f
JOIN users u ON (
  CASE
    WHEN f.from_user_id = '550e8400-e29b-41d4-a716-446655440000' 
      THEN f.to_user_id = u.id
    ELSE f.from_user_id = u.id
  END
)
WHERE f.status = 'ACCEPTED'
AND (f.from_user_id = '550e8400-e29b-41d4-a716-446655440000'
  OR f.to_user_id = '550e8400-e29b-41d4-a716-446655440000')
ORDER BY f.created_at DESC;
```

### List Pending Requests for a User

```sql
SELECT f.*, u.display_name, u.avatar_url
FROM friendships f
JOIN users u ON f.from_user_id = u.id
WHERE f.status = 'PENDING'
AND f.to_user_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY f.created_at DESC;
```

### Remove a Friendship

```sql
DELETE FROM friendships
WHERE id = '550e8400-e29b-41d4-a716-446655440002';
```

### Block a User

```sql
UPDATE friendships
SET status = 'BLOCKED'
WHERE (from_user_id = 'user-id-1' AND to_user_id = 'user-id-2')
  OR (from_user_id = 'user-id-2' AND to_user_id = 'user-id-1');
```

## Notification Model

The system integrates with the existing `Notification` model:

```prisma
model Notification {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  type      String    // 'FRIEND_REQUEST', 'FRIEND_REQUEST_ACCEPTED', etc.
  payload   Json      @default("{}")
  readAt    DateTime? @map("read_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("notifications")
}
```

### Notification Payload Examples

**Friend Request Notification:**
```json
{
  "type": "FRIEND_REQUEST",
  "fromUserId": "user-id-1",
  "fromUserName": "John Doe",
  "friendshipId": "friendship-id-1",
  "message": "John Doe sent you a friend request"
}
```

**Acceptance Notification:**
```json
{
  "type": "FRIEND_REQUEST_ACCEPTED",
  "byUserId": "user-id-2",
  "byUserName": "Jane Smith",
  "message": "Jane Smith accepted your friend request"
}
```

## Data Relationships

### User - Friendship Relationships

```
User (1) ──────→ Friendship (many) [as fromUser]
                      ↓
                   friendship.fromUserId
                   
User (1) ──────→ Friendship (many) [as toUser]
                      ↓
                   friendship.toUserId
```

### Entity Cardinality

- One User can have many outgoing friendship requests (`friendshipsFrom`)
- One User can have many incoming friendship requests (`friendshipsTo`)
- One Friendship can only have 2 users (from and to)

## Data Consistency

### Cascade Delete

When a user is deleted:
- All their outgoing friendship records are deleted
- All their incoming friendship records are deleted
- No orphaned references remain

### Unique Constraint

The unique constraint on `(fromUserId, toUserId)` ensures:
- No duplicate requests in the same direction
- A→B and B→A are treated as separate relationships (can coexist)
- Prevents accidental duplicate inserts

## Supabase Configuration

### Row-Level Security (RLS) - Optional

For enhanced security, consider implementing RLS policies:

```sql
-- Users can only see friendships where they are involved
CREATE POLICY "Users can view their own friendships"
ON friendships
FOR SELECT
USING (auth.uid()::text = from_user_id OR auth.uid()::text = to_user_id);

-- Users can only insert their own requests
CREATE POLICY "Users can create friend requests"
ON friendships
FOR INSERT
WITH CHECK (auth.uid()::text = from_user_id);

-- Users can only update their own received requests
CREATE POLICY "Users can respond to friend requests"
ON friendships
FOR UPDATE
USING (auth.uid()::text = to_user_id)
WITH CHECK (auth.uid()::text = to_user_id);
```

## Performance Considerations

### Query Optimization

1. **Indexes on `from_user_id` and `to_user_id`** - Already in schema
2. **Join with users table** - Include user display_name and avatar_url
3. **Status filtering** - Filter by status (PENDING, ACCEPTED) early

### Recommended Query Patterns

```sql
-- Fast friend list query
SELECT f.id, f.status, u.id, u.display_name, u.avatar_url
FROM friendships f
JOIN users u ON (f.from_user_id = u.id OR f.to_user_id = u.id)
WHERE f.status = 'ACCEPTED'
AND (f.from_user_id = $1 OR f.to_user_id = $1)
AND (f.from_user_id != $1 OR f.to_user_id != $1);
```

### Pagination Support

```sql
SELECT f.*, u.*
FROM friendships f
JOIN users u ON ...
WHERE status = 'ACCEPTED' AND (f.from_user_id = $1 OR f.to_user_id = $1)
ORDER BY f.created_at DESC
LIMIT 20 OFFSET 0;
```

## Migration Status

✅ **No migration needed** - Schema already includes:
- `Friendship` model with all required fields
- `Notification` model for notifications
- Proper indexes and constraints
- User relations configured

The database is ready to support the friend system immediately.

## Testing Data

### Insert Test Users

```sql
INSERT INTO users (id, email, display_name, roles, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'student1@example.com', 'Alice Johnson', ARRAY['STUDENT'], NOW(), NOW()),
  (gen_random_uuid(), 'student2@example.com', 'Bob Smith', ARRAY['STUDENT'], NOW(), NOW()),
  (gen_random_uuid(), 'student3@example.com', 'Charlie Brown', ARRAY['STUDENT'], NOW(), NOW());
```

### Insert Test Friendships

```sql
INSERT INTO friendships (id, from_user_id, to_user_id, status, created_at)
SELECT 
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'student1@example.com'),
  (SELECT id FROM users WHERE email = 'student2@example.com'),
  'PENDING',
  NOW();
```

## Monitoring & Metrics

Consider tracking:
- Total number of friendships
- Pending requests count
- Average friends per student
- Request accept/decline rates
- Popular students by friend count

```sql
-- Friendship statistics
SELECT
  COUNT(*) as total_friendships,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'ACCEPTED' THEN 1 END) as accepted_friendships,
  AVG(CASE WHEN status = 'ACCEPTED' THEN 1 ELSE 0 END)::numeric as acceptance_rate
FROM friendships;

-- Friends per user
SELECT
  user_id,
  COUNT(*) as friend_count
FROM (
  SELECT from_user_id as user_id FROM friendships WHERE status = 'ACCEPTED'
  UNION ALL
  SELECT to_user_id as user_id FROM friendships WHERE status = 'ACCEPTED'
) t
GROUP BY user_id
ORDER BY friend_count DESC;
```

## References

- See [FRIEND_SYSTEM_GUIDE.md](./FRIEND_SYSTEM_GUIDE.md) for architecture details
- See [FRIEND_SYSTEM_QUICKSTART.md](./FRIEND_SYSTEM_QUICKSTART.md) for user guide
- Original Prisma schema: [sReader/prisma/schema.prisma](./sReader/prisma/schema.prisma)
