import { Platform, Dimensions } from 'react-native';

export const CANVAS_PADDING = 16;
export const SCREEN_WIDTH = Dimensions.get('window').width;
export const CANVAS_WIDTH = SCREEN_WIDTH - (CANVAS_PADDING * 2);
export const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

export const FONTS = Platform.select({ 
  ios: ['Helvetica'],
  android: ['sans-serif']
});

export const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
];

export const INITIAL_TEXT_SIZE = 32;

export const TEXT_STYLES = [
  { name: 'Normal', value: 'normal' },
  { name: 'Bold', value: 'bold' },
  { name: 'Italic', value: 'italic' },
];

export const TEXT_ALIGNMENTS = [
  { name: 'Left', value: 'left', icon: 'format-align-left' },
  { name: 'Center', value: 'center', icon: 'format-align-center' },
  { name: 'Right', value: 'right', icon: 'format-align-right' },
]; 