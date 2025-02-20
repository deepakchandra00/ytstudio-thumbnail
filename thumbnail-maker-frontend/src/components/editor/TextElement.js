import React, { useCallback, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import { Text, matchFont, Canvas } from "@shopify/react-native-skia";
import { View, Platform } from 'react-native';
import TextFormatterWidget from './TextFormatterWidget';

const TextElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onDrag, 
  isDragging,
  setIsDragging,
  onUpdateTextStyle 
}) => {
  console.log('TextElement props:', { 
    element, 
    isSelected, 
    isDragging,
    color: element.color,
    size: element.size,
    content: element.content
  });

  // Add a shared value for rotation
  const rotation = useSharedValue(0);

  const position = useSharedValue({
    x: element.position.x,
    y: element.position.y
  });

    // Handle text style update
    const handleTextStyleUpdate = useCallback((newStyle) => {
      // Propagate style update to parent component
      onUpdateTextStyle && onUpdateTextStyle(isSelected, newStyle);
    }, [isSelected, onUpdateTextStyle]);

    // Rotation gesture handler
    const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      // Convert radians to degrees
      rotation.value = event.rotation * (180 / Math.PI);
    });

    
  // Use matchFont with system fonts
  const fontFamily = Platform.select({ 
    ios: "Helvetica", 
    default: "sans-serif" 
  });

  const fontStyle = {
    fontFamily,
    fontSize: element.size,
    fontWeight: "normal"
  };

  const font = matchFont(fontStyle);
  console.log('Font loading attempt:', {
    fontFamily,
    size: element.size,
    color: element.color,
    loaded: !!font
  });

  // Skip rendering if font is not loaded
  if (!font) {
    console.log('Font not loaded');
    return null;
  }

  const handleDragEnd = useCallback((x, y) => {
    if (onDrag) {
      onDrag({ x, y });
    }
  }, [onDrag]);

  const gesture = Gesture.Simultaneous(
    Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      console.log('Gesture begin');
      if (onSelect) runOnJS(onSelect)();
      if (setIsDragging) runOnJS(setIsDragging)(true);
    })
    .onStart(() => {
      console.log('Gesture started');
    })
    .onUpdate((event) => {
      console.log('Gesture update:', event.translationX, event.translationY);
      position.value = {
        x: element.position.x + event.translationX,
        y: element.position.y + event.translationY
      };
    })
    .onEnd(() => {
      console.log('Gesture ended');
      if (setIsDragging) runOnJS(setIsDragging)(false);
      runOnJS(handleDragEnd)(position.value.x, position.value.y);
    })
    .onFinalize(() => {
      console.log('Gesture finalized');
      if (setIsDragging) runOnJS(setIsDragging)(false);
    })
    .shouldCancelWhenOutside(true),
    rotationGesture
  )


  // Use worklet-compatible animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotation.value}deg` }
      ],
      width:  element.size * element.content.length/2 + 10,
      height: element.size * 1.2 + 10,
            // Add border when selected
            borderWidth: isSelected ? 1 : 0,
            borderColor: isSelected ? 'blue' : 'transparent',
            padding: isSelected ? 5 : 0
    };
  });

  console.log('Rendering TextElement with font:', fontFamily);

  return (
    <View>
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animatedStyle, { position: 'absolute' }]}>
        <Canvas style={{ flex: 1 }}>
          <Text
            font={font}
            text={element.content}
            x={0}
            y={element.size}
            color={element.color || "black"}
          />
        </Canvas>
      </Animated.View>
    </GestureDetector>
    {isSelected && (
        <TextFormatterWidget 
          selectedElement={element}
          onUpdateTextStyle={handleTextStyleUpdate}
        />
      )}
    </View>
  );
};

export default TextElement; 