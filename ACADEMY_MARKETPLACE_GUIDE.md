# Academy Marketplace System - Student Features Guide

## Overview
The Academy Marketplace is a comprehensive system that allows students to discover, explore, and enroll in tutoring academies. It features a beautiful, intuitive UI with powerful search and discovery capabilities.

## New Screens & Components

### 1. **AcademyMarketplace** - Main Discovery Screen
**Path:** `/src/presentation/screens/AcademyMarketplace.tsx`

#### Features:
- **Search Functionality**: Full-text search for academies by name or description
- **Filtering Options**:
  - All Academies
  - Verified Academies Only
  - Top Rated
  - New Academies
- **Sorting Options**:
  - By Rating (highest first)
  - Alphabetically (A-Z)
  - By Popularity (most students)

#### UI Components:
- Search bar with icon
- Filter chips (horizontal scrolling)
- Sort selection buttons
- Academy cards with:
  - Academy name and location
  - Verification badge
  - Rating (stars)
  - Student count
  - Tutor count
  - Staff preview (top 3 tutors with +N more indicator)
  - "View Details" button

#### Usage:
```tsx
<AcademyMarketplace
  viewModel={tutoringVM}
  studentId={studentId}
  onAcademySelect={(academy) => {
    // Handle academy selection
  }}
  onBack={() => {
    // Go back
  }}
/>
```

### 2. **AcademyDetails** - Detailed Academy View
**Path:** `/src/presentation/screens/AcademyDetails.tsx`

#### Features:
- **Tab Navigation**:
  - **Overview**: Academy description, contact info, stats, highlights
  - **Levels**: Available educational levels with subject counts
  - **Tutors**: Staff profiles with ratings and experience
  - **Pricing**: Subscription plans (Basic, Premium, Pro)

#### UI Components:
- Hero section with gradient background
- Verification badge
- Rating and review count
- Academy logo/avatar
- Stats grid (students, tutors, subjects, levels)
- Tutor cards showing:
  - Avatar
  - Name with verification status
  - Specialization
  - Rating and student count
  - Experience
- Level cards
- Pricing cards with:
  - Plan name and description
  - Price per billing cycle
  - Feature list
  - Enroll button

#### Usage:
```tsx
<AcademyDetails
  viewModel={tutoringVM}
  academy={selectedAcademy}
  studentId={studentId}
  onBack={() => {}}
  onRequestEnrollment={(academyId) => {}}
/>
```

### 3. **AcademyEnrollmentRequest** - Enrollment Form
**Path:** `/src/presentation/screens/AcademyEnrollmentRequest.tsx`

#### Features:
- **Level Selection**: Browse and select educational level
- **Subject Selection**: Choose subjects available in selected level
- **Billing Cycle Options**:
  - Monthly ($X/month)
  - Per Term (Save 10%)
  - Yearly (Save 20%)
- **Optional Message**: Add custom message to academy
- **Terms Agreement**: Accept terms and conditions

#### Form Validation:
- Level selection is mandatory
- At least one subject must be selected
- Terms and conditions must be agreed to

#### UI Components:
- Academy summary card with gradient
- Level selection cards (radio style)
- Subject selection cards (checkbox style)
- Pricing option cards (radio style)
- Text input for message
- Terms checkbox
- Submit and Cancel buttons

#### Usage:
```tsx
<AcademyEnrollmentRequest
  academy={selectedAcademy}
  levels={levels}
  subjects={subjects}
  studentId={studentId}
  onSubmit={(data) => {
    // Handle enrollment request
    // data contains: academyId, studentId, levelId, subjectIds, costTerm, message, agreeToTerms
  }}
  onCancel={() => {}}
/>
```

### 4. **EnhancedTutoringHome** - Tutor & Student Dashboard
**Path:** `/src/presentation/screens/EnhancedTutoringHome.tsx`

#### Features:
- **Role-Based Views**:
  - Student view shows enrollment-related items
  - Tutor view shows academy management items
- **Quick Stats Card** (Students only):
  - Active classes count
  - Attendance percentage
  - GPA
- **Menu Sections**:
  - Quick Access (Fast navigation)
  - Staff Display (Meet Our Tutors / Your Team)
  - Announcements

#### Staff Display:
- Grid layout showing 2-4 tutors per row
- Each tutor card shows:
  - Avatar
  - Name
  - Role
  - Specialization
  - Verification badge (for verified tutors)
  - View Profile button

#### Announcements:
- Icon-based announcement cards
- Title and description
- Action button (e.g., "Explore Now")

#### Usage:
```tsx
<EnhancedTutoringHome
  viewModel={tutoringVM}
  userId={userId}
  userName="John Doe"
  userRole="STUDENT"
  onNavigate={(screen) => {}}
  onBack={() => {}}
/>
```

### 5. **StudentDashboardMenu** - Organized Navigation Menu
**Path:** `/src/presentation/screens/StudentDashboardMenu.tsx`

