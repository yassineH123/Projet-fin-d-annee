import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

import LoginScreen      from '../screens/Auth/LoginScreen';
import RegisterScreen   from '../screens/Auth/RegisterScreen';
import VerifyCodeScreen from '../screens/Auth/VerifyCodeScreen';
import HomeScreen       from '../screens/Home/HomeScreen';

export type RootStackParamList = {
  Login:      undefined;
  Register:   undefined;
  VerifyCode: { email: string };
  Home:       undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#020617' },
        }}
      >
        {user ? (
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          <>
            <Stack.Screen name="Login"      component={LoginScreen} />
            <Stack.Screen name="Register"   component={RegisterScreen} />
            <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
