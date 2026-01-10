# Friend Management System - Implementation Guide

## Overview

The Friend Management System allows students in the sReader application to discover other students, send and receive friend requests, and manage their friend connections. It includes a dedicated Friends screen with three main sections (Discover, Requests, Friends) and a Friends Widget on the home page showing quick stats and recent friends.

## Features

### 1. **Student Discovery**
- Browse all students in the system (excluding yourself)
- Search functionality to find specific students
- View student profiles with name, email, and avatar
- Send friend requests with a single tap

### 2. **Friend Requests**
- View all incoming friend requests
- Accept requests to add students as friends
- Decline/reject requests
- Notification badge showing pending request count

### 3. **Friend Management**
- View all accepted friends
- Remove friends with confirmation
- Quick access to friend list on home page
- Display recent friends (top 3) with avatars

### 4. **Home Page Widget**
- Quick stats: number of friends, pending requests, students to discover
- Badge notification for pending requests
- Recent friends carousel
- Direct navigation to full Friends screen
- Like Facebook friend suggestions panel

## Architecture

### Database Schema

The system uses the existing Prisma `Friendship` model:

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
  @@map("friendships")
}
```

### File Structure

```
src/
├── application/viewmodels/
│   └── FriendshipViewModel.ts          # Main business logic for friend operations
├── data/
│   ├── repositories/
│   │   └── IFriendshipRepository.ts    # Repository interface
│   └── supabase/
│       └── SupabaseFriendshipRepository.ts  # Supabase implementation
├── domain/entities/
│   └── social.ts                        # Friendship entity definition
├── presentation/
│   ├── components/
│   │   ├── StudentCard.tsx              # Student discovery card component
│   │   ├── FriendRequestCard.tsx        # Friend request card with accept/decline
│   │   ├── FriendCard.tsx               # Friend list card with remove option
│   │   └── FriendsWidget.tsx            # Home page friends widget
│   └── screens/
│       └── FriendsScreen.tsx            # Full Friends management screen
└── shared/
    └── notificationUtils.ts             # Notification creation utilities
```

## Components

### FriendshipViewModel
Located in: `src/application/viewmodels/FriendshipViewModel.ts`

**Responsibilities:**
- Load students for discovery
- Send friend requests
- Load friends and pending requests
- Accept/decline requests
- Remove friends
- Block users
- Manage loading and error states

**Key Methods:**
```typescript
loadStudents(excludeUserId: string): Promise<Result<User[]>>
sendFriendRequest(toUserId: string, fromUserId: string): Promise<Result<Friendship>>
loadFriends(userId: string): Promise<Result<FriendshipWithUser[]>>
loadPendingRequests(userId: string): Promise<Result<FriendshipWithUser[]>>
acceptRequest(friendshipId: string): Promise<Result<Friendship>>
declineRequest(friendshipId: string): Promise<Result<boolean>>
removeFriend(friendshipId: string): Promise<Result<boolean>>
blockUser(friendshipId: string): Promise<Result<Friendship>>
```

### UI Components

#### StudentCard & StudentList
- Display students for discovery
- "Add Friend" button for each student
- Avatar, name, and email
- Loading states for async operations

#### FriendRequestCard & FriendRequestList
- Show incoming friend requests
- Accept/Decline buttons
- Requester's information
- Quick action feedback

#### FriendCard & FriendList
- Display accepted friends
- Remove button for each friend
- Avatar, name, and email
- Empty state messaging

#### FriendsWidget
- Home page widget showing friend stats
- Pending request count with badge
- Recent friends carousel (top 3)
- Quick stats: Friends, Requests, To Discover
- Action button to view full Friends screen
- Alert box for pending requests

### FriendsScreen
Located in: `src/presentation/screens/FriendsScreen.tsx`

**Tabs:**
1. **Discover** - Browse students and send requests
2. **Requests** - View and respond to incoming requests
3. **Friends** - View and manage accepted friends

**Features:**
- Segmented button tabs showing counts
- Search functionality (Discover tab)
- Error and success message display
- Loading states
- Responsive design

## Integration

### Adding to Home Page

The FriendsWidget is automatically integrated into the GameDashboard (home page):

```tsx
<FriendsWidget
  userId={user.id}
  userRepo={authVM.userRepo}
  onViewFriends={() => onNavigate('friends')}
