import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Slider } from 'react-native-paper';

const StickerEditorWidget = ({ 
  selectedElement, 
  onUpdateStickerSize 
}) => {
  if (!selectedElement || selectedElement.type !== 'sticker') {
    return null;
  }

  const handleSizeChange = (value) => {
    // Resize the sticker by updating its size
    onUpdateStickerSize(selectedElement.id, { size: value });
  };

  return (
    <View style={styles.container}>
      <View style={styles.sizeControls}>
        <IconButton 
          icon="minus" 
          onPress={() => handleSizeChange(Math.max(0.5, selectedElement.size - 0.1))} 
        />
        <Slider
          style={styles.slider}
          minimumValue={0.5}
          maximumValue={2}
          step={0.1}
          value={selectedElement.size}
          onValueChange={handleSizeChange}
        />
        <IconButton 
          icon="plus" 
          onPress={() => handleSizeChange(Math.min(2, selectedElement.size + 0.1))} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  sizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
});

export default StickerEditorWidget;