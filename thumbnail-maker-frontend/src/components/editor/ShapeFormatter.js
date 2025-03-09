import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Surface, Portal, Modal, Text, TextInput } from 'react-native-paper';
import WheelColorPicker from 'react-native-wheel-color-picker';

const ShapeFormatter = ({
  element,
  onUpdateStyle,
  style,
}) => {
  const [isColorPickerVisible, setIsColorPickerVisible] = useState(false);
  const [isBorderColorPickerVisible, setIsBorderColorPickerVisible] = useState(false);
  const [isShadowColorPickerVisible, setIsShadowColorPickerVisible] = useState(false);
  const [showShadowControls, setShowShadowControls] = useState(false);

  const handleColorChange = (color) => {
    onUpdateStyle({ color });
  };

  const handleBorderWidthChange = (width) => {
    onUpdateStyle({ borderWidth: parseInt(width) || 0 });
  };

  const handleBorderColorChange = (borderColor) => {
    onUpdateStyle({ borderColor });
  };

  const handleBorderRadiusChange = (radius) => {
    onUpdateStyle({ borderRadius: parseInt(radius) || 0 });
  };

  const handleShadowChange = (shadowProps) => {
    onUpdateStyle({
      shadow: {
        ...element.shadow,
        ...shadowProps
      }
    });
  };

  const renderColorPicker = (visible, onClose, onColorSelect, initialColor) => (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.colorPickerContainer}>
          <WheelColorPicker
            color={initialColor || '#000000'}
            onColorChange={onColorSelect}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
          />
          <IconButton
            icon="check"
            mode="contained"
            onPress={onClose}
            style={styles.colorPickerButton}
          />
        </View>
      </Modal>
    </Portal>
  );

  return (
    <Surface style={styles.container}>
      <View style={styles.row}>
        {/* Color control */}
        <View style={styles.control}>
          <IconButton
            icon="palette"
            size={20}
            onPress={() => setIsColorPickerVisible(true)}
          />
          <Text style={styles.label}>Color</Text>
        </View>

        {/* Border controls */}
        <View style={styles.control}>
          <IconButton
            icon="border-all"
            size={20}
            onPress={() => setIsBorderColorPickerVisible(true)}
          />
          <TextInput
            style={styles.input}
            value={String(element.borderWidth || '0')}
            onChangeText={handleBorderWidthChange}
            keyboardType="numeric"
            placeholder="Width"
          />
        </View>

        {/* Border radius control */}
        <View style={styles.control}>
          <IconButton
            icon="rounded-corner"
            size={20}
          />
          <TextInput
            style={styles.input}
            value={String(element.borderRadius || '0')}
            onChangeText={handleBorderRadiusChange}
            keyboardType="numeric"
            placeholder="Radius"
          />
        </View>

        {/* Shadow toggle */}
        <View style={styles.control}>
          <IconButton
            icon={element.shadow ? "drop-shadow" : "drop-shadow-off"}
            size={20}
            onPress={() => {
              setShowShadowControls(!showShadowControls);
              if (!element.shadow) {
                handleShadowChange({
                  dx: 5,
                  dy: 5,
                  blur: 10,
                  color: 'rgba(0, 0, 0, 0.5)'
                });
              }
            }}
          />
          <Text style={styles.label}>Shadow</Text>
        </View>
      </View>

      {showShadowControls && (
        <View style={styles.shadowControls}>
          <TextInput
            style={styles.input}
            value={String(element.shadow?.dx || '5')}
            onChangeText={(value) => handleShadowChange({ dx: parseInt(value) || 0 })}
            keyboardType="numeric"
            placeholder="X"
          />
          <TextInput
            style={styles.input}
            value={String(element.shadow?.dy || '5')}
            onChangeText={(value) => handleShadowChange({ dy: parseInt(value) || 0 })}
            keyboardType="numeric"
            placeholder="Y"
          />
          <TextInput
            style={styles.input}
            value={String(element.shadow?.blur || '10')}
            onChangeText={(value) => handleShadowChange({ blur: parseInt(value) || 0 })}
            keyboardType="numeric"
            placeholder="Blur"
          />
          <IconButton
            icon="palette"
            size={20}
            onPress={() => setIsShadowColorPickerVisible(true)}
          />
        </View>
      )}

      {/* Color pickers */}
      {renderColorPicker(
        isColorPickerVisible,
        () => setIsColorPickerVisible(false),
        handleColorChange,
        element.color
      )}
      {renderColorPicker(
        isBorderColorPickerVisible,
        () => setIsBorderColorPickerVisible(false),
        handleBorderColorChange,
        element.borderColor
      )}
      {renderColorPicker(
        isShadowColorPickerVisible,
        () => setIsShadowColorPickerVisible(false),
        (color) => handleShadowChange({ color }),
        element.shadow?.color
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    padding: 5,
    borderRadius: 8,
    elevation: 4,
    zIndex: 1000,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  control: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    width: 50,
    height: 30,
    textAlign: 'center',
    marginTop: 4,
  },
  shadowControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  colorPickerContainer: {
    height: 300,
    alignItems: 'center',
  },
  colorPickerButton: {
    marginTop: 10,
  },
});

export default ShapeFormatter; 