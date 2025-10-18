import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../supabase/supabase';
import { useTheme } from '../context/ThemeContext'; // Import the useTheme hook

type SignUpScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

type Props = {
  navigation: SignUpScreenNavigationProp;
};

const SignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme(); // Use the theme colors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    else Alert.alert(t('general.check_email_confirmation'));
    setLoading(false);
  }

  // Define styles inside the component to access theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Use theme background color
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text, // Use theme text color
      marginBottom: 40,
    },
    input: {
      width: '100%',
      padding: 15,
      borderWidth: 1,
      borderColor: colors.inputBorder, // Use theme input border color
      borderRadius: 10,
      marginBottom: 15,
      backgroundColor: colors.inputBackground, // Use theme input background color
      fontSize: 16,
      color: colors.text, // Use theme text color
    },
    button: {
      backgroundColor: colors.buttonPrimary, // Use theme primary button color
      width: '100%',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    buttonText: {
      color: colors.buttonText, // Use theme button text color
      fontSize: 18,
      fontWeight: 'bold',
    },
    loginContainer: {
      flexDirection: 'row',
      marginTop: 20,
      alignItems: 'center',
    },
    loginText: {
      fontSize: 16,
      color: colors.secondaryText, // Use theme secondary text color
    },
    loginLink: {
      fontSize: 16,
      color: colors.buttonPrimary, // Use theme primary button color for link
      fontWeight: 'bold',
      marginLeft: 5,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('signup.title')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('login.email_placeholder')}
        placeholderTextColor={colors.secondaryText}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder={t('login.password_placeholder')}
        placeholderTextColor={colors.secondaryText}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('general.loading') : t('signup.create_account_button')}</Text>
      </TouchableOpacity>
      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>{t('signup.already_have_account')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={styles.loginLink}>{t('login.login_button')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUpScreen;