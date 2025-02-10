const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add this to handle Skia properly
config.resolver.assetExts.push('skia');

module.exports = config; 