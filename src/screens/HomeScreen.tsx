import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image, FlatList, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { registerForPushNotificationsAsync } from '../utils/notifications';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../styles/themeColors'; // Import ThemeColors type

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainTabs'>; // Corrected type for navigation
};

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();

  const { width } = Dimensions.get('window');
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    require('../../assets/homeImages/1.png'),
    require('../../assets/homeImages/2.png'),
    require('../../assets/homeImages/3.png'),
  ];

  useEffect(() => {
    registerForPushNotificationsAsync();

    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => {
        const newIndex = (prevIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        return newIndex;
      });
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, []);

  const themedStyles = getThemedStyles(theme, colors);

  const renderItem = ({ item }: { item: any }) => (
    <Image source={item} style={themedStyles.carouselImage} />
  );

  return (
    <View style={themedStyles.container}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setActiveIndex(newIndex);
        }}
        keyExtractor={(item, index) => index.toString()}
        style={themedStyles.carousel}
      />
      <View style={themedStyles.overlay} />
      <View style={themedStyles.contentContainer}>
        <Text style={themedStyles.welcomeTitle}>{t('home.welcome_title')}</Text>
        <Text style={themedStyles.welcomeSubtitle}>{t('home.welcome_subtitle')}</Text>
        <TouchableOpacity
          style={themedStyles.button}
          onPress={() => navigation.navigate('MainTabs', { screen: 'MapTab' })}
        >
          <Text style={themedStyles.buttonText}>{t('home.get_started')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const getThemedStyles = (theme: 'light' | 'dark', colors: ThemeColors) => {
  // Note: The background, text, and secondaryText colors here are specifically for the overlay
  // and might differ from the general theme colors to ensure readability on the image.
  // The button colors will use the centralized theme colors.

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background, // Use themed background
    },
    carousel: {
      width: '100%',
      height: '100%',
    },
    carouselImage: {
      width: Dimensions.get('window').width,
      height: '100%',
      resizeMode: 'cover',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark filter remains
    },
    contentContainer: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    welcomeTitle: {
      fontSize: 38,
      fontWeight: 'bold',
      color: colors.buttonText, // Use buttonText for strong contrast on overlay
      marginBottom: 10,
      textAlign: 'center',
    },
    welcomeSubtitle: {
      fontSize: 18,
      color: colors.buttonText, // Use buttonText for strong contrast on overlay
      textAlign: 'center',
      marginBottom: 40,
      paddingHorizontal: 20,
    },
    button: {
      backgroundColor: colors.buttonPrimary, // Use themed primary button color
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
    },
    buttonText: {
      color: colors.buttonText, // Use themed button text color
      fontSize: 18,
      fontWeight: 'bold',
    },
  });
};

export default HomeScreen;