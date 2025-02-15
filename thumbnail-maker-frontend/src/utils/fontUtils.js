import * as Font from 'expo-font';
import {
  Inter_400Regular, Inter_700Bold,
  Roboto_400Regular, Roboto_700Bold,
  OpenSans_400Regular, OpenSans_700Bold,
  Montserrat_400Regular, Montserrat_700Bold,
  Nunito_400Regular, Nunito_700Bold,
  Lato_400Regular, Lato_700Bold,
  Phudu_300Light, Phudu_400Regular, Phudu_500Medium, Phudu_600SemiBold, Phudu_700Bold, Phudu_800ExtraBold, Phudu_900Black,
  GajrajOne_400Regular,
  Labrada_100Thin, Labrada_200ExtraLight, Labrada_300Light, Labrada_400Regular, Labrada_500Medium, 
  Labrada_600SemiBold, Labrada_700Bold, Labrada_800ExtraBold, Labrada_900Black,
  Labrada_100Thin_Italic, Labrada_200ExtraLight_Italic, Labrada_300Light_Italic, 
  Labrada_400Regular_Italic, Labrada_500Medium_Italic, Labrada_600SemiBold_Italic, 
  Labrada_700Bold_Italic, Labrada_800ExtraBold_Italic, Labrada_900Black_Italic,
  ShantellSans_300Light, ShantellSans_400Regular, ShantellSans_500Medium, 
  ShantellSans_600SemiBold, ShantellSans_700Bold, ShantellSans_800ExtraBold,
  ShantellSans_300Light_Italic, ShantellSans_400Regular_Italic, 
  ShantellSans_500Medium_Italic, ShantellSans_600SemiBold_Italic, 
  ShantellSans_700Bold_Italic, ShantellSans_800ExtraBold_Italic,
  Gloock_400Regular,
  Mynerve_400Regular,
  Solitreo_400Regular,
  PadyakkeExpandedOne_400Regular,
  MartianMono_100Thin, MartianMono_200ExtraLight, MartianMono_300Light, 
  MartianMono_400Regular, MartianMono_500Medium, MartianMono_600SemiBold, 
  MartianMono_700Bold, MartianMono_800ExtraBold,
  Rubik80sFade_400Regular,
  RubikGemstones_400Regular,
  RubikSprayPaint_400Regular,
  RubikStorm_400Regular,
  RubikVinyl_400Regular,
  SofiaSansCondensed_100Thin, SofiaSansCondensed_200ExtraLight, 
  SofiaSansCondensed_300Light, SofiaSansCondensed_400Regular, 
  SofiaSansCondensed_500Medium, SofiaSansCondensed_600SemiBold, 
  SofiaSansCondensed_700Bold, SofiaSansCondensed_800ExtraBold, 
  SofiaSansCondensed_900Black,
  SofiaSansCondensed_100Thin_Italic, SofiaSansCondensed_200ExtraLight_Italic, 
  SofiaSansCondensed_300Light_Italic, SofiaSansCondensed_400Regular_Italic, 
  SofiaSansCondensed_500Medium_Italic, SofiaSansCondensed_600SemiBold_Italic, 
  SofiaSansCondensed_700Bold_Italic, SofiaSansCondensed_800ExtraBold_Italic, 
  SofiaSansCondensed_900Black_Italic
} from '@expo-google-fonts/dev';

