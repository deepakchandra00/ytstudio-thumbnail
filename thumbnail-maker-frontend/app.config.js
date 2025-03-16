export default {
  expo: {
    name: "YouTube Thumbnail Maker",
    slug: "youtube-thumbnail-maker",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#6200ee"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      newArchEnabled: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#6200ee"
      },
      "package": "com.deepak.youtubethumbnailmaker",
      newArchEnabled: true
    },
    extra: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
      "eas": {
        "projectId": "0344fe21-07ff-4ea6-a490-ff16f1ae62fa"
      }
    },
    plugins: [
      "expo-image-picker"
    ]
  }
}; 