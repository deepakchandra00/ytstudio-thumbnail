import React, { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  runOnJS,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';
import { Canvas, Image, useImage } from "@shopify/react-native-skia";
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';

const ImageElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onDrag,
  onResize,
  onRotate,
  isDragging,
  setIsDragging 
}) => {
  const image = useImage(element.uri);

  // Shared values for position, rotation, and scale
  const position = useSharedValue({
    x: element.position.x,
    y: element.position.y
  });
  console.log('element rotation', element);
  const rotation = useSharedValue(element.rotation || 0);
  const scale = useSharedValue(1);

  // Add new shared values for tracking initial dimensions
  const initialWidth = useSharedValue(element.width);
  const initialHeight = useSharedValue(element.height);

  const handleDragEnd = useCallback((x, y) => {
    if (onDrag) {
      onDrag({ x, y });
    }
  }, [onDrag]);

  const handleResizeEnd = useCallback((newWidth, newHeight) => {
    if (onResize) {
      onResize({ 
        width: newWidth, 
        height: newHeight 
      });
    }
  }, [onResize]);

  // Rotation gesture handler
  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      // Convert radians to degrees
      const newRotation = event.rotation * (180 / Math.PI);
      rotation.value = newRotation;
    })
    .onEnd(() => {
      // Save the final rotation
      if (onRotate) {
        runOnJS(onRotate)({
          rotation: rotation.value
        });
      }
    });

  // Pinch gesture for resizing
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = event.scale;
      scale.value = newScale;
    })
    .onEnd(() => {
      // Use initial dimensions instead of current element dimensions
      const newWidth = initialWidth.value * scale.value;
      const newHeight = initialHeight.value * scale.value;
      
      scale.value = 1;
      runOnJS(handleResizeEnd)(newWidth, newHeight);
    });


  const handleResize = useCallback(() => {
    console.log('Resize started');
    // Capture initial dimensions when resize starts
    pinchGesture.enabled(true);
    // Add any additional resize start logic here
  }, [element.width, element.height]);

  // Pan gesture for moving
  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      if (onSelect) runOnJS(onSelect)();
      if (setIsDragging) runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      position.value = {
        x: element.position.x + event.translationX,
        y: element.position.y + event.translationY
      };
    })
    .onEnd(() => {
      if (setIsDragging) runOnJS(setIsDragging)(false);
      runOnJS(handleDragEnd)(position.value.x, position.value.y);
    })
    .onFinalize(() => {
      if (setIsDragging) runOnJS(setIsDragging)(false);
    })
    .shouldCancelWhenOutside(true);

  // Combine gestures
  const gesture = Gesture.Simultaneous(
    panGesture,
    rotationGesture,
    pinchGesture
  );

  // Animated style with position, rotation, and scale
  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
      width: element.width + 20,
      height: element.height + 20,
      // Add border when selected
      borderWidth: isSelected ? 1 : 0,
      borderColor: isSelected ? 'blue' : 'transparent',
      padding: isSelected ? 10 : 0
    };
  });

  // Animated style for resize icon
  const resizeIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withRepeat(
            withTiming(1.2, { 
              duration: 800, 
              easing: Easing.bounce 
            }), 
            -1, 
            true
          ) 
        }
      ],
      opacity: withRepeat(
        withTiming(0.7, { 
          duration: 800, 
          easing: Easing.ease 
        }), 
        -1, 
        true
      )
    };
  });

  if (!image) {
    console.log('Failed to load image for element:', element);
    return null;
  }

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Canvas 
          style={{ 
            width: element.width, 
            height: element.height 
          }}
        >
          <Image
            image={image}
            x={0}
            y={0}
            width={element.width}
            height={element.height}
            fit="contain"
          />
        </Canvas>
        {isSelected && (
          <Animated.View 
            style={[
              {
                position: 'absolute',
                bottom: -20,
                right: -20,
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
              },
              resizeIconAnimatedStyle
            ]}
          >
            <TouchableOpacity 
              onPressIn={handleResize}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon 
                source="arrow-expand" 
                color="blue" 
                size={24} 
              />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default ImageElement;