export const FONT_MAP = {
  'Inter_400Regular': Inter_400Regular,
  'Inter_700Bold': Inter_700Bold,
  'Roboto_400Regular': Roboto_400Regular,
  'Roboto_700Bold': Roboto_700Bold,
  'OpenSans_400Regular': OpenSans_400Regular,
  'OpenSans_700Bold': OpenSans_700Bold,
  'Montserrat_400Regular': Montserrat_400Regular,
  'Montserrat_700Bold': Montserrat_700Bold,
  'Nunito_400Regular': Nunito_400Regular,
  'Nunito_700Bold': Nunito_700Bold,
  'Lato_400Regular': Lato_400Regular,
  'Lato_700Bold': Lato_700Bold,
  'Phudu_300Light': Phudu_300Light,
  'Phudu_400Regular': Phudu_400Regular,
  'Phudu_500Medium': Phudu_500Medium,
  'Phudu_600SemiBold': Phudu_600SemiBold,
  'Phudu_700Bold': Phudu_700Bold,
  'Phudu_800ExtraBold': Phudu_800ExtraBold,
  'Phudu_900Black': Phudu_900Black,
  'GajrajOne_400Regular': GajrajOne_400Regular,
  'Gloock_400Regular': Gloock_400Regular,
  'Mynerve_400Regular': Mynerve_400Regular,
  'Solitreo_400Regular': Solitreo_400Regular,
  'PadyakkeExpandedOne_400Regular': PadyakkeExpandedOne_400Regular,
  'Labrada_100Thin': Labrada_100Thin,
  'Labrada_200ExtraLight': Labrada_200ExtraLight,
  'Labrada_300Light': Labrada_300Light,
  'Labrada_400Regular': Labrada_400Regular,
  'Labrada_500Medium': Labrada_500Medium,
  'Labrada_600SemiBold': Labrada_600SemiBold,
  'Labrada_700Bold': Labrada_700Bold,
  'Labrada_800ExtraBold': Labrada_800ExtraBold,
  'Labrada_900Black': Labrada_900Black,
  'Labrada_100Thin_Italic': Labrada_100Thin_Italic,
  'Labrada_200ExtraLight_Italic': Labrada_200ExtraLight_Italic,
  'Labrada_300Light_Italic': Labrada_300Light_Italic,
  'Labrada_400Regular_Italic': Labrada_400Regular_Italic,
  'Labrada_500Medium_Italic': Labrada_500Medium_Italic,
  'Labrada_600SemiBold_Italic': Labrada_600SemiBold_Italic,
  'Labrada_700Bold_Italic': Labrada_700Bold_Italic,
  'Labrada_800ExtraBold_Italic': Labrada_800ExtraBold_Italic,
  'Labrada_900Black_Italic': Labrada_900Black_Italic,
  'ShantellSans_300Light': ShantellSans_300Light,
  'ShantellSans_400Regular': ShantellSans_400Regular,
  'ShantellSans_500Medium': ShantellSans_500Medium,
  'ShantellSans_600SemiBold': ShantellSans_600SemiBold,
  'ShantellSans_700Bold': ShantellSans_700Bold,
  'ShantellSans_800ExtraBold': ShantellSans_800ExtraBold,
  'ShantellSans_300Light_Italic': ShantellSans_300Light_Italic,
  'ShantellSans_400Regular_Italic': ShantellSans_400Regular_Italic,
  'ShantellSans_500Medium_Italic': ShantellSans_500Medium_Italic,
  'ShantellSans_600SemiBold_Italic': ShantellSans_600SemiBold_Italic,
  'ShantellSans_700Bold_Italic': ShantellSans_700Bold_Italic,
  'ShantellSans_800ExtraBold_Italic': ShantellSans_800ExtraBold_Italic,
  'MartianMono_100Thin': MartianMono_100Thin,
  'MartianMono_200ExtraLight': MartianMono_200ExtraLight,
  'MartianMono_300Light': MartianMono_300Light,
  'MartianMono_400Regular': MartianMono_400Regular,
  'MartianMono_500Medium': MartianMono_500Medium,
  'MartianMono_600SemiBold': MartianMono_600SemiBold,
  'MartianMono_700Bold': MartianMono_700Bold,
  'MartianMono_800ExtraBold': MartianMono_800ExtraBold,
  'Rubik80sFade_400Regular': Rubik80sFade_400Regular,
  'RubikGemstones_400Regular': RubikGemstones_400Regular,
  'RubikSprayPaint_400Regular': RubikSprayPaint_400Regular,
  'RubikStorm_400Regular': RubikStorm_400Regular,
  'RubikVinyl_400Regular': RubikVinyl_400Regular,
  'SofiaSansCondensed_100Thin': SofiaSansCondensed_100Thin,
  'SofiaSansCondensed_200ExtraLight': SofiaSansCondensed_200ExtraLight,
  'SofiaSansCondensed_300Light': SofiaSansCondensed_300Light,
  'SofiaSansCondensed_400Regular': SofiaSansCondensed_400Regular,
  'SofiaSansCondensed_500Medium': SofiaSansCondensed_500Medium,
  'SofiaSansCondensed_600SemiBold': SofiaSansCondensed_600SemiBold,
  'SofiaSansCondensed_700Bold': SofiaSansCondensed_700Bold,
  'SofiaSansCondensed_800ExtraBold': SofiaSansCondensed_800ExtraBold,
  'SofiaSansCondensed_900Black': SofiaSansCondensed_900Black,
  'SofiaSansCondensed_100Thin_Italic': SofiaSansCondensed_100Thin_Italic,
  'SofiaSansCondensed_200ExtraLight_Italic': SofiaSansCondensed_200ExtraLight_Italic,
  'SofiaSansCondensed_300Light_Italic': SofiaSansCondensed_300Light_Italic,
  'SofiaSansCondensed_400Regular_Italic': SofiaSansCondensed_400Regular_Italic,
  'SofiaSansCondensed_500Medium_Italic': SofiaSansCondensed_500Medium_Italic,
  'SofiaSansCondensed_600SemiBold_Italic': SofiaSansCondensed_600SemiBold_Italic,
  'SofiaSansCondensed_700Bold_Italic': SofiaSansCondensed_700Bold_Italic,
  'SofiaSansCondensed_800ExtraBold_Italic': SofiaSansCondensed_800ExtraBold_Italic,
  'SofiaSansCondensed_900Black_Italic': SofiaSansCondensed_900Black_Italic
};

