import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Portal, Modal, Button, IconButton, Text } from 'react-native-paper';
import { SHAPE_TYPES } from './ShapeElement';

const ShapeModal = ({
  visible,
  onDismiss,
  onAddShape,
}) => {
  const [selectedShape, setSelectedShape] = useState(SHAPE_TYPES.RECTANGLE);

  const handleAddShape = () => {
    const shapeElement = {
      type: 'shape',
      shapeType: selectedShape,
      position: { x: 50, y: 50 },
      width: 100,
      height: 100,
      color: '#000000',
      rotation: 0
    };

    onAddShape(shapeElement);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalContent}
      >
        <Text style={styles.title}>Add Shape</Text>
        
        <View style={styles.shapeTypeContainer}>
          <IconButton
            icon="square"
            size={30}
            mode={selectedShape === SHAPE_TYPES.RECTANGLE ? 'contained' : 'outlined'}
            onPress={() => setSelectedShape(SHAPE_TYPES.RECTANGLE)}
          />
          <IconButton
            icon="circle"
            size={30}
            mode={selectedShape === SHAPE_TYPES.CIRCLE ? 'contained' : 'outlined'}
            onPress={() => setSelectedShape(SHAPE_TYPES.CIRCLE)}
          />
          <IconButton
            icon="triangle"
            size={30}
            mode={selectedShape === SHAPE_TYPES.TRIANGLE ? 'contained' : 'outlined'}
            onPress={() => setSelectedShape(SHAPE_TYPES.TRIANGLE)}
          />
        </View>

        <View style={styles.actionButtons}>
          <Button mode="outlined" onPress={onDismiss} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleAddShape} style={styles.button}>
            Add Shape
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  shapeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    gap: 10,
  },
  button: {
    minWidth: 100,
  }
});

export default ShapeModal; 