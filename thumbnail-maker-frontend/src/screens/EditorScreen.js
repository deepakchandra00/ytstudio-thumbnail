import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View, StyleSheet, Dimensions, Platform, TouchableWithoutFeedback, Alert } from 'react-native';
import { IconButton, Surface, Portal, Modal, TextInput, Button, Menu } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker/src/ImagePicker';
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

const EditorScreen = () => {
  // Refs
  const canvasRef = useRef(null);

  // Store
  const { elements, addElement, updateElement, removeElement, history, undo, redo } = useEditorStore();

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
  const [backgroundImage, setBackgroundImage] = useState(null);
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

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        base64: false,
        // Add file size limit (e.g., 10MB)
        maxFileSize: 10 * 1024 * 1024, 
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        
        // Validate image dimensions
        if (imageAsset.width > 4096 || imageAsset.height > 4096) {
          Alert.alert(
            'Image Too Large', 
            'Image is too large. Maximum dimensions are 4096x4096 pixels.'
          );
          return;
        }

        addElement({
          type: 'image',
          uri: imageAsset.uri,
          position: { x: 0, y: 0 },
          width: Math.min(CANVAS_WIDTH / 3, imageAsset.width),
          height: Math.min((CANVAS_WIDTH / 3) * (9/16), imageAsset.height),
          zIndex: elements.length,
          originalWidth: imageAsset.width,
          originalHeight: imageAsset.height,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        'Error', 
        'Failed to upload image. Please try again.'
      );
    }
  }, [addElement, elements.length]);

  const addText = useCallback(() => {
    if (textInput.trim()) {
      addElement({
        type: 'text',
        content: textInput,
        position: { x: 50, y: 50 },
        font: selectedFont,
        size: selectedSize,
        color: selectedColor,
        fontStyle: selectedFontStyle,
        alignment: selectedAlignment,
        zIndex: elements.length,
      });
      setTextInput('');
      setTextModalVisible(false);
    }
  }, [textInput, selectedSize, selectedColor, selectedFont, selectedFontStyle, selectedAlignment, addElement, elements.length]);

  const pickBackgroundImage = useCallback(async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required', 
          'Sorry, we need camera roll permissions to set a background image.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        base64: false,
        // Add file size limit (e.g., 15MB)
        maxFileSize: 15 * 1024 * 1024, 
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageAsset = result.assets[0];
        
        // Validate image dimensions
        if (imageAsset.width > 4096 || imageAsset.height > 4096) {
          Alert.alert(
            'Image Too Large', 
            'Background image is too large. Maximum dimensions are 4096x4096 pixels.'
          );
          return;
        }

        // Use Alert for confirmation
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
                setBackgroundImage({
                  uri: imageAsset.uri,
                  width: imageAsset.width,
                  height: imageAsset.height,
                  originalWidth: imageAsset.width,
                  originalHeight: imageAsset.height
                });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error picking background image:', error);
      Alert.alert(
        'Error', 
        'Failed to set background image. Please try again.'
      );
    }
  }, []);

  const handleElementDrag = useCallback((index, newPosition) => {
    updateElement(index, {
      ...elements[index],
      position: newPosition
    });
  }, [elements, updateElement]);

  const handleElementSelect = useCallback((index) => {
    console.log('Selecting element:', index);
    setSelectedElementId(index);
  }, []);

  const handleUpdateTextStyle = (elementId, newStyle) => {
    // Update the specific text element's style
    setTextElements(prevElements => 
      prevElements.map(element => 
        element.id === elementId 
          ? { ...element, ...newStyle } 
          : element
      )
    );
  };

  const handleDeselectElement = useCallback(() => {
    // Only deselect if not currently dragging
    if (!isDragging) {
      setSelectedElementId(null);
    }
  }, [isDragging]);

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
        />
        <View style={styles.canvasContainer}>
          <View style={styles.canvasWrapper}>
            <Canvas style={styles.canvas}>
              <Fill color="white" />
              {backgroundImage && (
                <Canvas 
                  style={{ 
                    position: 'absolute', 
                    width: CANVAS_WIDTH, 
                    height: CANVAS_HEIGHT 
                  }}
                >
                  <Image
                    image={useImage(backgroundImage.uri)}
                    x={0}
                    y={0}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    fit="cover"
                  />
                </Canvas>
              )}
            </Canvas>

            {elements.map((element, index) => {
              if (element.type === 'text') {
                return (
                  <TextElement
                    key={index}
                    element={element}
                    isSelected={selectedElementId === index}
                    onSelect={() => setSelectedElementId(index)}
                    onDrag={(newPosition) => handleElementDrag(index, newPosition)}
                    onRotate={(newRotation) => handleElementRotate(index, newRotation)}
                    isDragging={isDragging}
                    setIsDragging={setIsDragging}
                    onUpdateTextStyle={handleUpdateTextStyle}
                  />
                );
              } else if (element.type === 'image') {
                return (
                  <ImageElement
                    key={`image-${index}`}
                    element={element}
                    isSelected={selectedElementId === index}
                    onSelect={() => handleElementSelect(index)}
                    onDrag={(newPosition) => {
                      updateElement(index, {
                        ...element,
                        position: newPosition
                      });
                    }}
                    onResize={(newDimensions) => {
                      updateElement(index, {
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

        <EditorToolbar
          onAddImage={pickImage}
          onAddText={() => setTextModalVisible(true)}
          onUndo={undo}
          onRedo={redo}
          canUndo={history.past.length > 0}
          canRedo={history.future.length > 0}
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
});

export default EditorScreen; 