import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Dimensions 
} from 'react-native';
import { 
  Text, 
  IconButton, 
  Portal, 
  Modal, 
  Button,
  Surface,
  Chip
} from 'react-native-paper';
import { ColorPicker, fromHsv } from 'react-native-color-picker';

// Screen width for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Add local Colors definition
const Colors = {
  grey500: '#9E9E9E',
  blue500: '#2196F3',
  background: '#f5f5f5',
  surface: '#FFFFFF',
  accent: '#6200EE',
  gradientStart: '#6A11CB',
  gradientEnd: '#2575FC'
};

const FONT_FAMILIES = [
  'Arial', 
  'Helvetica', 
  'Times New Roman', 
  'Courier', 
  'Verdana'
];

const TEXT_EFFECTS = [
  { name: 'Bold', icon: 'format-bold', style: 'fontWeight' },
  { name: 'Italic', icon: 'format-italic', style: 'fontStyle' },
  { name: 'Underline', icon: 'format-underline', style: 'textDecorationLine' },
  { name: 'Strikethrough', icon: 'format-strikethrough', style: 'textDecorationLine' }
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
    effects: selectedElement.effects || [],
    textAlign: selectedElement.textAlign || 'left'
  });

  // Update text style and call onUpdateTextStyle
  const handleStyleChange = (newStyleProps) => {
    const updatedStyle = { ...textStyle, ...newStyleProps };
    setTextStyle(updatedStyle);
    
    // Call the prop function to update the element
    if (onUpdateTextStyle) {
      onUpdateTextStyle(selectedElement.id, updatedStyle);
    }
  };

  const toggleEffect = (effectName) => {
    const currentEffects = textStyle.effects || [];
    const updatedEffects = currentEffects.includes(effectName)
      ? currentEffects.filter(effect => effect !== effectName)
      : [...currentEffects, effectName];
    
    handleStyleChange({ effects: updatedEffects });
  };

  const handleAlignmentChange = (alignment) => {
    handleStyleChange({ textAlign: alignment });
  };

  const handleFontChange = (fontFamily) => {
    handleStyleChange({ fontFamily });
  };

  const handleColorChange = (color) => {
    const hexColor = fromHsv(color);
    handleStyleChange({ color: hexColor });
    setColorPickerVisible(false);
  };

  const handleFontSizeChange = (increase) => {
    const newFontSize = increase 
      ? Math.min(textStyle.fontSize + 2, 72)
      : Math.max(textStyle.fontSize - 2, 8);
    
    handleStyleChange({ fontSize: newFontSize });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Text Effects */}
        <View style={styles.sectionContainer}>
          {TEXT_EFFECTS.map((effect) => (
            <IconButton
              key={effect.name}
              icon={effect.icon}
              color={textStyle.effects.includes(effect.name) 
                ? Colors.accent 
                : Colors.grey500}
              size={20}
              onPress={() => toggleEffect(effect.name)}
              style={[
                styles.iconButton,
                textStyle.effects.includes(effect.name) && styles.activeIconButton
              ]}
            />
          ))}
        </View>

        {/* Alignment */}
        <View style={styles.sectionContainer}>
          {TEXT_ALIGNMENTS.map((alignment) => (
            <IconButton
              key={alignment.name}
              icon={alignment.icon}
              color={textStyle.textAlign === alignment.name.toLowerCase() 
                ? Colors.accent 
                : Colors.grey500}
              size={20}
              onPress={() => handleAlignmentChange(alignment.name.toLowerCase())}
              style={[
                styles.iconButton,
                textStyle.textAlign === alignment.name.toLowerCase() && styles.activeIconButton
              ]}
            />
          ))}
        </View>

        {/* Font Family */}
        <View style={styles.sectionContainer}>
          {FONT_FAMILIES.map((font) => (
            <Chip
              key={font}
              selected={textStyle.fontFamily === font}
              onPress={() => handleFontChange(font)}
              style={[
                styles.fontChip,
                textStyle.fontFamily === font && styles.selectedFontChip
              ]}
              textStyle={styles.fontChipText}
            >
              {font.substring(0, 3)}
            </Chip>
          ))}
        </View>

        {/* Color and Size */}
        <View style={styles.sectionContainer}>
          <IconButton
            icon="palette"
            color={textStyle.color}
            size={20}
            onPress={() => setColorPickerVisible(true)}
            style={styles.colorButton}
          />
          <View style={styles.fontSizeControls}>
            <IconButton
              icon="minus"
              size={16}
              onPress={() => handleFontSizeChange(false)}
            />
            <Text style={styles.fontSizeText}>{textStyle.fontSize}</Text>
            <IconButton
              icon="plus"
              size={16}
              onPress={() => handleFontSizeChange(true)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Color Picker Modal */}
      <Portal>
        <Modal 
          visible={isColorPickerVisible} 
          onDismiss={() => setColorPickerVisible(false)}
          contentContainerStyle={styles.colorPickerModal}
        >
          <ColorPicker
            onColorSelected={handleColorChange}
            style={styles.colorPicker}
            defaultColor={textStyle.color}
          />
          <Button 
            mode="contained" 
            onPress={() => setColorPickerVisible(false)}
            style={styles.colorPickerCloseButton}
          >
            Close
          </Button>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  sectionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  iconButton: {
    margin: 2,
    padding: 2,
  },
  activeIconButton: {
    backgroundColor: 'rgba(102, 0, 238, 0.1)',
  },
  fontChip: {
    marginHorizontal: 2,
    height: 30,
  },
  selectedFontChip: {
    backgroundColor: Colors.accent,
  },
  fontChipText: {
    fontSize: 10,
  },
  colorButton: {
    margin: 2,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fontSizeText: {
    fontSize: 12,
    marginHorizontal: 5,
  },
  colorPickerModal: {
    backgroundColor: Colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  colorPicker: {
    width: '100%',
    height: 300,
  },
  colorPickerCloseButton: {
    marginTop: 15,
  }
});

export default TextFormatterWidget;