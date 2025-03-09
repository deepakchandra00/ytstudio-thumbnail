import Constants from 'expo-constants';

const ENV = {
  dev: {
    apiUrl: 'http://192.168.29.40:5001/api',
    authApiUrl: 'http://192.168.29.40:5001/api/auth',
    PIXIAN_API_KEY: 'your_api_key_here',
    cloudinary: {
      cloudName: 'your_cloud_name',
      apiKey: 'your_api_key',
      apiSecret: 'your_api_secret',
    },
  },
  prod: {
    apiUrl: 'https://your-production-api.com/api',
    authApiUrl: 'https://your-production-api.com/api/auth',
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

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export default getEnvVars;