/>
```

### Navigation

From the home page, navigate to FriendsScreen:
```tsx
onNavigate('friends') // Triggers FriendsScreen
```

## Notification System

The notification system supports friend-related notifications:

### Notification Types
```typescript
enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_REQUEST_ACCEPTED = 'FRIEND_REQUEST_ACCEPTED',
  FRIEND_REQUEST_DECLINED = 'FRIEND_REQUEST_DECLINED',
  FRIEND_REMOVED = 'FRIEND_REMOVED',
}
```

### Creating Notifications

Use the utility functions in `notificationUtils.ts`:

```typescript
import { createFriendRequestNotification } from '@/src/shared/notificationUtils';

const notification = createFriendRequestNotification(
  toUserId,
  fromUserId,
  fromUserName,
  friendshipId
);
```

## Future Enhancements

1. **Real-time Updates** - Use Supabase real-time subscriptions
2. **Push Notifications** - Send push notifications for friend requests
3. **Friend Groups** - Organize friends into custom groups
4. **Activity Feed** - Show friend activity in a feed
5. **Mutual Friends** - Display mutual friends between users
6. **Friend Suggestions** - AI-based suggestions based on location/interests
7. **Block List** - Full block management interface
8. **Blocked By** - Show users who have blocked you

## Testing

### Manual Testing Checklist

- [ ] Create two user accounts (student A and student B)
- [ ] Student A discovers Student B
- [ ] Student A sends friend request to Student B
- [ ] Verify request appears in Student B's Requests tab
- [ ] Student B accepts the request
- [ ] Verify both appear in each other's Friends list
- [ ] Student A removes Student B
- [ ] Verify both disappear from friends lists
- [ ] Test search in Discover tab
- [ ] Test Friends Widget on home page shows correct stats
- [ ] Test error handling for network failures

## API Endpoints (Supabase)

All operations go through Supabase PostgREST API:

- `GET /rest/v1/friendships` - List friendships
- `POST /rest/v1/friendships` - Create new friendship
- `PATCH /rest/v1/friendships` - Update friendship status
- `DELETE /rest/v1/friendships` - Delete friendship

## State Management

The system uses MobX for state management:

```typescript
class FriendshipViewModel {
  students: User[] = [];
  friends: FriendshipWithUser[] = [];
  receivedRequests: FriendshipWithUser[] = [];
  sentRequests: FriendshipWithUser[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
}
```

Observable properties automatically trigger UI re-renders when changed.

## Performance Considerations

1. **Lazy Loading** - Students list loads on demand
2. **Pagination** - Ready for pagination implementation
3. **Caching** - Consider caching friend lists in AppContext
4. **Search Optimization** - Client-side filtering to reduce requests

## Security Notes

1. Only students can see other students
2. Friendship requests are directional (A->B is different from B->A)
3. Users cannot friend themselves
4. Block functionality prevents interactions
5. All operations are tied to authenticated user ID

## Troubleshooting

### Friend requests not showing
- Check network connection
- Verify users have STUDENT role
- Ensure Supabase connection is active

### Students list empty
- Verify multiple student accounts exist
- Check role assignments
- Review Supabase database for users

### Widget not updating
- Ensure userId is passed correctly
- Check authVM.currentUser is not null
- Verify FriendshipViewModel initialization

## Related Documentation

- See [ROLE_BASED_USER_SYSTEM.md](../ROLE_BASED_USER_SYSTEM.md) for user role management
- See [MASTER_GUIDE.md](../MASTER_GUIDE.md) for overall architecture
