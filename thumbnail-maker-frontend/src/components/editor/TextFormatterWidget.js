import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { 
  Text, 
  IconButton, 
  Button,
  Menu,
  Modal,
  Portal,
  TextInput
} from 'react-native-paper';
import WheelColorPicker from 'react-native-wheel-color-picker';

// Import utility functions
import { 
  COLOR_PALETTE, 
  normalizeColor 
} from '../../utils/colorUtils';
import { 
  FONT_MAP,
  getFontVariant 
} from '../../utils/fontUtils';

// Import editor store
import { useEditorStore } from '../../store';

// Use color palette from colorUtils
const Colors = {
  grey500: COLOR_PALETTE.text.muted,
  blue500: COLOR_PALETTE.primary,
  background: COLOR_PALETTE.background.light,
  surface: COLOR_PALETTE.text.light,
  accent: COLOR_PALETTE.accent,
  text: {
    dark: COLOR_PALETTE.text.dark,
    light: COLOR_PALETTE.text.light
  }
};

// Use font variants from fontUtils
const FONT_FAMILIES = Object.keys(FONT_MAP)
  .filter(font => font.includes('_400Regular'))
  .map(font => font.replace('_400Regular', ''));

// Text styling effects
const TEXT_EFFECTS = [
  { name: 'Bold', icon: 'format-bold', style: 'fontWeight' },
  { name: 'Italic', icon: 'format-italic', style: 'fontStyle' },
  { name: 'Underline', icon: 'format-underline', style: 'textDecorationLine' },
  { name: 'Strikethrough', icon: 'format-strikethrough', style: 'textDecorationLine' }
];

// Text alignment options
const TEXT_ALIGNMENTS = [
  { name: 'Left', icon: 'format-align-left' },
  { name: 'Center', icon: 'format-align-center' },
  { name: 'Right', icon: 'format-align-right' }
];

