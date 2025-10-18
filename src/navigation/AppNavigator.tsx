// AppNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Import your screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import AccountTypeSelectionScreen from '../screens/AccountTypeSelectionScreen';
import SignUpScreen from '../screens/SignUpScreen';
import BottomTabNavigator, { BottomTabParamList } from './BottomTabNavigator';
import VetProfileEditScreen from '../screens/VetProfileEditScreen';
import VetProfileDetailScreen from '../screens/VetProfileDetailScreen';
import TestMapScreen from '../screens/TestMapScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  AccountTypeSelection: undefined;
  MainTabs: { screen?: keyof BottomTabParamList };
  VetProfileEdit: undefined;
  VetProfileDetail: { vetId: string };
  Map: undefined;
  ChatScreen: { vetId: string; userId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

//  Custom header component
const CustomHeader: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.headerBackground }]}>
      <Image
        source={require('../../assets/title_bar_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const AppNavigator: React.FC<{ initialRouteName: keyof RootStackParamList }> = ({ initialRouteName }) => {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        header: () => <CustomHeader />, // use custom header
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="AccountTypeSelection" component={AccountTypeSelectionScreen} />
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen
        name="Map"
        component={TestMapScreen}
      />
      <Stack.Screen
        name="VetProfileEdit"
        component={VetProfileEditScreen}
      />
      <Stack.Screen
        name="VetProfileDetail"
        component={VetProfileDetailScreen}
      />
      <Stack.Screen
        name="ChatScreen"
        component={ChatScreen}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    height: 80, // Set the header height explicitly to avoid layout glitches :contentReference[oaicite:3]{index=3}
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 900,  // logo width
    height: 90, // logo height
  },
});

export default AppNavigator;