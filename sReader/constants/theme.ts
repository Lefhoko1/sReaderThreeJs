/**
 * Material Design 3 inspired color scheme with soft, muted tones
 * Following Material You principles for harmonious color palettes
 */

import { Platform } from 'react-native';
import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Soft Material Design 3 colors - muted and harmonious
const tintColorLight = '#6750A4'; // Soft purple
const tintColorDark = '#D0BCFF'; // Light purple

export const Colors = {
  light: {
    text: '#1C1B1F',
    background: '#FFFBFE',
    tint: tintColorLight,
    icon: '#79747E',
    tabIconDefault: '#79747E',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#E6E1E5',
    background: '#1C1B1F',
    tint: tintColorDark,
    icon: '#CAC4D0',
    tabIconDefault: '#CAC4D0',
    tabIconSelected: tintColorDark,
  },
};

// Material Design 3 Theme with soft colors
export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4', // Soft purple
    primaryContainer: '#EADDFF', // Very light purple
    secondary: '#625B71', // Muted purple-grey
    secondaryContainer: '#E8DEF8', // Light purple-grey
    tertiary: '#7D5260', // Muted rose
    tertiaryContainer: '#FFD8E4', // Light rose
    surface: '#FFFBFE', // Off-white
    surfaceVariant: '#E7E0EC', // Light purple-grey
    background: '#FFFBFE', // Off-white
    error: '#BA1A1A', // Soft red
    errorContainer: '#FFDAD6', // Light red
    onPrimary: '#FFFFFF',
    onPrimaryContainer: '#21005D',
    onSecondary: '#FFFFFF',
    onSecondaryContainer: '#1D192B',
    onTertiary: '#FFFFFF',
    onTertiaryContainer: '#31111D',
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#49454F',
    onError: '#FFFFFF',
    onErrorContainer: '#410002',
    onBackground: '#1C1B1F',
    outline: '#79747E',
    outlineVariant: '#CAC4D0',
    inverseSurface: '#313033',
    inverseOnSurface: '#F4EFF4',
    inversePrimary: '#D0BCFF',
    elevation: {
      level0: 'transparent',
      level1: '#F7F2FA',
      level2: '#F2EDF7',
      level3: '#EDE8F4',
      level4: '#EBE6F2',
      level5: '#E8E3F0',
    },
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
