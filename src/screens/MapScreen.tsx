import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  TouchableOpacity,
  Button,
} from 'react-native';
import MapView, { Marker, Region, MapMarker } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Location from 'expo-location';
import { supabase } from '../supabase/supabase';
// import { resizeBase64Image } from '../utils/base64ToResizedImage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';



interface Vet {
  id: string;
  name: string;
  specialization: string;
  location_latitude: number;
  location_longitude: number;
  avatar_url: string;
}

type MapScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;
type Props = { navigation: MapScreenNavigationProp };

const VetMarkerIcon = ({ onPress }: { onPress: () => void }) => {
  const { colors } = useTheme(); // Access theme colors here
  return (
    <FontAwesome
      name="paw"
      size={36}
      color={colors.buttonPrimary}
      style={{ textShadowColor: colors.buttonText, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1 }}
    />
  );
};
const UserLocationMarker = React.memo(React.forwardRef(({ coordinate }: { coordinate: { latitude: number; longitude: number } }, ref: React.Ref<MapMarker>) => (
  <Marker coordinate={coordinate} anchor={{ x: 0.5, y: 0.5 }} ref={ref}>
    <View style={styles.userLocationDot} />
  </Marker>
)));

const MapScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const userLocationMarkerRef = useRef<MapMarker>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [vets, setVets] = useState<Vet[]>([]);
  const mapRef = useRef<any>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [completedRegion, setCompletedRegion] = useState<Region | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMapReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useFocusEffect(useCallback(() => {
    setMapKey((k) => k + 1);
    setTimeout(async() => {
      if (mapRef.current && mapRegion) {
        try {
          // console.log({completedRegion});
          let completedRegionFromStorage = await AsyncStorage.getItem('completedRegion');
          completedRegionFromStorage = completedRegionFromStorage ? JSON.parse(completedRegionFromStorage) : null;

          console.log({completedRegionFromStorage});
          mapRef.current.animateToRegion((completedRegionFromStorage || mapRegion), 0);
          
        } catch (error) {
          console.error('Error setting map region:', error);
          
        }
      }
    }, 100);
  }, [mapRegion]));

  const fetchVets = useCallback(async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'veterinarian')
      .not('location_latitude', 'is', null)
      .not('location_longitude', 'is', null);
    if (error) {
      Alert.alert(t('general.error'), t('map.failed_to_load_vets'));
    } else {
      setVets(data || []);
    }
  }, []);

  useEffect(() => {
    fetchVets();
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, payload => fetchVets())
      .subscribe();
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchVets]);

  useEffect(() => {
    (async () => {
      if (!initialLoadDone) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(t('general.permission_denied'), t('general.enable_location_services_short'));
          return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        };
        setMapRegion(region);
        mapRef.current?.animateToRegion(region, 1000);
        setInitialLoadDone(true);
      }
    })();
  }, [initialLoadDone]);

  useEffect(() => {
    let locationWatcher: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('general.permission_denied'), t('general.enable_location_services_long'));
        return;
      }

      locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
          userLocationMarkerRef.current?.animateMarkerToCoordinate(
            newLocation.coords,
            500
          );
        }
      );
    })();

    return () => {
      if (locationWatcher) {
        locationWatcher.remove();
      }
    };
  }, []);

  const animateToVetLocation = useCallback((lat: number, lng: number) => {
    const delta = mapRegion
      ? { latitudeDelta: mapRegion.latitudeDelta, longitudeDelta: mapRegion.longitudeDelta }
      : { latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
    const newRegion = { latitude: lat, longitude: lng, ...delta };
    setMapRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 1000);
  }, [mapRegion]);

  if (!location || !mapRegion) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.buttonPrimary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>{t('map.loading_location')}</Text>
      </View>
    );
  }

  return mapReady ? (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        ref={mapRef}
        key={mapKey}
        style={styles.map}
        showsMyLocationButton
        onMapReady={() => setMapReady(true)}
        // onRegionChangeComplete={(region) => setMapRegion(region)}
        onRegionChangeComplete={async (region) => {
          
         console.log(region);
         try {
          
         await AsyncStorage.setItem('completedRegion', JSON.stringify(region));
         } catch (error) {
          console.log(error);
          
         }
          // setCompletedRegion(region)
        
        }
        }
      >
        {vets.map( (vet) => {
          return(
          <Marker
            key={vet.id}
            coordinate={{
              latitude: vet.location_latitude,
              longitude: vet.location_longitude,
            }}
            onPress={() => navigation.navigate('VetProfileDetail', { vetId: vet.id })}
          >
            {/* add an icon  */}
            <VetMarkerIcon onPress={() => animateToVetLocation(vet.location_latitude, vet.location_longitude)} />
              
            
          </Marker>
        )})}
        {location && (
          <UserLocationMarker
            ref={userLocationMarkerRef}
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        )}
      </MapView>

      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: colors.inputBackground }]}
        onPress={() => {
          if (location) {
            mapRef.current?.animateToRegion({ ...mapRegion, latitude: location.coords.latitude, longitude: location.coords.longitude }, 1000);
          } else {
            Alert.alert(t('map.location_not_available'));
          }
        }}
      >
        <MaterialIcons name="my-location" size={24} color={colors.buttonPrimary} />
      </TouchableOpacity>

      <FlatList
        data={vets}
        keyExtractor={(i) => i.id}
        renderItem={({ item: vet }) => (
          <TouchableOpacity
            style={[styles.vetListItem, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}
            onPress={() => animateToVetLocation(vet.location_latitude, vet.location_longitude)}
          >
            {vet.avatar_url ? (
              <Image source={{ uri: vet.avatar_url }} style={styles.vetAvatar} />
            ) : (
              <View style={[styles.vetAvatarPlaceholder, { backgroundColor: colors.inputBorder }]}>
                <Text style={[styles.vetAvatarPlaceholderText, { color: colors.buttonText }]}>{t('map.placeholder_question_mark')}</Text>
              </View>
            )}
            <View style={styles.vetInfo}>
              <Text style={[styles.vetName, { color: colors.text }]}>{vet.name}</Text>
              <Text style={[styles.vetSpecialization, { color: colors.secondaryText }]}>{vet.specialization}</Text>
            </View>
            <TouchableOpacity
              style={[styles.detailsButton, { backgroundColor: colors.buttonPrimary }]}
              onPress={() => navigation.navigate('VetProfileDetail', { vetId: vet.id })}
            >
              <Text style={[styles.detailsButtonText, { color: colors.buttonText }]}>{t('map.details')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        style={[styles.vetList, { backgroundColor: colors.background }]}
      />

      {/* <Button
        title={t('map.go_to_location')}
        onPress={() =>
          mapRef.current?.animateToRegion(
            { latitude: 32.0468288, longitude: 45.2700619, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
            1000
          )
        }
      /> */}
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 18, fontWeight: 'bold' },
  map: { width: '100%', height: '60%' },
  userLocationDot: {
    backgroundColor: '#007bff', // Keeping this specific color for the user's location dot as it's a map element.
    width: 20,
    height: 20,
    borderRadius: 10,
    borderColor: '#fff', // Keeping this white for contrast.
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    borderRadius: 30,
    padding: 15,
    elevation: 5,
    zIndex: 1,
  },
  vetList: { flex: 1, marginTop: -20, paddingTop: 20, elevation: 5 },
  vetListItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  vetAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 15 },
  vetAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vetAvatarPlaceholderText: { fontSize: 24 },
  vetInfo: { flex: 1 },
  vetName: { fontSize: 18, fontWeight: 'bold' },
  vetSpecialization: { fontSize: 14 },
  detailsButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 5 },
  detailsButtonText: { fontSize: 14, fontWeight: 'bold' },
});

export default MapScreen;
