# sReader Authentication System - Quick Start Guide

## 🚀 Getting Started

The app is currently running and ready for testing. Access it at:
**http://localhost:8081** (or http://localhost:8082 if port 8081 is unavailable)

## 📱 Authentication Screens

### 1. **Login Screen** (Default)
- **Email field:** Enter any email (e.g., test@example.com)
- **Password field:** Enter any password (min 8 characters)
- **Remember me:** Checkbox (ready for token persistence)
- **Forgot password?:** Link to password reset flow
- **Sign up:** Link to signup screen

### 2. **Signup Screen** (via "Sign up" link)
- **Full Name:** Required (e.g., "John Doe")
- **Email:** Required, must be valid format (e.g., "john@example.com")
- **Password:** Required, minimum 8 characters
- **Confirm Password:** Must match password
- **Terms & Conditions:** Checkbox (required)
- **Validation:** Real-time feedback for each field
- **Success:** Shows welcome message and returns to login

### 3. **Password Reset Screen** (via "Forgot?" link on login)
- **Step 1 - Email Verification**
  - Enter registered email
  - Sends verification code (demo mode)
  
- **Step 2 - OTP Verification**
  - Enter 6-digit code (any digits work in demo)
  - Countdown timer on resend button
  - "Resend code" link after cooldown

- **Step 3 - New Password**
  - Enter new password (min 8 chars)
  - Confirm password (must match)
  - Success message with confirmation

## 🧪 Testing Scenarios

### Test Signup
1. Tap "Sign up" on login screen
2. Fill in all fields:
   - Name: "Alice Smith"
   - Email: "alice@example.com"
   - Password: "SecurePass123"
   - Confirm: "SecurePass123"
   - Check Terms checkbox
3. Tap "Create Account"
4. **Expected:** Success message "Welcome, Alice Smith!"

### Test Login
1. On login screen, enter:
   - Email: "alice@example.com"
   - Password: "SecurePass123"
2. Tap "Sign In"
3. **Expected:** App shows home screen with "Welcome, Alice Smith!"

### Test Password Reset
1. On login screen, tap "Forgot?"
2. Enter email: "alice@example.com"
3. Tap "Send Code"
4. Enter any 6-digit code (e.g., "123456")
5. Tap "Verify Code"
6. Enter new password: "NewPassword456"
7. Confirm: "NewPassword456"
8. Tap "Reset Password"
9. **Expected:** Back to login with success message

### Test Validation Errors
1. **Empty Fields:** Try submitting without filling fields
   - **Expected:** Red error messages below each field
   
2. **Invalid Email:** Try "notanemail" format
   - **Expected:** "Please enter a valid email" error

3. **Short Password:** Try password with 5 characters
   - **Expected:** "Password must be at least 8 characters"

4. **Password Mismatch:** Enter different passwords
   - **Expected:** "Passwords must match"

5. **Unchecked Terms:** Try signup without checking Terms
   - **Expected:** Error indicating Terms must be accepted

### Test Loading States
- When you submit a form, the button shows loading state
- Button text changes (e.g., "Signing In...")
- Button is disabled while loading

### Test Logout
1. After successful login, you see home screen
2. Tap "Logout" button
3. **Expected:** Returns to login screen

## 🎨 Visual Design Features

- **Material Design 3:** Professional, modern UI
- **Light/Dark Mode:** Automatic based on system settings
- **Touch Feedback:** Ripple effects on buttons
- **Keyboard Awareness:** Smooth keyboard handling
- **Eye Icon:** Show/hide password toggle
- **Step Indicators:** Visual progress on password reset
- **Color Coding:** Error (red), Success (green), Primary (blue)

## 📂 File Structure

```
sReader/
├── src/
│   ├── application/viewmodels/
│   │   └── AuthViewModel.ts          ← Auth business logic
│   ├── presentation/
│   │   ├── context/
│   │   │   ├── AppContext.tsx        ← DI & state management
│   │   │   └── AuthStack.tsx         ← Auth navigation
│   │   └── screens/
│   │       ├── SignupScreen.tsx      ← Signup form
│   │       ├── LoginScreen.tsx       ← Login form
│   │       └── PasswordResetScreen.tsx ← Reset flow
│   ├── domain/entities/
│   │   └── user.ts                   ← User model
│   └── data/repositories/
│       └── IUserRepository.ts        ← User data access
└── app/
    ├── _layout.tsx                   ← Root with auth routing
    └── (tabs)/
        ├── index.tsx                 ← Home (shows after login)
        └── explore.tsx               ← Explore/Assignments
```

