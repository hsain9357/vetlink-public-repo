import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator, { RootStackParamList } from './src/navigation/AppNavigator';
import './src/i18n/i18n'; // Import i18n configuration
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
// components/ErrorBoundary.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from './src/supabase/supabase';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error: Error | null };

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('App.tsx - onAuthStateChange - Event:', _event);
      console.log('App.tsx - onAuthStateChange - Session:', session);

      if (session) {
        // Fetch user profile to check if account type is already selected
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single();

        console.log('App.tsx - onAuthStateChange - Profile:', profile);
        console.log('App.tsx - onAuthStateChange - Profile Error:', profileError);

        if (profile && profile.user_type) {
          // Account type already selected (non-empty string)
          setInitialRoute('MainTabs');
          
        } else {
          // Profile not found, user_type is null, or user_type is an empty string, user needs to select account type
          setInitialRoute('AccountTypeSelection');
          
        }
      } else {
        setInitialRoute('Welcome');
      }
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading || initialRoute === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const ThemedStatusBar = () => {
    const { theme } = useTheme();
    return <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />;
  };

  return (
    <ThemeProvider>
      <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY || 'YOUR_STRIPE_PUBLISHABLE_KEY'}>
        <NavigationContainer>
          <AppNavigator initialRouteName={initialRoute as keyof RootStackParamList} />
          <ThemedStatusBar />
        </NavigationContainer>
      </StripeProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
});

