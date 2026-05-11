import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/themeStore';

export default function App() {
  const { theme, currentColors } = useThemeStore();
  const isDark = theme === 'dark';

  const MyTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: currentColors.background,
      card: currentColors.surface,
      text: currentColors.text,
      border: currentColors.border,
      primary: currentColors.primary,
    },
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={MyTheme}>
        <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={currentColors.background} />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
