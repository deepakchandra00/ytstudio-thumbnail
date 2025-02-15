/**
 * Convert hex color to RGB array
 * @param {string} hex - Hex color code
 * @returns {number[]} RGB color array
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  };
  
  /**
   * Convert RGB values to hex color
   * @param {number} r - Red value
   * @param {number} g - Green value
   * @param {number} b - Blue value
   * @returns {string} Hex color code
   */
  export const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  /**
   * Interpolate between two colors
   * @param {string} color1 - Starting hex color
   * @param {string} color2 - Ending hex color
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {string} Interpolated hex color
   */
  export const interpolateColor = (color1, color2, factor) => {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    const result = rgb1.map((channel, index) => 
      Math.round(channel + factor * (rgb2[index] - channel))
    );
    
    return rgbToHex(...result);
  };

  /**
   * Color palette for text and design elements
   */
  export const COLOR_PALETTE = {
    primary: '#2196F3',   // Material Blue
    secondary: '#9C27B0', // Material Purple
    accent: '#FF5722',    // Material Deep Orange
    text: {
      dark: '#212121',    // Very Dark Grey (almost black)
      light: '#FFFFFF',   // White
      muted: '#757575',   // Medium Grey
    },
    background: {
      light: '#F5F5F5',  // Light Grey
      dark: '#E0E0E0',   // Medium Light Grey
    }
  };

  /**
   * Generate a color scheme based on a primary color
   * @param {string} baseColor - Hex color code
   * @returns {Object} Color scheme with variants
   */
  export const generateColorScheme = (baseColor) => {
    return {
      base: baseColor,
      light: interpolateColor(baseColor, COLOR_PALETTE.text.light, 0.7),
      dark: interpolateColor(baseColor, COLOR_PALETTE.text.dark, 0.7),
      muted: interpolateColor(baseColor, COLOR_PALETTE.text.muted, 0.5)
    };
  };

  /**
   * Check if a color is light or dark
   * @param {string} hex - Hex color code
   * @returns {string} 'light' or 'dark'
   */
  export const getColorBrightness = (hex) => {
    const [r, g, b] = hexToRgb(hex);
    // Using the luminance formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 125 ? 'light' : 'dark';
  };

  /**
   * Get contrasting text color for a background
   * @param {string} backgroundColor - Hex color code
   * @returns {string} Contrasting text color (black or white)
   */
  export const getContrastingTextColor = (backgroundColor) => {
    return getColorBrightness(backgroundColor) === 'light' 
      ? COLOR_PALETTE.text.dark 
      : COLOR_PALETTE.text.light;
  };

  /**
   * Validate and normalize hex color
   * @param {string} color - Input color
   * @returns {string} Normalized hex color
   */
  export const normalizeColor = (color) => {
    // Ensure color starts with #
    const hexColor = color.startsWith('#') ? color : `#${color}`;
    
    // Validate hex color
    const validHexRegex = /^#([0-9A-F]{3}){1,2}$/i;
    return validHexRegex.test(hexColor) ? hexColor : COLOR_PALETTE.text.dark;
  };