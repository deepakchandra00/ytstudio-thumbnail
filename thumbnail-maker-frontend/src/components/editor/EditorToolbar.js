import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton, Surface } from 'react-native-paper';

const EditorToolbar = ({ onAddImage, onAddText, onUndo, onRedo, canUndo, canRedo }) => (
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
        onPress={() => {/* TODO: Implement sticker picker */}}
      />
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
  </Surface>
);

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