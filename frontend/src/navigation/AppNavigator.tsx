import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { MainNavigator } from './MainNavigator';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import SuperAdminDashboard from '../screens/Admin/SuperAdminDashboard';

import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import OnboardingScreen from '../screens/Auth/OnboardingScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  Admin: undefined;
  SuperAdmin: undefined;
  Home: undefined;
  Search: undefined;
  Publish: undefined;
  PublishTrip: undefined;
  Messages: undefined;
  Profile: undefined;
  Settings: undefined;
  Reviews: undefined;
  AllTrips: undefined;
  RideDetails: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, user } = useAuthStore();
  const { currentColors } = useThemeStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboardingDone').then((val) => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  if (showOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: currentColors.background }}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showOnboarding ? (
        <Stack.Screen name="Onboarding">
          {(props) => (
            <OnboardingScreen
              onDone={() => setShowOnboarding(false)}
            />
          )}
        </Stack.Screen>
      ) : !isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.role === 'superadmin' ? (
        <Stack.Screen name="SuperAdmin" component={SuperAdminDashboard} />
      ) : user?.role === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminDashboard} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
}