## 🔧 How It Works

### State Management (MobX)
```typescript
// AuthViewModel contains observable state
@observable currentUser: User | null = null;
@observable loading: boolean = false;
@observable error: string | null = null;

// Screens observe changes and re-render
const { authVM } = useAppContext();
// UI updates automatically when authVM state changes
```

### Navigation (Conditional Routing)
```typescript
// RootLayout checks login status
{!isLoggedIn ? <AuthStack /> : <AppStack />}

// AuthStack switches between auth screens
// AppStack shows main app after login
```

### Validation
```typescript
// Each screen validates input
if (!form.email.match(emailRegex)) {
  errors['email'] = true;
}
// Error displayed to user
{validationErrors['email'] && <ErrorText />}
```

## 🔐 Security Notes (Demo Mode)

**Current (Demo):**
- ✅ Client-side validation
- ✅ Password complexity requirements
- ✅ Type-safe error handling

**Production Needs:**
- [ ] Backend API integration
- [ ] Password hashing (bcrypt)
- [ ] JWT tokens
- [ ] Secure token storage
- [ ] Email verification
- [ ] Rate limiting
- [ ] HTTPS enforcement

## 🌐 Backend Integration (When Ready)

The AuthViewModel methods are ready to connect to your backend API:

```typescript
// In AuthViewModel.ts, replace these sections:

// Signup
const result = await this.userRepo.createUser(userData);
// TODO: POST /api/auth/signup

// Login
const result = await this.userRepo.getUser(email);
// TODO: POST /api/auth/login (with password verification)

// Password Reset
await authViewModel.requestPasswordReset(email);
// TODO: POST /api/auth/request-reset (send OTP email)

await authViewModel.verifyResetOtp(otp);
// TODO: POST /api/auth/verify-otp

await authViewModel.resetPassword(newPassword, confirmPassword);
// TODO: POST /api/auth/reset-password
```

## 📊 Component Hierarchy

```
RootLayout
├── AppContextProvider (provides DI)
│   └── PaperProvider (Material Design theme)
│       └── RootLayoutContent (auth routing)
│           ├── AuthStack (if not logged in)
│           │   ├── LoginScreen
│           │   ├── SignupScreen
│           │   └── PasswordResetScreen
│           └── AppStack (if logged in)
│               ├── (tabs) Navigation
│               ├── HomeScreen
│               └── ExploreScreen
```

## 💾 Data Persistence

**Current (Demo):**
- In-memory storage on web
- SQLite on native (iOS/Android)
- Seed data with 3 sample assignments

**Production:**
- Real database backend
- User authentication tokens
- Persistent sessions
- Cloud sync capability

## 🚨 Troubleshooting

### App Won't Start
```bash
# Kill existing process
pkill -f "expo start"

# Restart
cd sReader && npm start -- --web
```

### Port Already in Use
```bash
# Try a different port
expo start --web --port 8082
```

### TypeScript Errors
```bash
# Check compilation
npx tsc --noEmit

# Run in terminal to see all errors
npm run type-check
```

### App Crashes on Signup
- Check browser console (F12)
- Verify all form fields are filled
- Check password is at least 8 characters

## 📞 Support

For issues or questions:
1. Check the console (F12 → Console tab)
2. Review error messages in app
3. Check AUTH_SYSTEM_IMPLEMENTATION.md for detailed docs

## ✅ Checklist

### Before Going to Production
- [ ] Connect to backend API
- [ ] Add real email service for OTP
- [ ] Implement password hashing
- [ ] Add JWT token management
- [ ] Add secure token storage
- [ ] Set up error logging
- [ ] Test on real devices
- [ ] Security audit
- [ ] Load testing
- [ ] User acceptance testing

### Nice to Have Later
- [ ] Social login (Google, Apple)
- [ ] Biometric authentication
- [ ] Two-factor authentication
- [ ] Account recovery options
- [ ] Login history
- [ ] Device management

---

## 🎉 You're All Set!

The modern authentication system is ready to use. Start by testing the signup and login flows, then integrate with your backend API when ready.

Happy coding! 🚀
