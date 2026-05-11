import React from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Feather from '@expo/vector-icons/Feather';

import HomeScreen from '../screens/Home/HomeScreen';
import SearchScreen from '../screens/Home/SearchScreen';
import PublishScreen from '../screens/Home/PublishScreen';
import PublishTripScreen from '../screens/Home/PublishTripScreen';
import MessagesScreen from '../screens/Home/MessagesScreen';
import ProfileScreen from '../screens/Home/ProfileScreen';
import SettingsScreen from '../screens/Home/SettingsScreen';
import ReviewsScreen from '../screens/Home/ReviewsScreen';
import AllTripsScreen from '../screens/Home/AllTripsScreen';
import RideDetailsScreen from '../screens/Home/RideDetailsScreen';
import SecurityScreen from '../screens/Settings/SecurityScreen';
import PrivacyScreen from '../screens/Settings/PrivacyScreen';
import ChangePasswordScreen from '../screens/Settings/ChangePasswordScreen';

import { useThemeStore } from '../store/themeStore';
import { radii, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type RootStackParamList = {
  HomeTabs: undefined;
  Home: undefined;
  Search: undefined;
  Publish: undefined;
  PublishTrip: undefined;
  Messages: undefined;
  Profile: undefined;
  Settings: undefined;
  Security: undefined;
  Privacy: undefined;
  ChangePassword: undefined;
  Reviews: undefined;
  AllTrips: undefined;
  RideDetails: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

function TabIcon({ name, focused, color, label }: { name: string; focused: boolean; color: string, label: string }) {
  const { currentColors } = useThemeStore();
  return (
    <View style={styles.tabIconContainer}>
      <Feather name={name} size={24} color={color} style={{ opacity: focused ? 1 : 0.7 }} />
      <Text
        style={[
          typography.small,
          {
            color: focused ? color : currentColors.textSecondary,
            fontWeight: focused ? '700' : '500',
            marginTop: 4,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function HomeTabs() {
  const { currentColors } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: currentColors.tabBarBackground || currentColors.surface,
          borderTopColor: currentColors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
        },
        tabBarActiveTintColor: currentColors.primary,
        tabBarInactiveTintColor: currentColors.textSecondary,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" label="Accueil" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="search" label="Recherche" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Publish"
        component={PublishScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.fabContainer, { backgroundColor: currentColors.surface }]}>
              <View
                style={[
                  styles.fab,
                  {
                    backgroundColor: currentColors.primary,
                    shadowColor: currentColors.primary,
                  },
                ]}
              >
                <Feather name="plus" size={28} color="#FFF" />
              </View>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="message-circle" label="Messages" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="user" label="Profil" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  const { currentColors } = useThemeStore();
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        cardStyle: { backgroundColor: currentColors.background },
        presentation: 'card',
      }}
    >
      <Stack.Screen name="HomeTabs" component={HomeTabs} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Reviews" component={ReviewsScreen} />
      <Stack.Screen name="AllTrips" component={AllTripsScreen} />
      <Stack.Screen name="RideDetails" component={RideDetailsScreen} />
      <Stack.Screen name="PublishTrip" component={PublishTripScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});
