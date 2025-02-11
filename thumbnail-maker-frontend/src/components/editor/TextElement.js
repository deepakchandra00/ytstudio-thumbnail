import React, { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import { Text, matchFont, Canvas } from "@shopify/react-native-skia";
import { View, Platform } from 'react-native';

const TextElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onDrag, 
  isDragging,
  setIsDragging 
}) => {
  console.log('TextElement props:', { element, isSelected, isDragging });
  
  const position = useSharedValue({
    x: element.position.x,
    y: element.position.y
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

  const gesture = Gesture.Pan()
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
    .shouldCancelWhenOutside(true);

  // Use worklet-compatible animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y }
      ],
      width: element.size * element.content.length,
      height: element.size * 1.2,
    };
  });

  console.log('Rendering TextElement with font:', fontFamily);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
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
  );
};

export default TextElement; 