import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, Switch, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../supabase/supabase';
import { pickImageAndUpload } from '../utils/imageUpload';
import * as Location from 'expo-location';
import { useTheme } from '../context/ThemeContext';
import { Picker } from '@react-native-picker/picker'; // Import Picker
import { ThemeColors } from '../styles/themeColors'; // Import ThemeColors type

type VetProfileEditScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VetProfileEdit'>;

type Props = {
  navigation: VetProfileEditScreenNavigationProp;
};

const VetProfileEditScreen: React.FC<Props> = ({ navigation }) => {
  const { t, i18n } = useTranslation(); // Destructure i18n from useTranslation
  const { theme, toggleTheme, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userType, setUserType] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language); // State for selected language

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        Alert.alert('Error fetching profile', error.message);
      } else if (data) {
        setProfile(data);
        setName(data.name || '');
        setSpecialization(data.specialization || '');
        setWorkingHours(data.working_hours || '');
        setLatitude(data.location_latitude ? String(data.location_latitude) : '');
        setLongitude(data.location_longitude ? String(data.location_longitude) : '');
        setAvatarUrl(data.avatar_url || null);
        setUserType(data.user_type || null);
      }
    }
    setLoading(false);
  }

  async function handleSaveProfile() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const updates = {
        id: user.id,
        user_type: profile?.user_type,
        name,
        specialization: userType === 'veterinarian' ? specialization : null,
        working_hours: userType === 'veterinarian' ? workingHours : null,
        location_latitude: userType === 'veterinarian' && latitude ? parseFloat(latitude) : null,
        location_longitude: userType === 'veterinarian' && longitude ? parseFloat(longitude) : null,
        avatar_url: avatarUrl,
        updated_at: new Date(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) {
        Alert.alert('Error saving profile', error.message);
      } else {
        Alert.alert('Profile saved successfully!');
      }
    }
    setLoading(false);
  }

  async function handlePickImage() {
    const url = await pickImageAndUpload(profile?.id || '');
    if (url) {
      setAvatarUrl(url);
    }
  }

  async function handleGetLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please enable location services to get your current location.');
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLatitude(String(currentLocation.coords.latitude));
    setLongitude(String(currentLocation.coords.longitude));
  }

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setSelectedLanguage(lang);
  };

  if (loading) {
    return (
      <View style={themedStyles(theme, colors).loadingContainer}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={themedStyles(theme, colors).loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={themedStyles(theme, colors).container}>

      <TouchableOpacity onPress={handlePickImage} style={themedStyles(theme, colors).avatarContainer}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={themedStyles(theme, colors).avatar} resizeMode="cover" />
        ) : (
          <View style={themedStyles(theme, colors).avatarPlaceholder}>
            <Text style={themedStyles(theme, colors).avatarPlaceholderText}>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={themedStyles(theme, colors).label}>{t('vet_profile.name')}</Text>
      <TextInput
        style={themedStyles(theme, colors).input}
        value={name}
        onChangeText={setName}
        placeholder={t('vet_profile.name_placeholder')}
      />

      {userType === 'veterinarian' && (
        <>
          <Text style={themedStyles(theme, colors).label}>{t('vet_profile.specialization')}</Text>
          <TextInput
            style={themedStyles(theme, colors).input}
            value={specialization}
            onChangeText={setSpecialization}
            placeholder={t('vet_profile.specialization_placeholder')}
          />

          <Text style={themedStyles(theme, colors).label}>{t('vet_profile.working_hours')}</Text>
          <TextInput
            style={themedStyles(theme, colors).input}
            value={workingHours}
            onChangeText={setWorkingHours}
            placeholder={t('vet_profile.working_hours_placeholder')}
          />

          <Text style={themedStyles(theme, colors).label}>{t('vet_profile.location')}</Text>
          <View style={themedStyles(theme, colors).locationInputContainer}>
            <TextInput
              style={[themedStyles(theme, colors).input, themedStyles(theme, colors).halfInput]}
              value={latitude}
              onChangeText={setLatitude}
              placeholder={t('vet_profile.latitude_placeholder')}
              keyboardType="numeric"
            />
            <TextInput
              style={[themedStyles(theme, colors).input, themedStyles(theme, colors).halfInput]}
              value={longitude}
              onChangeText={setLongitude}
              placeholder={t('vet_profile.longitude_placeholder')}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity style={themedStyles(theme, colors).getLocationButton} onPress={handleGetLocation}>
            <Text style={themedStyles(theme, colors).getLocationButtonText}>{t('vet_profile.get_current_location')}</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Theme Switch */}
      <View style={themedStyles(theme, colors).themeSwitchContainer}>
        <Text style={themedStyles(theme, colors).themeSwitchText}>{t('vet_profile.dark_mode')}</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={theme === 'dark' ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleTheme}
          value={theme === 'dark'}
        />
      </View>

      {/* Language Selection */}
      <View style={themedStyles(theme, colors).languageContainer}>
        <Text style={themedStyles(theme, colors).languageLabel}>{t('vet_profile.language')}</Text>
        {Platform.OS === 'ios' || Platform.OS === 'android' ? (
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue: string) => changeLanguage(itemValue)}
            style={themedStyles(theme, colors).languagePicker}
            itemStyle={themedStyles(theme, colors).languagePickerItem}
          >
            <Picker.Item label="English" value="en" />
            <Picker.Item label="العربية" value="ar" />
          </Picker>
        ) : (
          <View style={themedStyles(theme, colors).languageWebButtons}>
            <TouchableOpacity
              style={[themedStyles(theme, colors).languageButton, selectedLanguage === 'en' && themedStyles(theme, colors).languageButtonActive]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={[themedStyles(theme, colors).languageButtonText, selectedLanguage === 'en' && themedStyles(theme, colors).languageButtonTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[themedStyles(theme, colors).languageButton, selectedLanguage === 'ar' && themedStyles(theme, colors).languageButtonActive]}
              onPress={() => changeLanguage('ar')}
            >
              <Text style={[themedStyles(theme, colors).languageButtonText, selectedLanguage === 'ar' && themedStyles(theme, colors).languageButtonTextActive]}>العربية</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <TouchableOpacity style={themedStyles(theme, colors).saveButton} onPress={handleSaveProfile} disabled={loading}>
        <Text style={themedStyles(theme, colors).saveButtonText}>{loading ? 'Saving...' : t('vet_profile.save_profile')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={themedStyles(theme, colors).signOutButton} onPress={async () => {
        await supabase.auth.signOut();
        navigation.navigate('Login');
      }}>
        <Text style={themedStyles(theme, colors).signOutButtonText}>{t('vet_profile.sign_out')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getThemedStyles = (theme: 'light' | 'dark', colors: ThemeColors) => {
  const verticalSpacing = 15; // Define a consistent vertical spacing unit

  return StyleSheet.create({
    container: {
      flex: 1,
      padding: verticalSpacing * 1.5, // Consistent padding
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      marginTop: verticalSpacing * 0.7,
      fontSize: 16,
      color: colors.secondaryText,
    },
    themeSwitchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: verticalSpacing * 1.5,
      padding: verticalSpacing * 0.7,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    themeSwitchText: {
      fontSize: 16,
      color: colors.text,
      fontWeight: 'bold',
    },
    languageContainer: {
      marginBottom: verticalSpacing * 1.5,
      padding: verticalSpacing * 0.7,
      backgroundColor: colors.inputBackground,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
    },
    languageLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text, // Make label more prominent
      marginBottom: verticalSpacing * 0.7,
    },
    languagePicker: {
      color: colors.text,
    },
    languagePickerItem: {
      color: colors.text,
    },
    languageWebButtons: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    languageButton: {
      paddingVertical: verticalSpacing * 0.7,
      paddingHorizontal: verticalSpacing * 1.3,
      borderRadius: 8,
      backgroundColor: colors.buttonSecondary,
    },
    languageButtonActive: {
      backgroundColor: colors.buttonPrimary,
    },
    languageButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
    languageButtonTextActive: {
      color: '#fff',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: verticalSpacing * 2,
      textAlign: 'center',
    },
    avatarContainer: {
      alignSelf: 'center',
      marginBottom: verticalSpacing * 2,
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.inputBorder, // Use input border color for placeholder
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarPlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.inputBorder, // Use input border color for placeholder
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarPlaceholderText: {
      color: colors.secondaryText,
      fontSize: 14,
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text, // Make label more prominent
      marginBottom: verticalSpacing * 0.5,
      marginTop: verticalSpacing,
    },
    input: {
      backgroundColor: colors.inputBackground,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 10,
      padding: verticalSpacing,
      fontSize: 16,
      color: colors.text,
      marginBottom: verticalSpacing,
    },
    locationInputContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: verticalSpacing, // Add margin to the container
    },
    halfInput: {
      width: '48%',
      marginBottom: 0, // Keep 0 here as the container has the margin
    },
    getLocationButton: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: verticalSpacing * 0.8,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: verticalSpacing * 0.7,
      marginBottom: verticalSpacing * 1.5,
    },
    getLocationButtonText: {
      color: colors.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
    saveButton: {
      backgroundColor: colors.buttonPrimary,
      paddingVertical: verticalSpacing,
      borderRadius: 10,
      alignItems: 'center',
      marginTop: verticalSpacing * 1.5,
      marginBottom: verticalSpacing * 2,
    },
    saveButtonText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
    signOutButton: {
      backgroundColor: colors.buttonSecondary,
      paddingVertical: verticalSpacing,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: verticalSpacing * 2,
    },
    signOutButtonText: {
      color: colors.buttonText,
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
};

const themedStyles = (theme: 'light' | 'dark', colors: ThemeColors) => getThemedStyles(theme, colors);

export default VetProfileEditScreen;