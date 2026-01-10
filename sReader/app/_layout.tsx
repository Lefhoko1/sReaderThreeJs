import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppContextProvider, useAppContext } from '@/src/presentation/context/AppContext';
import { AuthStack } from '@/src/presentation/context/AuthStack';
import { lightTheme, darkTheme } from '@/src/presentation/theme/AppTheme';
import { initializeApp } from '@/src/shared/initialization';

export const unstable_settings = {
  anchor: '(tabs)',
};

/**
 * RootLayoutContent
 * Internal component that uses AppContext and observes auth state to switch between AuthStack and AppStack
 */
const RootLayoutContent = observer(() => {
  const colorScheme = useColorScheme();
  const { authVM } = useAppContext();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isLoggedIn = authVM.isLoggedIn();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {!isLoggedIn ? (
        <AuthStack />
      ) : (
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
      )}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initializeApp();
        setAppReady(true);
      } catch (e) {
        console.error('App initialization failed:', e);
        setAppReady(true); // Allow app to continue for now
      }
    };

    bootstrap();
  }, []);

  if (!appReady) {
    return null; // Or splash screen
  }

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <AppContextProvider>
        <RootLayoutContent />
      </AppContextProvider>
    </PaperProvider>
  );
}
