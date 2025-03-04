import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { IconButton, Surface, Tooltip } from 'react-native-paper';
import StickerPicker from './StickerPicker';

const EditorToolbar = ({ 
  onAddImage, 
  onAddText, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  onAddSticker, 
  onRemoveBackground,
  canRemoveBackground,
  removeBackground
}) => {
  const [stickerPickerVisible, setStickerPickerVisible] = useState(false);

  const handleStickerSelect = (stickerElement) => {
    console.log(stickerElement, "stickerElement")
    onAddSticker(stickerElement);
  };
console.log('processing:', removeBackground)
  return (
    <Surface style={styles.toolbar}>
      <View style={styles.toolbarSection}>
        <IconButton
          icon="image-plus"
          mode="contained"
          onPress={onAddImage}
        />
        <IconButton
          icon="format-text"
          mode="contained"
          onPress={onAddText}
        />
        <IconButton
          icon="sticker-emoji"
          mode="contained"
          onPress={() => setStickerPickerVisible(true)}
        />
        <Tooltip title="Remove Background">
          <IconButton
            icon="image-auto-adjust"
            mode="contained"
            onPress={onRemoveBackground}
            disabled={!canRemoveBackground}
            loading={removeBackground}
          />
        </Tooltip>
      </View>
      
      <View style={styles.toolbarSection}>
        <IconButton
          icon="undo"
          mode="contained"
          onPress={onUndo}
          disabled={!canUndo}
        />
        <IconButton
          icon="redo"
          mode="contained"
          onPress={onRedo}
          disabled={!canRedo}
        />
      </View>

      <StickerPicker
        visible={stickerPickerVisible}
        onClose={() => setStickerPickerVisible(false)}
        onSelectSticker={handleStickerSelect}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  toolbarSection: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default EditorToolbar;