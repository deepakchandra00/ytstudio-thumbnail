import React, { useCallback } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { Canvas, Image, useImage } from '@shopify/react-native-skia';
import { TouchableOpacity } from 'react-native';
import { Icon, IconButton } from 'react-native-paper';

const ImageElement = ({
  element,
  isSelected,
  onSelect,
  onDrag,
  onResize,
  onRotate,
  onDelete,
  index,
  setIsDragging,
}) => {
  const image = useImage(element.uri);

  const position = useSharedValue({ x: element.position.x, y: element.position.y });
  const rotation = useSharedValue(element.rotation || 0);
  const scale = useSharedValue(1);

  const initialWidth = useSharedValue(element.width);
  const initialHeight = useSharedValue(element.height);

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

  const rotationGesture = Gesture.Rotation()
    .onUpdate((event) => {
      rotation.value = event.rotation * (180 / Math.PI);
    })
    .onEnd(() => {
      if (onRotate) runOnJS(onRotate)({ rotation: rotation.value });
    });

  const panGesture = Gesture.Pan()
    .minDistance(1)
    .onBegin(() => {
      if (onSelect) runOnJS(onSelect)();
      if (setIsDragging) runOnJS(setIsDragging)(true);
    })
    .onUpdate((event) => {
      position.value = {
        x: element.position.x + event.translationX,
        y: element.position.y + event.translationY,
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

  const gesture = Gesture.Simultaneous(panGesture, rotationGesture);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      position: 'absolute',
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      width: initialWidth.value + 20,
      height: initialHeight.value + 20,
      borderWidth: isSelected ? 1 : 0,
      borderColor: isSelected ? 'blue' : 'transparent',
      padding: isSelected ? 10 : 0,
    };
  });

  const canvasStyle = useAnimatedStyle(() => {
    return {
      width: initialWidth.value,
      height: initialHeight.value,
    };
  });

  if (!image) return null;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={animatedStyle}>
        <Animated.View style={canvasStyle}>
          <Canvas style={{ flex: 1 }}>
            <Image
              image={image}
              x={0}
              y={0}
              width={initialWidth.value}
              height={initialHeight.value}
              fit="contain"
            />
          </Canvas>
        </Animated.View>
        {isSelected && (
          <>
            <GestureDetector gesture={Gesture.Pan().onUpdate((event) => {
              const deltaX = event.translationX;
              const deltaY = event.translationY;
              initialWidth.value = element.width + deltaX;
              initialHeight.value = element.height + deltaY;
            }).onEnd(()=>{
              runOnJS(handleResizeEnd)(initialWidth.value, initialHeight.value);
            })}>
              <TouchableOpacity
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
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
                  elevation: 5,
                }}
              >
                <Icon source="arrow-expand" color="blue" size={24} />
              </TouchableOpacity>
            </GestureDetector>
            <TouchableOpacity
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                position: 'absolute',
                top: -20,
                left: -20,
                backgroundColor: 'white',
                borderRadius: 20,
                padding: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5,
              }}
              onPress={() => {
                rotation.value += 15;
                runOnJS(onRotate)({ rotation: rotation.value });
              }}
            >
              <Icon source="rotate-right" color="blue" size={24} />
            </TouchableOpacity>
            <IconButton
              icon="trash-can"
              mode="contained"
              color="red"
              size={24}
              onPress={() => onDelete(index)}
              style={{ position: 'absolute', top: -20, right: -20 }}
            />
          </>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

export default ImageElement;