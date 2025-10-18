import React from 'react';
// Dummy comment to trigger re-evaluation
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../supabase/supabase';

type AccountTypeSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AccountTypeSelection'>;

type Props = {
  navigation: AccountTypeSelectionScreenNavigationProp;
};

const AccountTypeSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  const handleAccountTypeSelection = async (type: 'veterinarian' | 'pet_owner' | 'company_office') => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, user_type: type });

      if (error) {
        console.error('Error upserting profile:', error);
        Alert.alert(t('general.error'), error.message);
      } else {
        console.log(`User ${user.id} selected account type: ${type}`);
        Alert.alert(t('general.profile_saved'), `${t('general.you_selected')}${type}`);
        // Navigate to the appropriate home screen based on user type
        (navigation as any).navigate('MainTabs');
      }
    } else {
      Alert.alert(t('general.error'), t('general.no_active_user_session'));
      navigation.navigate('Login'); // Redirect to login if no user
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('account_type.title')}</Text>
      <TouchableOpacity style={styles.optionButton} onPress={() => handleAccountTypeSelection('veterinarian')}>
        <Text style={styles.optionText}>{t('account_type.veterinarian')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => handleAccountTypeSelection('pet_owner')}>
        <Text style={styles.optionText}>{t('account_type.pet_owner')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.optionButton} onPress={() => handleAccountTypeSelection('company_office')}>
        <Text style={styles.optionText}>{t('account_type.company_office')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light grey background
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32, // Larger title
    fontWeight: 'bold',
    color: '#333', // Darker text
    marginBottom: 40, // More space
  },
  optionButton: {
    width: '80%',
    padding: 20,
    borderWidth: 2, // Thicker border
    borderColor: '#4A90E2', // Blue border
    borderRadius: 15, // More rounded corners
    alignItems: 'center',
    marginBottom: 20, // More space between buttons
    backgroundColor: '#fff', // White background for options
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 20, // Larger text
    fontWeight: 'bold',
    color: '#4A90E2', // Blue text
  },
});

export default AccountTypeSelectionScreen;