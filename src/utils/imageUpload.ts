import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase/supabase';
import { Alert } from 'react-native';

export async function pickImageAndUpload(userId: string, bucketName: string = 'avatars'): Promise<string | null> {
  // Request media library permissions
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission required', 'Please grant media library permissions to upload images.');
    return null;
  }

  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
    base64: true, // Request base64 encoding
  });

  if (result.canceled || !result.assets[0].base64) {
    return null;
  }

  const base64Image = `data:${result.assets[0].mimeType};base64,${result.assets[0].base64}`;
  return base64Image;
}