import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { IconButton } from 'react-native-paper';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import {
  Canvas,
  RoundedRect,
  Circle,
  Path,
  Group,
  Shadow,
  Rect,
} from "@shopify/react-native-skia";
import ShapeFormatter from './ShapeFormatter';

const SHAPE_TYPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  TRIANGLE: 'triangle'
};

const ShapeElement = ({
  element,
  isSelected,
  onSelect,
  onDrag,
  onResize,
  onRotate,
  isDragging,
  setIsDragging,
  onRemoveElement,
  index,
  onUpdateElement
}) => {
  // Animated values
  const position = useSharedValue({
    x: element.position.x,
    y: element.position.y
  });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(element.rotation || 0);
  const initialWidth = useSharedValue(element.width);
  const initialHeight = useSharedValue(element.height);
  const isResizing = useSharedValue(false);

  const handleDragEnd = useCallback(
    (x, y) => {
      if (onDrag) onDrag({ x, y });
    },
    [onDrag]
  );

  const handleResizeEnd = useCallback(
    (newWidth, newHeight) => {
      if (onResize) onResize({ width: newWidth, height: newHeight });
    },
    [onResize]
  );

  const handleUpdateStyle = useCallback((styleUpdates) => {
    if (onUpdateElement) {
      onUpdateElement(element.id, {
        ...element,
        ...styleUpdates
      });
    }
  }, [element, onUpdateElement]);

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      if (onSelect && !isResizing.value) runOnJS(onSelect)();
      if (setIsDragging && !isResizing.value) runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      position.value = {
        x: element.position.x + event.translationX,
        y: element.position.y + event.translationY
      };
    })
    .onEnd(() => {
      if (setIsDragging) runOnJS(setIsDragging)(false);
      if (!isResizing.value) runOnJS(handleDragEnd)(position.value.x, position.value.y);
    });

  // Rotation gesture handler
  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = event.rotation * (180 / Math.PI);
    })
    .onEnd(() => {
      if (onRotate && !isResizing.value) runOnJS(onRotate)({ rotation: rotation.value });
    });

  // Combined gesture
  const gesture = Gesture.Simultaneous(panGesture, rotationGesture);

  // Animated style for the container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: position.value.x },
      { translateY: position.value.y },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
    width: initialWidth.value,
    height: initialHeight.value,
    position: 'absolute',
    borderWidth: isSelected ? 1 : 0,
    borderColor: isSelected ? 'blue' : 'transparent',
    borderStyle: 'dashed'
  }));

const rotations = useSharedValue(element.rotation || 0);
const previousRotation = useSharedValue(0);

  const buttonRotationGesture = Gesture.Rotation()
    .onBegin(() => {
      previousRotation.value = rotations.value;
      console.log('Rotation Gesture Begin');
    })
    .onUpdate((event) => {
      const newRotation = previousRotation.value + event.rotation * (180 / Math.PI);
      const snappedAngle = Math.round(newRotation / 45) * 45; // Snap to 45-degree increments
      rotations.value = rotations.value + (snappedAngle - rotations.value) * 0.2; // Smooth transition
      console.log('Smooth Snapped Rotation:', rotations.value);
    })
    .onEnd(() => {
      if (onRotate) runOnJS(onRotate)({ rotation: rotations.value });
      console.log('Rotation Gesture End');
    });

  // Render the appropriate shape based on type
  const renderShape = () => {
    const shapeProps = {
      x: 0,
      y: 0,
      width: element.width,
      height: element.height,
      color: element.color || '#000000',
    };

    switch (element.shapeType) {
      case SHAPE_TYPES.RECTANGLE:
        return (
          <Group>
            {element.shadow && (
              <Shadow
                dx={element.shadow.dx || 5}
                dy={element.shadow.dy || 5}
                blur={element.shadow.blur || 10}
                color={element.shadow.color || 'rgba(0, 0, 0, 0.5)'}
              />
            )}
            <RoundedRect
              {...shapeProps}
              r={element.borderRadius || 0}
              style="fill"
              strokeWidth={element.borderWidth || 0}
              strokeColor={element.borderColor || 'transparent'}
            />
          </Group>
        );

      case SHAPE_TYPES.CIRCLE:
        const radius = Math.min(element.width, element.height) / 2;
        return (
          <Group>
            {element.shadow && (
              <Shadow
                dx={element.shadow.dx || 5}
                dy={element.shadow.dy || 5}
                blur={element.shadow.blur || 10}
                color={element.shadow.color || 'rgba(0, 0, 0, 0.5)'}
              />
            )}
            <Circle
              cx={element.width / 2}
              cy={element.height / 2}
              r={radius}
              color={element.color}
              style="fill"
              strokeWidth={element.borderWidth || 0}
              strokeColor={element.borderColor || 'transparent'}
            />
          </Group>
        );

      case SHAPE_TYPES.TRIANGLE:
        const path = `
          M ${element.width / 2} 0
          L ${element.width} ${element.height}
          L 0 ${element.height}
          Z
        `;
        return (
          <Group>
            {element.shadow && (
              <Shadow
                dx={element.shadow.dx || 5}
                dy={element.shadow.dy || 5}
                blur={element.shadow.blur || 10}
                color={element.shadow.color || 'rgba(0, 0, 0, 0.5)'}
              />
            )}
            <Path
              path={path}
              color={element.color}
              style="fill"
              strokeWidth={element.borderWidth || 0}
              strokeColor={element.borderColor || 'transparent'}
            />
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <View>
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Canvas style={{ flex: 1 }}>
          {renderShape()}
        </Canvas>
        
        {isSelected && (
          <>
            {/* Rotate control */}
            <GestureDetector gesture={buttonRotationGesture}>
                <IconButton
                  icon="rotate-right"
                  mode="contained"
                  size={20}
                  color="blue"
                  style={{ position: 'absolute', top: -20, left: -20 }}
                />
            </GestureDetector>

            {/* Resize control */}
            <GestureDetector gesture={Gesture.Pan()
              .onBegin(() => {
                isResizing.value = true;
              })
              .onUpdate((event) => {
                const deltaX = event.translationX;
                const deltaY = event.translationY;
                initialWidth.value = element.width + deltaX;
                initialHeight.value = element.height + deltaY;
              })
              .onEnd(() => {
                runOnJS(handleResizeEnd)(initialWidth.value, initialHeight.value);
                isResizing.value = false;
              })}>
                <IconButton
                  icon="arrow-expand"
                  mode="contained"
                  size={20}
                  color="blue"
                  style={{ position: 'absolute', bottom: -20, right: -20, zIndex: 999 }}
                />
            </GestureDetector>

            {/* Delete control */}
              <IconButton
                icon="trash-can"
                mode="contained"
                size={20}
                color="red"
                onPress={() => onRemoveElement(index)}
                style={{ position: 'absolute', top: -20, right: -20 }}
              />
          </>
        )}
      </Animated.View>
    </GestureDetector>
    {isSelected && (
            <ShapeFormatter
              element={element}
              onUpdateStyle={handleUpdateStyle}
              style={{ position: 'absolute', top: -80 }}
            />
    )}
    </View>
  );
};

export { SHAPE_TYPES };
export default ShapeElement; 