export const FONT_CONFIG = {
  Inter: {
    name: 'Inter',
    regular: 'Inter_400Regular',
    bold: 'Inter_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  Roboto: {
    name: 'Roboto',
    regular: 'Roboto_400Regular',
    bold: 'Roboto_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  OpenSans: {
    name: 'Open Sans',
    regular: 'OpenSans_400Regular',
    bold: 'OpenSans_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  Montserrat: {
    name: 'Montserrat',
    regular: 'Montserrat_400Regular',
    bold: 'Montserrat_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal']
  },
  Nunito: {
    name: 'Nunito',
    regular: 'Nunito_400Regular',
    bold: 'Nunito_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  Lato: {
    name: 'Lato',
    regular: 'Lato_400Regular',
    bold: 'Lato_700Bold',
    category: 'sans-serif',
    weights: [400, 700],
    styles: ['normal', 'italic']
  },
  Phudu: {
    name: 'Phudu',
    regular: 'Phudu_400Regular',
    bold: 'Phudu_700Bold',
    category: 'display',
    weights: [300, 400, 500, 600, 700, 800, 900],
    styles: ['normal']
  },
  GajrajOne: {
    name: 'Gajraj One',
    regular: 'GajrajOne_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  Gloock: {
    name: 'Gloock',
    regular: 'Gloock_400Regular',
    category: 'serif',
    weights: [400],
    styles: ['normal']
  },
  Mynerve: {
    name: 'Mynerve',
    regular: 'Mynerve_400Regular',
    category: 'handwriting',
    weights: [400],
    styles: ['normal']
  },
  Solitreo: {
    name: 'Solitreo',
    regular: 'Solitreo_400Regular',
    category: 'handwriting',
    weights: [400],
    styles: ['normal']
  },
  PadyakkeExpandedOne: {
    name: 'Padyakke Expanded One',
    regular: 'PadyakkeExpandedOne_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  Labrada: {
    name: 'Labrada',
    regular: 'Labrada_400Regular',
    bold: 'Labrada_700Bold',
    category: 'serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic']
  },
  ShantellSans: {
    name: 'Shantell Sans',
    regular: 'ShantellSans_400Regular',
    bold: 'ShantellSans_700Bold',
    category: 'handwriting',
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic']
  },
  MartianMono: {
    name: 'Martian Mono',
    regular: 'MartianMono_400Regular',
    bold: 'MartianMono_700Bold',
    category: 'monospace',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    styles: ['normal']
  },
  Rubik80sFade: {
    name: 'Rubik 80s Fade',
    regular: 'Rubik80sFade_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  RubikGemstones: {
    name: 'Rubik Gemstones',
    regular: 'RubikGemstones_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  RubikSprayPaint: {
    name: 'Rubik Spray Paint',
    regular: 'RubikSprayPaint_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  RubikStorm: {
    name: 'Rubik Storm',
    regular: 'RubikStorm_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  RubikVinyl: {
    name: 'Rubik Vinyl',
    regular: 'RubikVinyl_400Regular',
    category: 'display',
    weights: [400],
    styles: ['normal']
  },
  SofiaSansCondensed: {
    name: 'Sofia Sans Condensed',
    regular: 'SofiaSansCondensed_400Regular',
    bold: 'SofiaSansCondensed_700Bold',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic']
  }
};

export const getFontVariant = (fontName, style = 'normal', weight = 400) => {
  const fontInfo = FONT_CONFIG[fontName];
  if (!fontInfo) return FONT_CONFIG.Inter.regular;

  const validStyle = fontInfo.styles.includes(style) ? style : 'normal';
  const validWeight = fontInfo.weights.includes(weight) ? weight : 400;

  if (validWeight === 700 && validStyle === 'italic') {
    return fontInfo.bold.replace('Bold', 'BoldItalic') || fontInfo.bold;
  }
  return validWeight === 700 ? fontInfo.bold : 
         validStyle === 'italic' ? fontInfo.regular.replace('Regular', 'Italic') : 
         fontInfo.regular;
};

export const getFontPairings = () => {
  return {
    headings: ['Montserrat', 'Inter'],
    body: ['Open Sans', 'Roboto'],
    accent: ['Nunito', 'Lato'],
    display: ['Phudu', 'GajrajOne', 'PadyakkeExpandedOne', 'Rubik80sFade', 'RubikGemstones', 'RubikSprayPaint', 'RubikStorm', 'RubikVinyl'],
    serif: ['Labrada', 'Gloock'],
    handwriting: ['ShantellSans', 'Mynerve', 'Solitreo'],
    monospace: ['MartianMono']
  };
};

export const loadFont = async (fontName) => {
  try {
    await Font.loadAsync({
      [fontName]: FONT_MAP[fontName]
    });
    return true;
  } catch (error) {
    console.error(`Failed to load font ${fontName}:`, error);
    return false;
  }
};

export const loadFonts = async (fontNames) => {
  return Promise.all(fontNames.map(loadFont));
};