import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, I18nManager, ImageBackground } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../context/ThemeContext'; // Import useTheme
import { ThemeColors } from '../styles/themeColors'; // Import ThemeColors type

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

type Props = {
  navigation: WelcomeScreenNavigationProp;
};

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { theme, colors } = useTheme(); // Get theme and colors from context

  useEffect(() => {
    // Force RTL for Arabic, LTR for English
    if (i18n.language === 'ar') {
      I18nManager.forceRTL(true);
    } else {
      I18nManager.forceRTL(false);
    }
  }, [i18n.language]);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const themedStyles = getThemedStyles(theme, colors);

  return (
    <ImageBackground
      source={require('../../assets/homeImages/1.png')}
      style={themedStyles.backgroundImage}
      resizeMode="cover"
    >
      <View style={themedStyles.overlay}>
        <View style={themedStyles.languagePickerContainer}>
          <Picker
            selectedValue={i18n.language}
            onValueChange={(itemValue) => changeLanguage(itemValue)}
            style={themedStyles.languagePicker}
            itemStyle={themedStyles.languagePickerItem}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="العربية" value="ar" />
          </Picker>
        </View>

        <Text style={themedStyles.welcomeTitle}>{t('welcome.title')}</Text>
        <Text style={themedStyles.welcomeMessage}>{t('welcome.message')}</Text>

        <View style={themedStyles.buttonContainer}>
          <TouchableOpacity style={themedStyles.button} onPress={() => navigation.navigate('Login')}>
            <Text style={themedStyles.buttonText}>{t('welcome.login_button')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[themedStyles.button, themedStyles.signupButton]} onPress={() => navigation.navigate('SignUp')}>
            <Text style={themedStyles.buttonText}>{t('welcome.signup_button')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const getThemedStyles = (theme: 'light' | 'dark', colors: ThemeColors) => StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: theme === 'dark' ? 'transparent' : 'rgba(0,0,0,0.5)', // Make overlay transparent in dark mode
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 100, // Keep padding top for language picker
  },
  languagePickerContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'transparent', // Changed to transparent
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  languagePicker: {
    width: 120,
    height: 50,
    color: '#FFFFFF', // Explicitly set to white for dark mode
  },
  languagePickerItem: {
    color: '#FFFFFF', // Explicitly set to white for dark mode
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF', // Explicitly set to white
    marginBottom: 15,
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 18,
    color: '#FFFFFF', // Explicitly set to white
    marginBottom: 50,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 'auto',
    paddingBottom: 20,
  },
  button: {
    backgroundColor: colors.buttonPrimary,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  signupButton: {
    backgroundColor: colors.buttonSecondary,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;