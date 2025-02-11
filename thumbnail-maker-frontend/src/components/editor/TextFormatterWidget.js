import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { 
  Text, 
  IconButton, 
  Colors, 
  Portal, 
  Modal, 
  Button,
  Chip
} from 'react-native-paper';

const FONT_FAMILIES = [
  'Arial', 
  'Helvetica', 
  'Times New Roman', 
  'Courier', 
  'Verdana'
];

const TEXT_EFFECTS = [
  { name: 'Bold', icon: 'format-bold' },
  { name: 'Italic', icon: 'format-italic' },
  { name: 'Underline', icon: 'format-underline' },
  { name: 'Strikethrough', icon: 'format-strikethrough' }
];

const TEXT_ALIGNMENTS = [
  { name: 'Left', icon: 'format-align-left' },
  { name: 'Center', icon: 'format-align-center' },
  { name: 'Right', icon: 'format-align-right' }
];

const TextFormatterWidget = ({ 
  selectedElement, 
  onUpdateTextStyle 
}) => {
  const [isColorPickerVisible, setColorPickerVisible] = useState(false);
  const [textStyle, setTextStyle] = useState({
    color: selectedElement.color || '#000000',
    fontSize: selectedElement.size || 16,
    fontFamily: selectedElement.fontFamily || 'Arial',
    textAlign: selectedElement.textAlign || 'left',
    effects: selectedElement.effects || []
  });

  const handleColorChange = (color) => {
    const newStyle = { ...textStyle, color };
    setTextStyle(newStyle);
    onUpdateTextStyle(newStyle);
    setColorPickerVisible(false);
  };

  const toggleEffect = (effect) => {
    const newEffects = textStyle.effects.includes(effect)
      ? textStyle.effects.filter(e => e !== effect)
      : [...textStyle.effects, effect];
    
    const newStyle = { ...textStyle, effects: newEffects };
    setTextStyle(newStyle);
    onUpdateTextStyle(newStyle);
  };

  const handleAlignmentChange = (alignment) => {
    const newStyle = { ...textStyle, textAlign: alignment };
    setTextStyle(newStyle);
    onUpdateTextStyle(newStyle);
  };

  const handleFontFamilyChange = (fontFamily) => {
    const newStyle = { ...textStyle, fontFamily };
    setTextStyle(newStyle);
    onUpdateTextStyle(newStyle);
  };

  const handleFontSizeChange = (increase) => {
    const newFontSize = increase 
      ? Math.min(textStyle.fontSize + 2, 72)
      : Math.max(textStyle.fontSize - 2, 8);
    
    const newStyle = { ...textStyle, fontSize: newFontSize };
    setTextStyle(newStyle);
    onUpdateTextStyle(newStyle);
  };

  return (
    <View style={styles.container}>
      {/* Color Picker */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Text Color</Text>
        <View style={styles.colorSection}>
          <IconButton
            icon="palette"
            color={textStyle.color}
            size={30}
            onPress={() => setColorPickerVisible(true)}
          />
          <Chip 
            mode="outlined" 
            style={{ backgroundColor: textStyle.color }}
          >
            {textStyle.color}
          </Chip>
        </View>
      </View>
      
      {/* Font Size */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Font Size: {textStyle.fontSize.toFixed(0)}</Text>
        <View style={styles.fontSizeContainer}>
          <IconButton
            icon="minus"
            onPress={() => handleFontSizeChange(false)}
          />
          <Text>{textStyle.fontSize.toFixed(0)}</Text>
          <IconButton
            icon="plus"
            onPress={() => handleFontSizeChange(true)}
          />
        </View>
      </View>

      {/* Text Effects */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Text Effects</Text>
        <View style={styles.iconContainer}>
          {TEXT_EFFECTS.map((effect) => (
            <IconButton
              key={effect.name}
              icon={effect.icon}
              color={textStyle.effects.includes(effect.name) 
                ? Colors.blue500 
                : Colors.grey500}
              size={24}
              onPress={() => toggleEffect(effect.name)}
            />
          ))}
        </View>
      </View>

      {/* Text Alignment */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Alignment</Text>
        <View style={styles.iconContainer}>
          {TEXT_ALIGNMENTS.map((alignment) => (
            <IconButton
              key={alignment.name}
              icon={alignment.icon}
              color={textStyle.textAlign === alignment.name.toLowerCase() 
                ? Colors.blue500 
                : Colors.grey500}
              size={24}
              onPress={() => handleAlignmentChange(alignment.name.toLowerCase())}
            />
          ))}
        </View>
      </View>

      {/* Font Family */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Font Family</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
        >
          {FONT_FAMILIES.map((font) => (
            <Button
              key={font}
              mode={textStyle.fontFamily === font ? 'contained' : 'outlined'}
              style={styles.fontButton}
              onPress={() => handleFontFamilyChange(font)}
            >
              {font}
            </Button>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
  },
  sectionContainer: {
    marginVertical: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  colorSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontButton: {
    marginHorizontal: 5,
  },
});

export default TextFormatterWidget;