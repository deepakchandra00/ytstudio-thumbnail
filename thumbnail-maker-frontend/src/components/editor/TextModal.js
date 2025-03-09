import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, TextInput, Button } from 'react-native-paper';

const TextModal = ({
  visible,
  onDismiss,
  textInput,
  onTextChange,
  onAddText,
}) => {
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <TextInput
          value={textInput}
          onChangeText={onTextChange}
          placeholder="Enter your text here..."
          style={styles.textInput}
          multiline
          mode="outlined"
          autoFocus
        />

        <View style={styles.actionButtons}>
          <Button 
            mode="outlined" 
            onPress={onDismiss}
            style={styles.cancelButton}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={onAddText}
            style={styles.addButton}
          >
            Add Text
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxWidth: 500,
    alignSelf: 'center',
  },
  textInput: {
    backgroundColor: 'transparent',
    marginBottom: 20,
    minHeight: 120,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelButton: {
    minWidth: 100,
  },
  addButton: {
    minWidth: 100,
  },
});

export default TextModal; 