const TextFormatterWidget = ({ 
  selectedElement, 
  onUpdateTextStyle 
}) => {
  // Get updateElement from store
  const { updateElement } = useEditorStore();

  // State management
  const [isFontMenuVisible, setFontMenuVisible] = useState(false);
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [textStyle, setTextStyle] = useState({
    color: normalizeColor(selectedElement.color || COLOR_PALETTE.text.dark),
    fontSize: selectedElement.size || 16,
    fontFamily: getFontVariant(
      selectedElement.fontName || 'Inter', 
      selectedElement.fontStyle || 'normal', 
      selectedElement.fontWeight || 400
    ),
    effects: selectedElement.effects || [],
    textAlign: selectedElement.textAlign || 'left'
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editableText, setEditableText] = useState(selectedElement.content || '');

  // Update text style and notify parent
  const handleStyleChange = (newStyleProps) => {
    console.log('handleStyleChange called with:', newStyleProps);
    console.log('Current selectedElement:', selectedElement);
    
    const updatedStyle = { ...textStyle, ...newStyleProps };
    setTextStyle(updatedStyle);
    
    // Ensure we're using the correct element ID
    if (selectedElement && selectedElement.id) {
      console.log('Updating element with ID:', selectedElement.id);

      // Determine text decoration based on effects
      const textDecorationLine = updatedStyle.effects.includes('Underline') ? 'underline' : 
                                  updatedStyle.effects.includes('Strikethrough') ? 'line-through' : 
                                  'none';

      const updatePayload = {
        color: updatedStyle.color, 
        size: updatedStyle.fontSize,
        fontName: updatedStyle.fontFamily,
        fontStyle: updatedStyle.effects.includes('Italic') ? 'italic' : 'normal',
        fontWeight: updatedStyle.effects.includes('Bold') ? 'bold' : 'normal',
        textAlign: updatedStyle.textAlign,
        textDecorationLine: textDecorationLine,
        effects: updatedStyle.effects, // Keep full effects array
        content: newStyleProps.content || selectedElement.content // Ensure content is always included
      };

      console.log('Update payload:', updatePayload);

      // Update element in store using the correct ID
      updateElement(selectedElement.id, updatePayload);

      // Call parent update method with specific properties
      if (onUpdateTextStyle) {
        onUpdateTextStyle(selectedElement.id, updatePayload);
      }
    } else {
      console.error('No selected element or missing ID');
    }
  };

  // Toggle text styling effects (bold, italic, etc.)
  const toggleEffect = (effectName) => {
    const currentEffects = textStyle.effects || [];
    const updatedEffects = currentEffects.includes(effectName)
      ? currentEffects.filter(effect => effect !== effectName)
      : [...currentEffects, effectName];
    
    handleStyleChange({ effects: updatedEffects });
  };

  // Change text alignment
  const handleAlignmentChange = (alignment) => {
    handleStyleChange({ textAlign: alignment });
  };

  // Change font family
  const handleFontChange = (fontName) => {
    const newFontVariant = getFontVariant(
      fontName, 
      textStyle.fontStyle || 'normal', 
      textStyle.fontWeight || 400
    );
    handleStyleChange({ 
      fontFamily: newFontVariant,
      fontName: fontName 
    });
  };

  // Toggle color picker visibility
  const toggleColorPicker = () => {
    setIsColorPickerVisible(!isColorPickerVisible);
  };

  // Handle color change without closing
  const handleColorChange = (color) => {
    const hexColor = normalizeColor(color.hex || color);
    handleStyleChange({ color: hexColor });
  };

  // Close color picker
  const closeColorPicker = () => {
    setIsColorPickerVisible(false);
  };

  // Adjust font size
  const handleFontSizeChange = (increase) => {
    const newFontSize = increase 
      ? Math.min(textStyle.fontSize + 2, 72)
      : Math.max(textStyle.fontSize - 2, 8);
    handleStyleChange({ fontSize: newFontSize });
  };

  // Add new method to handle edit modal
  const openEditModal = () => {
    setEditableText(selectedElement.content || '');
    setIsEditModalVisible(true);
  };

  const saveEditedText = () => {
    // Update text content
    handleStyleChange({ content: editableText });
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* Add Edit Icon */}
        <View style={styles.sectionContainer}>
          <IconButton
            icon="pencil"
            color={Colors.blue500}
            size={20}
            onPress={openEditModal}
            style={styles.iconButton}
          />

          {/* Text Effects Buttons */}
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

          {/* Text Alignment Buttons */}
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

          {/* Font Family Selection with Menu */}
          <View style={styles.sectionContainer}>
            <Menu
              visible={isFontMenuVisible}
              onDismiss={() => setFontMenuVisible(false)}
              anchor={
                <Button 
                  onPress={() => setFontMenuVisible(true)}
                  style={styles.fontMenuButton}
                >
                  {textStyle.fontFamily.replace('_400Regular', '')}
                </Button>
              }
            >
              {FONT_FAMILIES.map((font) => (
                <Menu.Item
                  key={font}
                  onPress={() => {
                    handleFontChange(font);
                    setFontMenuVisible(false);
                  }}
                  title={font}
                  style={
                    textStyle.fontFamily.startsWith(font) 
                      ? styles.selectedFontMenuItem 
                      : {}
                  }
                />
              ))}
            </Menu>
          </View>

          {/* Color and Size */}
          <View style={styles.sectionContainer}>
            <IconButton
              icon="palette"
              color={textStyle.color}
              onPress={toggleColorPicker}
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
        </View>
      </ScrollView>

      {/* Inline Color Picker */}
      {isColorPickerVisible && (
        <View style={styles.colorPickerContainer}>
          <WheelColorPicker
            color={textStyle.color}
            onColorChange={handleColorChange}
            thumbSize={20}
            sliderSize={20}
            noSnap={true}
            row={false}
            style={styles.wheelColorPicker}
          />
          <Button 
            mode="contained" 
            onPress={closeColorPicker}
            style={styles.colorPickerCloseButton}
          >
            Close
          </Button>
        </View>
      )}

      {/* Edit Modal */}
      <Portal>
        <Modal 
          visible={isEditModalVisible} 
          onDismiss={() => setIsEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <TextInput
            label="Edit Text"
            value={editableText}
            onChangeText={setEditableText}
            multiline
            style={styles.editTextInput}
          />
          <Button 
            mode="contained" 
            onPress={saveEditedText}
            style={styles.saveButton}
          >
            Save
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
  fontMenuButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.grey500,
  },
  selectedFontMenuItem: {
    backgroundColor: Colors.accent,
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
  colorPickerContainer: {
    position: 'absolute',
    bottom: 70,
    left: 10,
    right: 10,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    elevation: 3,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  wheelColorPicker: {
    width: '100%',
    height: 200,
  },
  colorPickerCloseButton: {
    marginTop: 10,
  },
  modalContainer: {
    backgroundColor: 'white', 
    padding: 20, 
    margin: 20, 
    borderRadius: 10
  },
  editTextInput: {
    marginBottom: 15,
    minHeight: 100
  },
  saveButton: {
    marginTop: 10
  }
});

export default TextFormatterWidget;