import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../supabase/supabase';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { ThemeColors } from '../styles/themeColors'; // Import ThemeColors type

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme(); // Get theme and colors from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Alert.alert(error.message);
    } else if (data.user) {
      // Fetch user profile to check if account type is already selected
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', data.user.id)
        .single();

      if (profile && profile.user_type) {
        // Account type already selected (non-empty string)
        navigation.navigate('MainTabs', {});
      } else {
        // Profile not found, user_type is null, or user_type is an empty string, user needs to select account type
        navigation.navigate('AccountTypeSelection');
      }
    }
    setLoading(false);
  }

  const themedStyles = getThemedStyles(colors);

  return (
    <View style={themedStyles.container}>
      <Text style={themedStyles.title}>{t('login.title')}</Text>
      <TextInput
        style={themedStyles.input}
        placeholder={t('login.email_placeholder')}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={colors.secondaryText} // Use themed placeholder color
      />
      <TextInput
        style={themedStyles.input}
        placeholder={t('login.password_placeholder')}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={colors.secondaryText} // Use themed placeholder color
      />
      <TouchableOpacity style={themedStyles.button} onPress={handleLogin} disabled={loading}>
        <Text style={themedStyles.buttonText}>{loading ? t('general.loading') : t('login.login_button')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getThemedStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 40,
  },
  input: {
    width: '100%',
    padding: 15,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: colors.inputBackground,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;