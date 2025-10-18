import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type SubscriptionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Subscription'>;

type Props = {
  navigation: SubscriptionScreenNavigationProp;
};

const SubscriptionScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();

  // Placeholder for user type, this would come from Supabase user profile
  const userType: 'pet_owner' | 'veterinarian' | 'company_office' = 'pet_owner'; // Default for now

  const renderSubscriptionOptions = () => {
    if (userType === 'pet_owner') {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('subscription.free_plan_title')}</Text>
          <Text style={styles.cardDescription}>{t('subscription.free_plan_description')}</Text>
          <Text style={styles.price}>{t('subscription.free')}</Text>
          <TouchableOpacity style={styles.currentPlanButton} disabled>
            <Text style={styles.currentPlanButtonText}>{t('subscription.current_plan')}</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (userType === 'veterinarian') {
      return (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('subscription.vet_monthly_title')}</Text>
            <Text style={styles.cardDescription}>{t('subscription.vet_monthly_description')}</Text>
            <Text style={styles.price}>{t('subscription.vet_monthly_price')}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={() => console.log('Subscribe Monthly')}>
              <Text style={styles.subscribeButtonText}>{t('subscription.subscribe')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('subscription.vet_annual_title')}</Text>
            <Text style={styles.cardDescription}>{t('subscription.vet_annual_description')}</Text>
            <Text style={styles.price}>{t('subscription.vet_annual_price')}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={() => console.log('Subscribe Annually')}>
              <Text style={styles.subscribeButtonText}>{t('subscription.subscribe')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (userType === 'company_office') {
      return (
        <View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('subscription.company_monthly_title')}</Text>
            <Text style={styles.cardDescription}>{t('subscription.company_monthly_description')}</Text>
            <Text style={styles.price}>{t('subscription.company_monthly_price')}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={() => console.log('Subscribe Company Monthly')}>
              <Text style={styles.subscribeButtonText}>{t('subscription.subscribe')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('subscription.company_annual_title')}</Text>
            <Text style={styles.cardDescription}>{t('subscription.company_annual_description')}</Text>
            <Text style={styles.price}>{t('subscription.company_annual_price')}</Text>
            <TouchableOpacity style={styles.subscribeButton} onPress={() => console.log('Subscribe Company Annually')}>
              <Text style={styles.subscribeButtonText}>{t('subscription.subscribe')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>{t('subscription.title')}</Text>
      {renderSubscriptionOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8', // Light grey background
    alignItems: 'center',
    padding: 20,
  },
  screenTitle: {
    fontSize: 28, // Larger title
    fontWeight: 'bold',
    color: '#333', // Darker text
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15, // More rounded corners
    padding: 25, // Increased padding
    marginBottom: 25, // More space between cards
    width: '95%', // Slightly wider cards
    alignItems: 'center',
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, // Stronger shadow
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22, // Larger title
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 15, // Slightly larger text
    color: '#666',
    textAlign: 'center',
    marginBottom: 20, // More space
  },
  price: {
    fontSize: 32, // Larger price
    fontWeight: 'bold',
    color: '#4A90E2', // Blue price
    marginBottom: 25, // More space
  },
  subscribeButton: {
    backgroundColor: '#4A90E2', // Blue button
    paddingVertical: 15, // Larger padding
    paddingHorizontal: 40, // Wider padding
    borderRadius: 10, // More rounded corners
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 18, // Larger text
    fontWeight: 'bold',
  },
  currentPlanButton: {
    backgroundColor: '#E0E0E0', // Light grey for current plan
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  currentPlanButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default SubscriptionScreen;