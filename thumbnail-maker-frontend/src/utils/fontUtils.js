import * as Font from 'expo-font';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const GOOGLE_FONTS_API_KEY = process.env.GOOGLE_FONTS_API_KEY || 'AIzaSyDRLIWls3GhN3MWqLJnWMJPkUvta-XHsfA';

// Default to an empty object, will be dynamically populated
export const FONT_MAP = {};

export const GoogleFontsManager = {
  loadedFonts: {},
  
  async fetchGoogleFonts() {
    try {
      const response = await axios.get(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}`
      );
      return response.data.items;
    } catch (error) {
      console.error('Error fetching Google Fonts:', error);
      return [
        { family: 'Inter', variants: ['regular'] },
        { family: 'Roboto', variants: ['regular'] },
        { family: 'Open Sans', variants: ['regular'] }
      ]; // Fallback fonts
    }
  },

  async loadGoogleFont(fontFamily, variant = 'regular') {
    if (this.loadedFonts[fontFamily]) {
      return this.loadedFonts[fontFamily];
    }

    try {
      const fonts = await this.fetchGoogleFonts();
      const font = fonts.find((f) => f.family === fontFamily);
      
      if (!font) {
        console.error(`Font ${fontFamily} not found`);
        return null;
      }

      const fileUrl = font.files[variant];

      if (!fileUrl) {
        console.error('Font file URL not found.');
        return null;
      }

      const fileName = `${fontFamily.replace(/\s+/g, '-')}-${variant}.ttf`;
      const localUri = `${FileSystem.cacheDirectory}${fileName}`;

      const { uri } = await FileSystem.downloadAsync(fileUrl, localUri);

      await Font.loadAsync({
        [fontFamily]: {
          uri: uri,
          display: Font.FontDisplay.SWAP,
        },
      });

      // Update FONT_MAP dynamically
      FONT_MAP[`${fontFamily}_400Regular`] = { uri };

      this.loadedFonts[fontFamily] = fontFamily;
      return fontFamily;
    } catch (error) {
      console.error('Error downloading font:', error);
      return null;
    }
  },

  getFontVariant(fontName, style = 'normal', weight = 400) {
    // Implement font variant mapping logic
    const variantKey = `${fontName}_${weight}${style === 'italic' ? 'Italic' : ''}Regular`;
    return FONT_MAP[variantKey] ? fontName : fontName;
  },

  async getAvailableFonts() {
    const fonts = await this.fetchGoogleFonts();
    return fonts.map(font => font.family);
  },

  // Preload default fonts
  async initializeFonts() {
    await this.loadGoogleFont('Inter');
    await this.loadGoogleFont('Roboto');
  }
};

// Export methods to be used across the app
export const getFontVariant = GoogleFontsManager.getFontVariant.bind(GoogleFontsManager);

// Optional: Initialize fonts when the app starts
GoogleFontsManager.initializeFonts();