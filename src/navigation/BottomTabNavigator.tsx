import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ChatListScreen from '../screens/ChatListScreen'; // Import ChatListScreen
import AIChatScreen from '../screens/AIChatScreen'; // Import AIChatScreen
import MapScreen from '../screens/MapScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import VetProfileEditScreen from '../screens/VetProfileEditScreen';
import TestMapScreen from '../screens/TestMapScreen';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { HeaderLogo } from './AppNavigator'; // Import HeaderLogo
export type BottomTabParamList = {
  HomeTab: undefined;
  ChatTab: undefined;
  AIChatTab: undefined; // New tab for AI Chat
  MapTab: undefined;
  SubscriptionTab: undefined;
  ProfileTab: undefined; // Placeholder for profile screen
};

const Tab = createBottomTabNavigator<BottomTabParamList>();

const BottomTabNavigator = () => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();

  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'AIChatTab') {
            iconName = focused ? 'chatbox' : 'chatbox-outline'; // Icon for AI Chat
          } else if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'SubscriptionTab') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle'; // Default icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.activeTint,
        tabBarInactiveTintColor: colors.inactiveTint,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.inputBorder, // Use inputBorder for consistency
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.headerBackground,
        },
        headerTitleStyle: {
          color: colors.text,
        },
        tabBarLabelStyle: {
          color: colors.inactiveTint,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          headerShown: false, // Hide the header for HomeTab
          tabBarLabel: t('navigation.home'),
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{ headerShown: false, tabBarLabel: t('map.tab_title') }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatListScreen}
        options={{ headerShown: false, tabBarLabel: t('chat_list.tab_title') }}
      />
      <Tab.Screen
        name="AIChatTab"
        component={AIChatScreen}
        options={{ headerShown: false, tabBarLabel: t('ai_chat.tab_title') }}
      />
       {/* <Tab.Screen
         name="TestMapTab"
         component={TestMapScreen}
         options={{ headerShown: false, tabBarLabel: t('navigation.test_map') }} // Use 'Test Map' as the title for the map screen
       /> */}
 
      {/* Placeholder for Subscription Screen
       <Tab.Screen
         name="SubscriptionTab"
         component={SubscriptionScreen}
         options={{ headerShown: false, tabBarLabel: t('subscription.tab_title') }}
       />
 */}
      <Tab.Screen
        name="ProfileTab"
        component={VetProfileEditScreen} // Navigate to VetProfileEditScreen for now
        options={{ headerShown: false, tabBarLabel: t('profile.tab_title') }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;