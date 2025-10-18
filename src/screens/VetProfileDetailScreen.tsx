import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../supabase/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext'; 

type VetProfileDetailScreenProps = NativeStackScreenProps<RootStackParamList, 'VetProfileDetail'>;

const VetProfileDetailScreen: React.FC<VetProfileDetailScreenProps> = ({ route, navigation }) => {
  const { vetId } = route.params;
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [vetProfile, setVetProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
      }
    };
    fetchCurrentUser();
    fetchVetProfile();
  }, [vetId]);

  async function fetchVetProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', vetId)
      .single();

    if (error) {
      Alert.alert('Error fetching profile', error.message);
    } else if (data) {
      setVetProfile(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading veterinarian profile...</Text>
      </View>
    );
  }

  if (!vetProfile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Veterinarian profile not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.inputBackground }]}>
        {vetProfile.avatar_url ? (
          <Image source={{ uri: vetProfile.avatar_url }} style={styles.avatar} resizeMode="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.inputBorder }]}>
            <Ionicons name="person" size={60} color={colors.secondaryText} />
          </View>
        )}
        <Text style={[styles.name, { color: colors.text }]}>{vetProfile.name || 'N/A'}</Text>
        {vetProfile.rating !== null && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#FFD700" /> {/* Star color can remain constant */}
            <Text style={[styles.ratingText, { color: colors.secondaryText }]}>{vetProfile.rating.toFixed(1)} ({vetProfile.review_count || 0} {t('vet_profile_detail.reviews')})</Text>
          </View>
        )}
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>{t('vet_profile_detail.specialization')}:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{vetProfile.specialization || 'N/A'}</Text>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>{t('vet_profile_detail.working_hours')}:</Text>
        <Text style={[styles.value, { color: colors.text }]}>{vetProfile.working_hours || 'N/A'}</Text>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.label, { color: colors.secondaryText }]}>{t('vet_profile_detail.location')}:</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {vetProfile.location_latitude && vetProfile.location_longitude
            ? `${vetProfile.location_latitude}, ${vetProfile.location_longitude}`
            : 'N/A'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.chatButton, { backgroundColor: colors.buttonPrimary }]}
        onPress={() => {
          if (currentUserId && vetId) {
            navigation.navigate('ChatScreen', { vetId: vetId, userId: currentUserId });
          } else {
            Alert.alert('Error', 'Could not start chat. User ID or Vet ID is missing.');
          }
        }}
      >
        <Ionicons name="chatbubbles" size={24} color={colors.buttonText} style={styles.chatIcon} />
        <Text style={[styles.chatButtonText, { color: colors.buttonText }]}>{t('vet_profile_detail.chat_with_vet')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.reviewButton, { backgroundColor: colors.inputBackground, borderColor: colors.buttonPrimary }]} onPress={() => Alert.alert('Leave Review', 'Review functionality coming soon!')}>
        <Ionicons name="star-half" size={24} color={colors.buttonPrimary} style={styles.reviewIcon} />
        <Text style={[styles.reviewButtonText, { color: colors.buttonPrimary }]}>{t('vet_profile_detail.leave_review')}</Text>
      </TouchableOpacity>

      {/* Placeholder for reviews list */}
      <View style={[styles.reviewsContainer, { backgroundColor: colors.inputBackground }]}>
        <Text style={[styles.reviewsTitle, { color: colors.text }]}>{t('vet_profile_detail.reviews')}</Text>
        {/* Render actual reviews here */}
        <Text style={[styles.noReviewsText, { color: colors.secondaryText }]}>No reviews yet.</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E0E0E0', // Keeping this fixed light gray for avatar placeholder background as it's a specific UI element.
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 5,
  },
  infoSection: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  chatIcon: {
    marginRight: 10,
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    marginBottom: 20,
  },
  reviewIcon: {
    marginRight: 10,
  },
  reviewButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewsContainer: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  noReviewsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default VetProfileDetailScreen;