#### Features:
- **User Header** with avatar and stats
- **Expandable Categories**:
  - Discover & Browse (3 items)
  - My Enrollment (3 items with badges)
  - Learning (3 items)
  - Profile & Settings (3 items)
- **Badge System** for pending/active counts
- **Featured Banner** with promotional content

#### Menu Categories:
1. **Discover & Browse**:
   - Discover Academies
   - Browse Levels
   - Browse Subjects

2. **My Enrollment**:
   - My Enrollments (shows count of active classes)
   - Pending Requests (shows count of pending)
   - My Academies (shows count of joined academies)

3. **Learning**:
   - My Schedule
   - Assignments
   - Grades

4. **Profile & Settings**:
   - My Profile
   - Preferences
   - Support

#### Usage:
```tsx
<StudentDashboardMenu
  userName="John Student"
  userInitials="JS"
  level="Grade 10"
  academiesCount={2}
  classesCount={4}
  pendingRequests={1}
  onNavigate={(screen) => {}}
/>
```

## Navigation Flow

### Discovery Journey:
```
Dashboard 
  → Academy Marketplace (search & filter)
    → Academy Details (view academy info)
      → Enrollment Request (submit request)
        → Confirmation
```

### Quick Access from Menu:
```
Student Dashboard Menu
  → Discover & Browse → Academy Marketplace
  → My Enrollment → Student Enrollments
  → Learning → Assignments
  → Profile & Settings → My Profile
```

## Color Scheme

The system uses a professional purple and blue gradient theme:
- **Primary Color**: `#7C6FD3` (Purple)
- **Secondary Colors**:
  - Red: `#FF6B6B`
  - Teal: `#4ECDC4`
  - Orange: `#FFA726`
  - Green: `#66BB6A`

## UI Design Principles

1. **Gradient Backgrounds**: Used for hero sections and important CTAs
2. **Card-Based Layout**: Easy to scan and interact with
3. **Icons**: Used throughout for quick visual recognition
4. **Badges**: Indicate status (verified, pending, count)
5. **White Space**: Generous padding for readability
6. **Rounded Corners**: Modern look with 8-16px border radius
7. **Shadows**: Subtle elevation for depth

## Integration with ViewModel

The screens use `TutoringViewModel` for state management:

### Key Methods:
```typescript
// Loading academies
await viewModel.loadAllAcademies()

// Searching academies
await viewModel.searchAcademies(query)

// Getting academy details
await viewModel.getAcademyDetails(academyId)

// Getting subjects by level
await viewModel.getSubjectsByLevel(levelId)

// Creating registration request
await viewModel.createRegistrationRequest(studentId, classId, data)
```

### Observable State:
```typescript
viewModel.academies          // All academies
viewModel.searchResults      // Search results
viewModel.currentAcademy     // Selected academy
viewModel.levels             // Levels for current academy
viewModel.subjects           // Subjects for current level
viewModel.loading            // Loading state
viewModel.error              // Error messages
viewModel.successMessage     // Success feedback
```

## Styling Notes

- All components use React Native Paper for consistent design
- LinearGradient from `expo-linear-gradient` for background effects
- Icons from Material Community Icons
- Responsive layouts using Dimensions API

## Accessibility Considerations

- Large touch targets (minimum 44x44 points)
- Sufficient contrast ratios (AA standard)
- Clear navigation hierarchy
- Descriptive button labels
- Form labels and descriptions

## Future Enhancements

1. **Wishlist System**: Allow students to save academies
2. **Reviews & Ratings**: Student-submitted reviews
3. **Comparison View**: Compare multiple academies side-by-side
4. **Chat Integration**: Direct messaging with tutors
5. **Calendar Integration**: View class schedules
6. **Payment Integration**: In-app enrollment payments
7. **Analytics**: Student progress tracking
8. **Notifications**: Academy updates and announcements

## Troubleshooting

### Academy list not loading:
- Check TutoringViewModel initialization
- Verify backend API connection
- Check user permissions

### Screens not navigating:
- Ensure ScreenName types match case handlers
- Verify onNavigate callback is properly passed
- Check state management updates

### Styling issues:
- Verify React Native Paper theme is applied
- Check LinearGradient version compatibility
- Ensure all icon names are correct

## Configuration

### Required Dependencies:
```json
{
  "react-native-paper": "^5.12.3",
  "expo-linear-gradient": "^12.x.x",
  "@expo/vector-icons": "^15.0.3",
  "mobx": "^6.10.2",
  "mobx-react-lite": "^4.0.5"
}
```

## Performance Tips

1. Use FlatList/SectionList for large lists (already implemented)
2. Memoize callback functions
3. Lazy load images
4. Implement pagination for large result sets
5. Cache academy details locally

## Testing

Recommended test cases:
1. Search functionality with various queries
2. Filter toggle and combinations
3. Navigation between screens
4. Form validation (enrollment request)
5. Error handling and edge cases
6. Loading states and spinners
7. Responsive layout on different screen sizes
