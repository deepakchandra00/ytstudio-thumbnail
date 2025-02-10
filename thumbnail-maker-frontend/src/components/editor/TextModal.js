import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, TextInput, Button, Menu, IconButton } from 'react-native-paper';
import { FONTS, COLORS, TEXT_STYLES, TEXT_ALIGNMENTS, INITIAL_TEXT_SIZE } from '../../constants/editorConstants';

const TextModal = ({
  visible,
  onDismiss,
  textInput,
  onTextChange,
  selectedFont,
  selectedColor,
  selectedSize,
  selectedFontStyle,
  selectedAlignment,
  onFontSelect,
  onColorSelect,
  onSizeChange,
  onFontStyleSelect,
  onAlignmentSelect,
  onAddText,
  fontMenuVisible,
  colorMenuVisible,
  setFontMenuVisible,
  setColorMenuVisible,
}) => (
  <Portal>
    <Modal
      visible={visible}
      onDismiss={onDismiss}
      contentContainerStyle={styles.modalContent}
    >
      <TextInput
        value={textInput}
        onChangeText={onTextChange}
        placeholder="Enter text"
        style={styles.textInput}
        multiline
      />
      
      <View style={styles.textControlsGrid}>
        {/* Font and Color Selection */}
        <View style={styles.textControlRow}>
          <Menu
            visible={fontMenuVisible}
            onDismiss={() => setFontMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined" 
                icon="format-font"
                onPress={() => setFontMenuVisible(true)}
              >
                {selectedFont}
              </Button>
            }
          >
            {FONTS.map((font) => (
              <Menu.Item
                key={font}
                onPress={() => {
                  onFontSelect(font);
                  setFontMenuVisible(false);
                }}
                title={font}
              />
            ))}
          </Menu>

          <Menu
            visible={colorMenuVisible}
            onDismiss={() => setColorMenuVisible(false)}
            anchor={
              <Button 
                mode="outlined"
                icon="palette"
                onPress={() => setColorMenuVisible(true)}
                style={{ backgroundColor: selectedColor }}
                labelStyle={{ color: selectedColor === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
              >
                Color
              </Button>
            }
          >
            {COLORS.map((color) => (
              <Menu.Item
                key={color.value}
                onPress={() => {
                  onColorSelect(color.value);
                  setColorMenuVisible(false);
                }}
                title={color.name}
                style={{ backgroundColor: color.value }}
                titleStyle={{ color: color.value === '#FFFFFF' ? '#000000' : '#FFFFFF' }}
              />
            ))}
          </Menu>
        </View>

        {/* Font Styles */}
        <View style={styles.textControlRow}>
          {TEXT_STYLES.map((style) => (
            <IconButton
              key={style.value}
              icon={style.value === 'normal' ? 'format-text' : `format-${style.value}`}
              mode={selectedFontStyle === style.value ? "contained" : "outlined"}
              onPress={() => onFontStyleSelect(style.value)}
            />
          ))}
        </View>

        {/* Text Alignment */}
        <View style={styles.textControlRow}>
          {TEXT_ALIGNMENTS.map((align) => (
            <IconButton
              key={align.value}
              icon={align.icon}
              mode={selectedAlignment === align.value ? "contained" : "outlined"}
              onPress={() => onAlignmentSelect(align.value)}
            />
          ))}
        </View>

        {/* Font Size Controls */}
        <View style={styles.sizeControlRow}>
          <IconButton
            icon="minus"
            onPress={() => onSizeChange(Math.max(12, selectedSize - 4).toString())}
          />
          <TextInput
            value={selectedSize.toString()}
            onChangeText={onSizeChange}
            keyboardType="number-pad"
            style={styles.sizeInput}
          />
          <IconButton
            icon="plus"
            onPress={() => onSizeChange((selectedSize + 4).toString())}
          />
        </View>
      </View>

      <Button 
        mode="contained" 
        onPress={onAddText}
        style={styles.addButton}
      >
        Add Text
      </Button>
    </Modal>
  </Portal>
);

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  textInput: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  textControlsGrid: {
    gap: 16,
    marginBottom: 16,
  },
  textControlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 8,
  },
  sizeControlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  sizeInput: {
    width: 60,
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
  },
  addButton: {
    marginTop: 8,
  },
});

export default TextModal; 