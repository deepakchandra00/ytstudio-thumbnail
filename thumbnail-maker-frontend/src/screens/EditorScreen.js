import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableWithoutFeedback, Alert } from 'react-native';
import { IconButton, Surface, Portal, Modal, TextInput, Button, Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker/src/ImagePicker';
import StickerEditorWidget from '../components/editor/StickerEditorWidget';

import {
  Canvas,
  Image,
  useImage,
  Fill,
  Text,
  useFont,
  matchFont,
  Group,
} from "@shopify/react-native-skia";
import { useEditorStore } from '../store';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useRoute } from '@react-navigation/native';

import TextElement from '../components/editor/TextElement';
import ImageElement from '../components/editor/ImageElement';
import EditorToolbar from '../components/editor/EditorToolbar';
import TextModal from '../components/editor/TextModal';
import EditorHeader from '../components/editor/EditorHeader';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CANVAS_PADDING } from '../constants/editorConstants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FONTS = Platform.select({ 
  ios: ['Helvetica'],
  android: ['sans-serif']
});
const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#FF0000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#00FF00' },
];

const INITIAL_TEXT_SIZE = 32; // Larger default text size
const TEXT_STYLES = [
  { name: 'Normal', value: 'normal' },
  { name: 'Bold', value: 'bold' },
  { name: 'Italic', value: 'italic' },
];

const TEXT_ALIGNMENTS = [
  { name: 'Left', value: 'left', icon: 'format-align-left' },
  { name: 'Center', value: 'center', icon: 'format-align-center' },
  { name: 'Right', value: 'right', icon: 'format-align-right' },
];

// Dummy base64 encoded background image (a simple white 1x1 pixel PNG)
const DUMMY_BACKGROUND_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

