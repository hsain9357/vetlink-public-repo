// utils/resizeBase64Image.ts

import ImageResizer from 'react-native-image-resizer';
import RNFS from 'react-native-fs';

/**
 * Resize a base64 image and return the new base64 string.
 * @param base64String - Original base64 image string (without `data:image/...` prefix)
 * @param width - Desired width
 * @param height - Desired height
 * @param format - Image format: 'JPEG' | 'PNG' | 'WEBP'
 * @param quality - Quality from 0 to 100 (only applies to JPEG/WEBP)
 * @returns Resized base64 string (with no prefix)
 */
export const resizeBase64Image = async (
  base64String: string,
  width: number,
  height: number,
  format: 'JPEG' | 'PNG' | 'WEBP' = 'JPEG',
  quality: number = 80
): Promise<string> => {
  try {
    // 1. Save base64 as a temporary file
    const fileName = `original_${Date.now()}.jpg`;
    const filePath = `${RNFS.TemporaryDirectoryPath}/${fileName}`;
    await RNFS.writeFile(filePath, base64String, 'base64');

    // 2. Resize image
    const resizedImage = await ImageResizer.createResizedImage(
      `file://${filePath}`,
      width,
      height,
      format,
      quality,
      0 // rotation
    );

    // 3. Read resized file back to base64
    const resizedBase64 = resizedImage.uri ? await RNFS.readFile(resizedImage.uri, 'base64') : null;

    // 4. Clean up (optional)
    await RNFS.unlink(filePath);
    await RNFS.unlink(resizedImage.uri.replace('file://', ''));

    return resizedBase64;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error;
  }
};
