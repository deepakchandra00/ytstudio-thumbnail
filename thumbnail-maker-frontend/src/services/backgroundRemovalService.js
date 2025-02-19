import { Platform } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Alert } from 'react-native';

// Remove.bg API configuration from environment variables
const REMOVE_BG_API_BASE_URL = 'https://api.remove.bg/v1.0/removebgs';
const REMOVE_BG_API_KEY = `JjQnBr88BLmHwjdrGcT2PXVU`;

// Utility function to log errors
const logError = (context, error) => {
  console.error(`Background Removal Error - ${context}:`, {
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...(error.response && { 
      responseStatus: error.response.status, 
      responseData: error.response.data 
    })
  });
};

// Platform-specific implementation
export const removeBackground = async (imageUri, options = {}) => {
  console.log('Remove Background - Input Image URI:', imageUri);

  // Validate input
  if (!imageUri) {
    const error = new Error('No image URI provided');
    logError('Input Validation', error);
    throw error;
  }

  try {
    // Validate file existence for local files
    if (imageUri.startsWith('file:') || imageUri.startsWith('content:')) {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        const error = new Error('Image file does not exist');
        logError('File Check', error);
        throw error;
      }
    }

    // Platform-specific background removal
    if (Platform.OS === 'web') {
      return await webRemoveBackground(imageUri, options);
    } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return await nativeRemoveBackground(imageUri, options);
    }
  } catch (error) {
    logError('Background Removal', error);
    throw error;
  }
};

// Web-specific background removal using Remove.bg
async function webRemoveBackground(imageUri, options = {}) {
  return await removeBgBackgroundRemoval(imageUri, options);
}

// Native platform background removal
async function nativeRemoveBackground(imageUri, options = {}) {
  return await removeBgBackgroundRemoval(imageUri, options);
}

// Utility function to convert image URI to base64
async function convertImageToBase64(imageUri) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }
    const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
    return base64;
  } catch (error) {
    logError('Image to Base64 Conversion', error);
    throw error;
  }
}

// Shared background removal logic for both web and native platforms
async function removeBgBackgroundRemoval(imageUri, options = {}) {
  if (!REMOVE_BG_API_KEY) {
    throw new Error('Remove.bg API key is not configured');
  }

  try {
    const base64Image = await convertImageToBase64(imageUri);

    // Prepare request to Remove.bg API
    const response = await axios.post(
      REMOVE_BG_API_BASE_URL, 
      {
        image_file_b64: base64Image,
        size: 'auto', // You can customize this based on options
        type: 'auto', // You can customize this based on options
      },
      {
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );

    // Cross-platform base64 conversion
    let base64Result;
    if (Platform.OS === 'web') {
      // For web, use Buffer
      base64Result = Buffer.from(response.data).toString('base64');
    } else {
      // For React Native, use base64 encoding method
      base64Result = btoa(
        new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    }

    const fileUri = `data:image/png;base64,${base64Result}`;

    return fileUri;
  } catch (error) {
    logError('Remove.bg Background Removal', error);
    throw error;
  }
}

// Utility function to check API credentials
function checkRemoveBgApiCredentials() {
  if (!REMOVE_BG_API_KEY) {
    Alert.alert(
      'API Configuration Error',
      'Remove.bg API key is missing. Please configure it in your environment variables.'
    );
  }
}

// Check credentials on module load
checkRemoveBgApiCredentials();