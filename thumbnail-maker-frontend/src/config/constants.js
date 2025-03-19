import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'https://thumbnail-maker-one.vercel.app/api',
    authApiUrl: 'https://thumbnail-maker-one.vercel.app/api/auth',
    PIXIAN_API_KEY: 'your_api_key_here',
    cloudinary: {
      cloudName: 'your_cloud_name',
      apiKey: 'your_api_key',
      apiSecret: 'your_api_secret',
    },
  },
  prod: {
    apiUrl: 'https://thumbnail-maker-one.vercel.app/api',
    authApiUrl: 'https://thumbnail-maker-one.vercel.app/api/auth',
    cloudinary: {
      cloudName: Constants.expoConfig.extra?.cloudinaryCloudName,
      apiKey: Constants.expoConfig.extra?.cloudinaryApiKey,
      apiSecret: Constants.expoConfig.extra?.cloudinaryApiSecret,
    },
  },
};

const getEnvVars = () => {
  if (__DEV__) {
    return ENV.dev;
  }
  return ENV.prod;
};

export const API_URL = process.env.REACT_APP_API_URL || 'https://thumbnail-maker-one.vercel.app/api';

export default getEnvVars;