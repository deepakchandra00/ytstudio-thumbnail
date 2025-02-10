import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Platform, Dimensions } from 'react-native';
import { Button, TextInput, IconButton, Portal, Modal, Menu, Surface } from 'react-native-paper';
import { PanGestureHandler, PinchGestureHandler, GestureHandlerRootView, RotationGestureHandler } from 'react-native-gesture-handler';
import * as ImagePicker from 'expo-image-picker';
import PhotoEditor from 'react-native-photo-editor';
import { useEditorStore } from '../store';
import getEnvVars from '../config/constants';
import Color from 'color';

const { apiUrl } = getEnvVars();

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_PADDING = 16;
const CANVAS_WIDTH = SCREEN_WIDTH - (CANVAS_PADDING * 2);
const CANVAS_HEIGHT = (CANVAS_WIDTH * 9) / 16;

const EditorScreen = ({ route, navigation }) => {
  const { elements, addElement, updateElement, selectedElement, setSelectedElement } = useEditorStore();
  const [text, setText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedFontSize, setSelectedFontSize] = useState(20);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedFont, setSelectedFont] = useState('normal');
  const [gestureOffset, setGestureOffset] = useState({ x: 0, y: 0 });
  const [fontMenuVisible, setFontMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        const imageWidth = CANVAS_WIDTH / 3; // Set initial width to 1/3 of canvas
        const imageHeight = imageWidth * (9/16); // Maintain aspect ratio
        
        addElement({
          type: 'image',
          uri: imageUri,
          position: { 
            x: (CANVAS_WIDTH - imageWidth) / 2, // Center horizontally
            y: (CANVAS_HEIGHT - imageHeight) / 2 // Center vertically
          },
          width: imageWidth,
          height: imageHeight,
          scale: 1,
          rotation: 0,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image. Please try again.');
    }
  };

  const openPhotoEditor = async (uri) => {
    if (Platform.OS === 'ios') {
      PhotoEditor.Edit({
        path: uri,
        onDone: (result) => {
          addElement({
            type: 'image',
            uri: result,
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
          });
        },
        onCancel: () => {
          console.log('Editing cancelled');
        },
      });
    } else {
      try {
        const formData = new FormData();
        formData.append('image', {
          uri: uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        });

        const response = await fetch(`${apiUrl}/edit-image`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
          addElement({
            type: 'image',
            uri: result.editedImageUrl,
            position: { x: 0, y: 0 },
            scale: 1,
            rotation: 0,
          });
        }
      } catch (error) {
        console.error('Error editing image:', error);
        alert(`Failed to edit image: ${error.message}`);
      }
    }
  };

  const addText = () => {
    if (text) {
      addElement({
        type: 'text',
        content: text,
        position: { 
          x: CANVAS_WIDTH / 4,
          y: CANVAS_HEIGHT / 4
        },
        scale: 1,
        rotation: 0,
        style: {
          fontSize: 20,
          color: '#000000',
          fontFamily: 'normal',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textAlign: 'center',
          backgroundColor: 'transparent',
        },
      });
      setText('');
      setIsEditing(false);
    }
  };

  const onGestureEvent = (event) => {
    if (selectedElement !== null) {
      const element = elements[selectedElement];
      
      // Calculate new position based on translation and initial offset
      const newPosition = {
        x: element.position.x + (event.nativeEvent.translationX - gestureOffset.x),
        y: element.position.y + (event.nativeEvent.translationY - gestureOffset.y),
      };

      // Update gesture offset
      setGestureOffset({
        x: event.nativeEvent.translationX,
        y: event.nativeEvent.translationY,
      });

      // Update element position
      updateElement(selectedElement, {
        ...element,
        position: newPosition,
      });
    }
  };

  const onGestureStart = () => {
    // Reset gesture offset when starting a new gesture
    setGestureOffset({ x: 0, y: 0 });
  };

  const onGestureEnd = () => {
    if (selectedElement !== null) {
      // Reset gesture offset
      setGestureOffset({ x: 0, y: 0 });
      
      // Save the final position
      const element = elements[selectedElement];
      updateElement(selectedElement, {
        ...element,
        lastPosition: { ...element.position },
      });
    }
  };

  const onPinchEvent = (event) => {
    if (selectedElement !== null) {
      updateElement(selectedElement, {
        scale: event.nativeEvent.scale,
      });
    }
  };

  const onRotationGestureEvent = (event) => {
    if (selectedElement !== null) {
      updateElement(selectedElement, {
        rotation: event.nativeEvent.rotation * (180 / Math.PI),
      });
    }
  };

  const updateTextStyle = (index, updates) => {
    const element = elements[index];
    if (element.type === 'text') {
      const updatedStyle = {
        ...element.style,
        ...updates,
      };
      
      console.log('Updating text style:', updatedStyle); // Debug log
      
      updateElement(index, {
        ...element,
        style: updatedStyle,
      });
    }
  };

  const exportThumbnail = async () => {
    try {
      const response = await fetch(`${apiUrl}/export-thumbnail`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ elements }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error('Error exporting thumbnail:', error);
      alert(`Failed to export: ${error.message}`);
    }
  };

  const renderElementControls = () => {
    if (selectedElement === null) return null;
    const element = elements[selectedElement];
    
    if (element.type !== 'text') return null;
    
    const fonts = ['normal', 'Arial', 'Roboto', 'Times New Roman'];
    const colors = [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Red', value: '#FF0000' },
      { name: 'Blue', value: '#0000FF' },
      { name: 'Green', value: '#00FF00' },
      { name: 'Yellow', value: '#FFFF00' },
    ];

    const handleColorChange = (colorValue) => {
      console.log('Selected color:', colorValue); // Debug log
      updateTextStyle(selectedElement, { color: colorValue });
      setColorMenuVisible(false);
    };
    
    return (
      <Portal>
        <Surface style={[
          styles.elementControls,
          { 
            top: 50,
            width: CANVAS_WIDTH,
            alignSelf: 'center'
          }
        ]}>
          <View style={styles.controlGroup}>
            <IconButton
              icon="format-size"
              size={16}
              mode="contained"
              onPress={() => updateTextStyle(selectedElement, { 
                fontSize: (element.style?.fontSize || 20) + 2 
              })}
            />
            <IconButton
              icon="format-size"
              size={16}
              mode="contained"
              style={{ transform: [{ rotate: '180deg' }] }}
              onPress={() => updateTextStyle(selectedElement, { 
                fontSize: Math.max((element.style?.fontSize || 20) - 2, 8)
              })}
            />
          </View>

          <View style={styles.controlGroup}>
            <Menu
              visible={fontMenuVisible}
              onDismiss={() => setFontMenuVisible(false)}
              anchor={
                <IconButton
                  icon="format-font"
                  size={16}
                  mode="contained"
                  onPress={() => setFontMenuVisible(true)}
                />
              }
              contentStyle={styles.menu}
            >
              {fonts.map((font) => (
                <Menu.Item
                  key={font}
                  onPress={() => {
                    updateTextStyle(selectedElement, { fontFamily: font });
                    setFontMenuVisible(false);
                  }}
                  title={font}
                  style={[
                    styles.menuItem,
                    element.style?.fontFamily === font && styles.selectedMenuItem
                  ]}
                />
              ))}
            </Menu>

            <Menu
              visible={colorMenuVisible}
              onDismiss={() => setColorMenuVisible(false)}
              anchor={
                <IconButton
                  icon="palette"
                  size={16}
                  mode="contained"
                  onPress={() => setColorMenuVisible(true)}
                />
              }
              contentStyle={styles.colorMenu}
            >
              {colors.map((color) => (
                <Menu.Item
                  key={color.value}
                  onPress={() => handleColorChange(color.value)}
                  title={color.name}
                  style={[
                    styles.colorMenuItem,
                    { backgroundColor: color.value },
                    element.style?.color === color.value && styles.selectedColorMenuItem
                  ]}
                  titleStyle={{
                    color: color.value === '#FFFFFF' ? '#000000' : '#FFFFFF',
                    textAlign: 'center',
                  }}
                />
              ))}
            </Menu>
          </View>

          <View style={styles.controlGroup}>
            <IconButton
              icon="format-bold"
              size={16}
              mode="contained"
              selected={element.style?.fontWeight === 'bold'}
              onPress={() => updateTextStyle(selectedElement, {
                fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold'
              })}
            />
            <IconButton
              icon="format-italic"
              size={16}
              mode="contained"
              selected={element.style?.fontStyle === 'italic'}
              onPress={() => updateTextStyle(selectedElement, {
                fontStyle: element.style?.fontStyle === 'italic' ? 'normal' : 'italic'
              })}
            />
          </View>

          <View style={styles.controlGroup}>
            <IconButton
              icon="format-align-left"
              size={16}
              mode="contained"
              selected={element.style?.textAlign === 'left'}
              onPress={() => updateTextStyle(selectedElement, { textAlign: 'left' })}
            />
            <IconButton
              icon="format-align-center"
              size={16}
              mode="contained"
              selected={element.style?.textAlign === 'center'}
              onPress={() => updateTextStyle(selectedElement, { textAlign: 'center' })}
            />
            <IconButton
              icon="format-align-right"
              size={16}
              mode="contained"
              selected={element.style?.textAlign === 'right'}
              onPress={() => updateTextStyle(selectedElement, { textAlign: 'right' })}
            />
          </View>
        </Surface>
      </Portal>
    );
  };

  const renderToolbar = () => (
    <Surface style={styles.toolbar} elevation={4}>
      <View style={styles.toolbarSection}>
        <IconButton
          icon="image-plus"
          mode="contained"
          size={14}
          onPress={pickImage}
          style={styles.toolbarButton}
        />
        <IconButton
          icon="text"
          mode="contained"
          size={14}
          onPress={() => setIsEditing(true)}
          style={styles.toolbarButton}
        />
      </View>
      
      <View style={styles.toolbarSection}>
        <IconButton
          icon="content-save"
          mode="contained"
          size={14}
          onPress={exportThumbnail}
          style={styles.toolbarButton}
        />
      </View>
    </Surface>
  );

  const renderTextInput = () => (
    <Portal>
      <Modal
        visible={isEditing}
        onDismiss={() => setIsEditing(false)}
        contentContainerStyle={styles.modalContent}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Enter text"
          style={styles.modalTextInput}
          autoFocus
        />
        <View style={styles.modalButtons}>
          <Button onPress={() => setIsEditing(false)}>Cancel</Button>
          <Button mode="contained" onPress={() => {
            addText();
            setIsEditing(false);
          }}>Add</Button>
        </View>
      </Modal>
    </Portal>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.canvasContainer}>
        <Surface style={styles.canvas} elevation={1}>
          {elements.map((element, index) => (
            <RotationGestureHandler
              key={index}
              onGestureEvent={onRotationGestureEvent}
              simultaneousHandlers={[`pan_${index}`, `pinch_${index}`]}
            >
              <PanGestureHandler
                id={`pan_${index}`}
                onGestureEvent={onGestureEvent}
                onBegan={onGestureStart}
                onEnded={onGestureEnd}
                onFailed={onGestureEnd}
                onCancelled={onGestureEnd}
                minDist={5}
              >
                <PinchGestureHandler
                  id={`pinch_${index}`}
                  onGestureEvent={onPinchEvent}
                >
                  <View
                    style={[
                      styles.element,
                      {
                        position: 'absolute',
                        left: element.position.x,
                        top: element.position.y,
                        transform: [
                          { scale: element.scale || 1 },
                          { rotate: `${element.rotation || 0}deg` },
                        ],
                      },
                      selectedElement === index && styles.selectedElement,
                    ]}
                    onTouchStart={() => setSelectedElement(index)}
                  >
                    {element.type === 'image' ? (
                      <Image 
                        source={{ uri: element.uri }} 
                        style={[styles.image, { width: element.width, height: element.height }]} 
                        resizeMode="contain"
                      />
                    ) : (
                      <TextInput
                        value={element.content}
                        style={[
                          styles.text,
                          element.style,
                          { backgroundColor: 'transparent' }
                        ]}
                        editable={false}
                        multiline
                      />
                    )}
                  </View>
                </PinchGestureHandler>
              </PanGestureHandler>
            </RotationGestureHandler>
          ))}
        </Surface>
      </View>
      {renderElementControls()}
      {renderTextInput()}
      {renderToolbar()}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CANVAS_PADDING,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: '#ffffff',
    position: 'relative',
    borderRadius: 8,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  toolbarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolbarButton: {
    margin: 4,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTextInput: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  elementControls: {
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  controlGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingHorizontal: 8,
  },
  menu: {
    marginTop: 40,
  },
  menuItem: {
    height: 40,
    justifyContent: 'center',
  },
  selectedMenuItem: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  textContainer: {
    minWidth: 100,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    minWidth: 100,
    minHeight: 40,
    padding: 8,
    backgroundColor: 'transparent',
  },
  element: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    minHeight: 50,
    backgroundColor: 'transparent',
  },
  selectedElement: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    borderRadius: 4,
    padding: 4,
    backgroundColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  colorMenu: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 4,
    marginTop: 8,
  },
  colorMenuItem: {
    height: 40,
    justifyContent: 'center',
    marginVertical: 2,
    borderRadius: 4,
    paddingHorizontal: 16,
  },
  selectedColorMenuItem: {
    borderWidth: 2,
    borderColor: '#2196F3',
  },
});

export default EditorScreen; 