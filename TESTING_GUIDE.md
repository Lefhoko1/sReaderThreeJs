# Test sReader on Expo Snack

## Steps to Test Online:

### Option 1: Quick Snack (Simplified)
1. Go to: https://snack.expo.dev
2. Click "New Snack"
3. Copy this minimal version to test the UI

### Option 2: Full App Publish (Recommended)

Since your app is too complex for a simple Snack copy-paste, use **Expo Publish**:

```bash
# In your sReader folder, run:
npx expo publish
```

This will:
- Build your app
- Upload to Expo servers
- Give you a link to scan with Expo Go app
- Also works in web browser!

### Option 3: Use Codespaces Preview (EASIEST!)

Your GitHub Codespaces already has port forwarding!

1. In terminal, make sure `npm start` is running
2. Press `w` to open web version
3. Or click the "Ports" tab in VS Code
4. Find port `8081` and click the globe icon 🌐
5. Your app opens in browser!

### Option 4: QR Code for Phone

1. Install **Expo Go** app on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. In your running terminal, scan the QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### 🎯 RECOMMENDED: Press 'w' in your terminal!

Since you have `npm start` running, just:
1. Go to that terminal
2. Press `w` key
3. Browser opens automatically! 🎉

Or run this command:
```bash
cd sReader && npm run web
```
