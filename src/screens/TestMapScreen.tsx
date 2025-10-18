import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useTranslation } from 'react-i18next';

interface MarkerData {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
}

const MapScreen: React.FC = () => {
  const { t } = useTranslation();
  const initialRegion: Region = {
    latitude: 37.7749, // San Francisco
    longitude: -122.4194,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const markers: MarkerData[] = [
    {
      id: '1',
      title: t('test_map_screen.vet_clinic_1'),
      description: t('test_map_screen.open_hours'),
      coordinate: { latitude: 37.7799, longitude: -122.4294 },
    },
    {
      id: '2',
      title: t('test_map_screen.pet_store'),
      description: t('test_map_screen.pet_supplies'),
      coordinate: { latitude: 37.7699, longitude: -122.4094 },
    },
    {
      id: '3',
      title: t('test_map_screen.dog_park'),
      description: t('test_map_screen.evening_walks'),
      coordinate: { latitude: 37.7849, longitude: -122.4194 },
    },
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={initialRegion}
        initialRegion={initialRegion}
        showsUserLocation={true}
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            title={marker.title}
            description={marker.description}
            coordinate={marker.coordinate}
          />
        ))}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