const EditorScreen = () => {
  const route = useRoute();
  const { template } = route.params || {};

  const handleUpdateStickerSize = (elementId, updates) => {
    updateElement(elementId, updates);
  };

  // Refs
  const canvasRef = useRef(null);

  // Store
  const { elements, addElement, updateElement, removeElement, history, undo, redo, setElements } = useEditorStore();

  // Background image handling
  const [backgroundImage, setBackgroundImage] = useState(DUMMY_BACKGROUND_IMAGE);
  const [backgroundImageObj, setBackgroundImageObj] = useState(null);
  const processedBackgroundImage = useImage(backgroundImage);

  const pickBackgroundImage = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to make this work!');
        return;
      }

      const imageAsset = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      
      console.log('Selected Background Image:', JSON.stringify(imageAsset, null, 2));

      if (!imageAsset.canceled && imageAsset.assets && imageAsset.assets[0]) {
        const selectedImage = imageAsset.assets[0];
        
        Alert.alert(
          'Set Background',
          'Do you want to set this image as the background?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Set Background',
              onPress: () => {
                // Ensure we always set a string URI
                const backgroundUri = selectedImage.uri;
                console.log('Selected Background URI:', backgroundUri);
                
                if (backgroundUri) {
                  // Set ONLY the URI string to backgroundImage
                  setBackgroundImage(backgroundUri);
                  
                  // Update backgroundImageObj with the full image details
                  setBackgroundImageObj({
                    uri: backgroundUri,
                    width: selectedImage.width,
                    height: selectedImage.height,
                    originalWidth: selectedImage.width,
                    originalHeight: selectedImage.height
                  });
                } else {
                  Alert.alert('Error', 'Could not retrieve image URI');
                }
              }
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No image selected');
      }
    } catch (error) {
      console.error('Error picking background image:', error);
      Alert.alert(
        'Error', 
        'Failed to set background image. Please try again.'
      );
    }
  }, []);

  // Load template on initial render
  useEffect(() => {
    if (template) {
      // Reset elements to template elements
      setElements(template.elements || []);
      
      // Set background image if template has one
      if (template.backgroundImage) {
        setBackgroundImage(template.backgroundImage);
      }
    } else {
      // If no template is provided, set up a blank canvas with initial text
      setElements([
        {
          type: 'text',
          content: 'Your Title Here',
          position: { x: 50, y: 50 },
          font: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
          size: 32,
          color: COLORS[0].value, // Black
          fontStyle: 'bold',
          alignment: 'center',
          zIndex: 0,
        }
      ]);
      setBackgroundImage(DUMMY_BACKGROUND_IMAGE);
    }
  }, [template, setElements]);

  // Ensure image is loaded before rendering
  useEffect(() => {
    if (!processedBackgroundImage) {
      console.warn('Background image failed to load');
    }
  }, [processedBackgroundImage]);

  // State
  const [textInput, setTextInput] = useState('');
  const [textModalVisible, setTextModalVisible] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [fontMenuVisible, setFontMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);
  const [selectedFont, setSelectedFont] = useState(
    Platform.select({ ios: 'Helvetica', default: 'sans-serif' })
  );
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [selectedSize, setSelectedSize] = useState(20);
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [selectedFontStyle, setSelectedFontStyle] = useState('normal');
  const [selectedAlignment, setSelectedAlignment] = useState('left');
  const [showBackgroundRemoval, setShowBackgroundRemoval] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Animated values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const pickImage = useCallback(async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Sorry, we need camera roll permissions to upload images.'
        );
        return;
      }

      const imageAsset = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        base64: false,
        // Add file size limit (e.g., 10MB)
        maxFileSize: 10 * 1024 * 1024, 
      });

      console.log('Selected Image:', JSON.stringify(imageAsset, null, 2));

      if (!imageAsset.canceled && imageAsset.assets && imageAsset.assets[0]) {
        const selectedImage = imageAsset.assets[0];
        
        // Validate image dimensions
        if (selectedImage.width > 4096 || selectedImage.height > 4096) {
          Alert.alert(
            'Image Too Large', 
            'Image is too large. Maximum dimensions are 4096x4096 pixels.'
          );
          return;
        }

        addElement({
          type: 'image',
          uri: selectedImage.uri,
          position: { x: 0, y: 0 },
          width: Math.min(CANVAS_WIDTH / 3, selectedImage.width),
          height: Math.min((CANVAS_WIDTH / 3) * (9/16), selectedImage.height),
          zIndex: elements.length,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error', 
        'Failed to pick image. Please try again.'
      );
    }
  }, [elements, addElement]);

  const addText = useCallback(() => {
    if (textInput.trim()) {
      const newTextElement = {
        type: 'text',
        content: textInput,
        position: { x: 50, y: 50 },
        font: selectedFont,
        size: selectedSize,
        color: selectedColor,
        fontStyle: selectedFontStyle,
        alignment: selectedAlignment,
        zIndex: elements.length,
      };

      console.log('Adding new text element:', newTextElement);
      addElement(newTextElement);
      
      // Reset text input and close modal
      setTextInput('');
      setTextModalVisible(false);
    }
  }, [
    textInput, 
    selectedFont, 
    selectedSize, 
    selectedColor, 
    selectedFontStyle, 
    selectedAlignment, 
    elements.length, 
    addElement
  ]);

  const logCurrentElements = useCallback(() => {
    console.log('Current Elements:', JSON.stringify(elements, null, 2));
  }, [elements]);

  const handleElementDrag = useCallback((elementId, newPosition) => {
    updateElement(elementId, {
      ...elements.find((element) => element.id === elementId),
      position: newPosition
    });
  }, [elements, updateElement]);

  const handleElementSelect = useCallback((elementId) => {
    console.log('Selecting element:', elementId);
    setSelectedElementId(elementId);
  }, []);

  const handleUpdateTextStyle = (elementId, newStyle) => {
    // Update the specific text element's style
    updateElement(elementId, {
      ...elements.find((element) => element.id === elementId),
      ...newStyle
    });
  };

  const handleDeselectElement = useCallback(() => {
    // Only deselect if not currently dragging
    if (!isDragging) {
      setSelectedElementId(null);
    }
  }, [isDragging]);

  // Function to load default template
  const loadDefaultTemplate = useCallback(() => {
    // Clear existing elements
    setElements([]);

    // Add default template elements
    setElements([
      {
        type: 'text',
        content: 'Your Title Here',
        position: { x: 50, y: 50 },
        font: Platform.select({ ios: 'Helvetica', default: 'sans-serif' }),
        size: 32,
        color: COLORS[0].value, // Black
        fontStyle: 'bold',
        alignment: 'center',
        zIndex: 0,
      }
    ]);
    setBackgroundImage(DUMMY_BACKGROUND_IMAGE);
  }, [addElement, setElements]);

  // Optionally add a method to reset to default template in the toolbar or header
  const resetToDefaultTemplate = () => {
    loadDefaultTemplate();
  };

  const handleAdminSave = () => {
    Alert.alert('Save', 'Design saved successfully!');
    // You might want to call a function to save the current design state
  };

  return (
    <TouchableWithoutFeedback onPress={handleDeselectElement}>
      <View style={styles.container}>
        <EditorHeader
          onBack={() => {/* TODO */}}
          onPickBackground={pickBackgroundImage}
          elements={elements}
          onRemoveElement={removeElement}
          headerMenuVisible={headerMenuVisible}
          setHeaderMenuVisible={setHeaderMenuVisible}
          showAdminSave={true}
          onAdminSave={handleAdminSave}
          resetToDefaultTemplate={resetToDefaultTemplate}
        />
        <View style={styles.canvasContainer}>
          <View style={styles.canvasWrapper}>
            <Canvas style={styles.canvas}>
              <Fill color="white" />
              {processedBackgroundImage && (
                <Image
                  image={processedBackgroundImage}
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  fit="cover"
                />
              )}
            </Canvas>

            {elements.map((element, index) => {
              // Add a unique ID if not already present
              if (!element.id) {
                element.id = `element_${index}_${Date.now()}`;
              }

              if (element.type === 'text') {
                return (
                  <TextElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => handleElementSelect(element.id)}
                    onDrag={(newPosition) => handleElementDrag(element.id, newPosition)}
                    onRotate={(newRotation) => handleElementRotate(element.id, newRotation)}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    onUpdateTextStyle={handleUpdateTextStyle}
                  />
                );
              } else if (element.type === 'image') {
                return (
                  <ImageElement
                    key={element.id}
                    element={element}
                    isSelected={selectedElementId === element.id}
                    onSelect={() => handleElementSelect(element.id)}
                    onDrag={(newPosition) => {
                      updateElement(element.id, {
                        ...element,
                        position: newPosition
                      });
                    }}
                    onResize={(newDimensions) => {
                      updateElement(element.id, {
                        ...element,
                        width: newDimensions.width,
                        height: newDimensions.height
                      });
                    }}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                  />
                );
              }
              return null;
            })}
          </View>
        </View>

        {selectedElement && selectedElement.type === 'sticker' && (
        <StickerEditorWidget 
          selectedElement={selectedElement} 
          onUpdateStickerSize={handleUpdateStickerSize} 
        />
      )}

        <EditorToolbar
          onAddImage={pickImage}
          onAddText={() => setTextModalVisible(true)}
          onUndo={undo}
          onRedo={redo}
          onAddSticker={(stickerElement) => {
            addElement({
              ...stickerElement,
              zIndex: elements.length
            });
          }}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
          resetToDefaultTemplate={resetToDefaultTemplate}
        />

        <TextModal
          visible={textModalVisible}
          onDismiss={() => setTextModalVisible(false)}
          textInput={textInput}
          onTextChange={setTextInput}
          selectedFont={selectedFont}
          selectedColor={selectedColor}
          selectedSize={selectedSize}
          selectedFontStyle={selectedFontStyle}
          selectedAlignment={selectedAlignment}
          onFontSelect={setSelectedFont}
          onColorSelect={setSelectedColor}
          onSizeChange={(text) => setSelectedSize(parseInt(text) || INITIAL_TEXT_SIZE)}
          onFontStyleSelect={setSelectedFontStyle}
          onAlignmentSelect={setSelectedAlignment}
          onAddText={addText}
          fontMenuVisible={fontMenuVisible}
          colorMenuVisible={colorMenuVisible}
          setFontMenuVisible={setFontMenuVisible}
          setColorMenuVisible={setColorMenuVisible}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  canvasWrapper: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: 'relative',
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    position: 'absolute',
  },
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
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  textInput: {
    marginBottom: 16,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 4,
    padding: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginTop:50
  },
  headerLeft: {
    flexDirection: 'row',
    gap: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedElement: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  editorWidgetContainer: {
    position: 'absolute',
    bottom: 80,  
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
});

export default EditorScreen; 