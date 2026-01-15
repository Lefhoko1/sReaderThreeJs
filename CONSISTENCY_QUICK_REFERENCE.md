# Application Consistency - Quick Reference Guide

## Color System (Material Design 3)

### Primary Theme Colors
```javascript
theme.colors.primary          // #6750A4 (Soft Purple)
theme.colors.secondary        // #625B71 (Muted Purple-Grey) 
theme.colors.tertiary         // #7D5260 (Muted Rose)
theme.colors.error            // #BA1A1A (Soft Red)
```

### Surface & Background Colors
```javascript
theme.colors.surface          // #FFFBFE (Off-white/Surface)
theme.colors.surfaceVariant   // #E7E0EC (Light Purple-Grey)
theme.colors.background       // #FFFBFE (Off-white/Background)
```

### Container Colors
```javascript
theme.colors.primaryContainer       // #EADDFF (Very light purple)
theme.colors.secondaryContainer     // #E8DEF8 (Light purple-grey)
theme.colors.tertiaryContainer      // #FFD8E4 (Light rose)
```

### Text Colors (On-surface)
```javascript
theme.colors.onSurface        // #1C1B1F (Very dark text)
theme.colors.onSurfaceVariant // #79747E (Medium gray text)
theme.colors.onPrimary        // #FFFFFF (White on primary)
```

## How to Use Theme in Components

### Import useTheme Hook
```typescript
import { useTheme } from 'react-native-paper';

export const MyComponent = () => {
  const theme = useTheme();
  // Now use theme.colors.* throughout
}
```

### Apply Colors in JSX
```typescript
// For backgrounds
<View style={{ backgroundColor: theme.colors.surface }}>

// For text
<Text style={{ color: theme.colors.onSurface }}>

// For icons
<MaterialCommunityIcons color={theme.colors.primary} />

// For borders/dividers
<View style={{ borderTopColor: theme.colors.surfaceVariant }}>
```

### Use in StyleSheet (with theme in scope)
```typescript
const styles = StyleSheet.create({
  container: {
    // Don't hardcode colors here!
    // Use dynamic styles in JSX instead
  },
});

// Then apply theme colors in JSX:
<View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
```

## React-Native-Paper Components to Use

### Headers & Navigation
```typescript
import { Appbar, AppbarHeader } from 'react-native-paper';

// Use for screen headers
<Appbar.Header>
  <Appbar.BackAction />
  <Appbar.Content title="Screen Title" />
</Appbar.Header>
```

### Cards & Containers
```typescript
import { Card } from 'react-native-paper';

<Card mode="elevated" elevation={1}>
  <Card.Content>
    {/* content */}
  </Card.Content>
  <Card.Actions>
    {/* actions */}
  </Card.Actions>
</Card>
```

### Buttons
```typescript
import { Button } from 'react-native-paper';

// Primary action
<Button mode="contained">Primary Action</Button>

// Secondary action
<Button mode="contained-tonal">Secondary Action</Button>

// Text-only action
<Button mode="text">Text Action</Button>
```

### Text
```typescript
import { Text } from 'react-native-paper';

// Use variants instead of custom sizing
<Text variant="headlineLarge">Heading</Text>
<Text variant="titleMedium">Title</Text>
<Text variant="bodyMedium">Body</Text>
<Text variant="labelSmall">Label</Text>
```

### Search
```typescript
import { Searchbar } from 'react-native-paper';

<Searchbar
  placeholder="Search..."
  value={query}
  onChangeText={setQuery}
/>
```

## Color Mapping Reference

### Old → New (For Migration)
```
#007AFF (iOS Blue)           → theme.colors.primary
#28a745 (Success Green)      → theme.colors.primary or custom
#212529 (Dark Text)          → theme.colors.onSurface
#666 (Medium Text)           → theme.colors.onSurfaceVariant
#999 (Light Text)            → theme.colors.onSurfaceVariant
#fff (White)                 → theme.colors.surface or theme.colors.onPrimary
#f0f0f0 (Light Gray Bg)      → theme.colors.secondaryContainer
#e0e0e0 (Divider)            → theme.colors.surfaceVariant
#7C6FD3 (Old Purple)         → theme.colors.primary
```

## Persistent Navigation Pattern

### The Standard Layout
```typescript
export default observer(function HomeTab() {
  const theme = useTheme();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const handleNavigate = (screen) => setCurrentScreen(screen);
  const handleBack = () => setCurrentScreen('dashboard');

  const renderScreenContent = () => {
    switch (currentScreen) {
      case 'screen1': return <Screen1 onBack={handleBack} />;
      // ... more cases
      default: return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Appbar.Header>
        {currentScreen !== 'dashboard' && <Appbar.BackAction onPress={handleBack} />}
        <Appbar.Content title={getTitle(currentScreen)} />
      </Appbar.Header>
      <View style={{ flex: 1 }}>
        {renderScreenContent()}
      </View>
    </View>
  );
});
```

## Common Patterns

### Card with Theme
```typescript
<Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
  <Card.Content>
    <Text style={{ color: theme.colors.onSurface }}>Content</Text>
  </Card.Content>
</Card>
```

### Header with Back Button
```typescript
<Appbar.Header style={{ backgroundColor: theme.colors.surface }} elevated>
  <Appbar.BackAction onPress={onBack} />
  <Appbar.Content title="Title" />
</Appbar.Header>
```

### List Item
```typescript
<Card style={[styles.item, { backgroundColor: theme.colors.surface }]}>
  <Card.Content>
    <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
      Item Title
    </Text>
  </Card.Content>
</Card>
```

### Empty State
```typescript
<View style={{ alignItems: 'center', paddingVertical: 40 }}>
  <MaterialCommunityIcons name="magnify" size={48} color={theme.colors.surfaceVariant} />
  <Text style={{ color: theme.colors.onSurfaceVariant }}>No items found</Text>
</View>
```

## Do's and Don'ts

### ✅ DO:
- Use `theme.colors.*` for all colors
- Use react-native-paper components
- Use text `variant` prop for sizing
- Apply theme colors dynamically in JSX
- Test in both light and dark modes

### ❌ DON'T:
- Hardcode color values (e.g., `#007AFF`)
- Use custom text sizing instead of variants
- Define colors in StyleSheet
- Use `TouchableOpacity` for cards (use `Card` instead)
- Ignore dark mode support

## Testing Consistency

1. **Visual Check:**
   - Open app and navigate screens
   - Verify colors match consistently
   - Check dark mode appearance

2. **Code Check:**
   - Search for hardcoded `#` colors in new code
   - Ensure all components use `useTheme()`
   - Verify `Appbar` used for headers

3. **Navigation Check:**
   - Verify header title updates with screen
   - Confirm back button appears/disappears correctly
   - Ensure bottom tab bar always visible

## Quick Checklist for New Screens

- [ ] Import `useTheme` from 'react-native-paper'
- [ ] Call `const theme = useTheme()` in component
- [ ] No hardcoded colors in styles
- [ ] Use `Appbar.Header` for header
- [ ] Use `Card` components instead of custom TouchableOpacity
- [ ] Use `Button` components with appropriate modes
- [ ] Apply theme colors dynamically: `{ backgroundColor: theme.colors.surface }`
- [ ] Test in light and dark themes
- [ ] Verify navigation works (back button, routing)

---

For detailed changes, see `CONSISTENCY_UPDATE_SUMMARY.md`
