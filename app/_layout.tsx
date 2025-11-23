import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { NotesProvider } from '@/contexts/NotesContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NotesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Nueva Nota' }} />
          <Stack.Screen name="note/[id]" options={{ title: 'Detalle de Nota' }} />
          <Stack.Screen name="edit/[id]" options={{ title: 'Editar Nota' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NotesProvider>
  );
}
