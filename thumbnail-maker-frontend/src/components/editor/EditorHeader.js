import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, Alert } from 'react-native';
import { Surface, IconButton, Text as PaperText } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useEditorStore, useTemplateStore } from '../../store';
import DraggableFlatList from 'react-native-draggable-flatlist';
import ImagePickerModal from '../ImagePickerModal';

const LayerReorderModal = ({ 
  visible, 
  onClose, 
  elements, 
  onReorderElements,
  onRemoveElement 
}) => {
  const [layers, setLayers] = useState([]);

  const layersWithIds = useMemo(() => {
    return elements.map((element, index) => ({
      ...element,
      id: `layer-${index}-${element.type}`,
      displayName: `${element.type} Layer ${index + 1}`
    }));
  }, [elements]);

  useEffect(() => {
    if (visible && layersWithIds.length > 0) {
      setLayers(layersWithIds);
    }
  }, [visible, layersWithIds]);

  const renderItem = useCallback(({ 
    item, 
    drag, 
    isActive 
  }) => {
    return (
      <View 
        style={[
          styles.layerItem, 
          isActive && styles.activeLayer
        ]}
      >
        <View 
          style={styles.layerContent} 
          onTouchStart={drag}
        >
          <Text style={styles.layerText}>
            {item.displayName || `${item.type} Layer`}
          </Text>
          <IconButton 
            icon="delete" 
            size={20} 
            onPress={() => {
              const index = layers.findIndex(l => l.id === item.id);
              onRemoveElement(index);
              const newLayers = layers.filter(l => l.id !== item.id);
              setLayers(newLayers);
            }} 
          />
        </View>
      </View>
    );
  }, [layers, onRemoveElement]);

  const handleDragEnd = useCallback(({ data }) => {
    const reorderedElements = data.map(layer => {
      const originalIndex = elements.findIndex(el => 
        el.type === layer.type && 
        JSON.stringify(el) === JSON.stringify(layer)
      );
      return originalIndex !== -1 ? elements[originalIndex] : layer;
    });

    onReorderElements(reorderedElements);
  }, [elements, onReorderElements]);

  if (!visible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      hardwareAccelerated={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <PaperText style={styles.modalTitle}>Reorder Layers</PaperText>
          {layers.length === 0 ? (
            <Text style={styles.emptyState}>No layers found</Text>
          ) : (
            <DraggableFlatList
              data={layers}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              onDragEnd={handleDragEnd}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={5}
              windowSize={21}
            />
          )}
          <IconButton 
            icon="close" 
            style={styles.closeButton}
            onPress={onClose} 
          />
        </View>
      </View>
    </Modal>
  );
};

const EditorHeader = ({
  onPickBackground,
  elements,
  onRemoveElement,
  onAdminSave,
  showAdminSave,
  onSetBackground,
  onExport,
  onAddShape
}) => {
  const navigation = useNavigation();
  const { history, setElements } = useEditorStore();
  const { loading } = useTemplateStore();
  const [layerModalVisible, setLayerModalVisible] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);

  const handleBack = () => {
    if (history.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to go back? Any unsaved changes will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go Back',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleReorderElements = (reorderedElements) => {
    setElements(reorderedElements);
  };

  const openLayersModal = () => {
    console.log('Attempting to open layers modal');
    console.log('Current elements:', JSON.stringify(elements, null, 2));
    
    if (elements && elements.length > 0) {
      setLayerModalVisible(true);
    } else {
      Alert.alert(
        'No Layers',
        'There are currently no layers to reorder.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleOpenImagePickerModal = () => setShowImagePickerModal(true);
  const handleCloseImagePickerModal = () => setShowImagePickerModal(false);

  return (
    <Surface style={styles.header}>
      <View style={styles.headerLeft}>
        <IconButton
          icon="arrow-left"
          mode="contained"
          onPress={handleBack}
        />
      </View>
      
      <View style={styles.headerRight}>
        <IconButton
          icon="shape"
          mode="contained"
          onPress={onAddShape}
        />
        <IconButton
          icon="layers"
          mode="contained"
          onPress={openLayersModal}
        />
        
        {showAdminSave && (
          <IconButton
            icon={loading ? "loading" : "content-save"}
            size={24}
            onPress={() => {
              onAdminSave();
            }}
            style={styles.adminSaveButton}
            disabled={loading}
            mode="contained"
            accessibilityLabel={loading ? "Saving..." : "Save Design"}
          />
        )}
        <IconButton
          icon="image"
          mode="contained"
          onPress={handleOpenImagePickerModal}
        />
        <IconButton
          icon="export"
          mode="contained"
          onPress={onExport}
          accessibilityLabel="Export Canvas"
        />
      </View>

      <LayerReorderModal
        visible={layerModalVisible}
        onClose={() => {
          console.log('Closing layers modal');
          setLayerModalVisible(false);
        }}
        elements={elements}
        onReorderElements={handleReorderElements}
        onRemoveElement={onRemoveElement}
      />
      <ImagePickerModal 
        show={showImagePickerModal} 
        handleClose={handleCloseImagePickerModal} 
        onPickBackground={onPickBackground}
        onSetBackground={onSetBackground}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    elevation: 4,
    marginTop: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminSaveButton: {
    marginRight: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  layerItem: {
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 8,
    padding: 10,
  },
  activeLayer: {
    backgroundColor: '#e0e0e0',
  },
  layerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  layerText: {
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  emptyState: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
  }
});

export default EditorHeader;