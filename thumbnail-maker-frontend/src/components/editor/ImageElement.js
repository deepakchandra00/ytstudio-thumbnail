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
//buttonrotation gesture
// const buttonRotationGesture = Gesture.Pan()
//   .onBegin(() => {
//     console.log('Rotation Gesture Begin');
//   })
//   .onUpdate((event) => {
//     const angle = Math.atan2(event.translationY, event.translationX) * (180 / Math.PI);
//     const snappedAngle = Math.round(angle / 45) * 45; // Snap to 45-degree increments
//     rotation.value = snappedAngle;
//   })
//   .onEnd(() => {
//     if (onRotate) runOnJS(onRotate)({ rotation: rotation.value });
//     console.log('Rotation Gesture End');
//   });
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
            <GestureDetector gesture={buttonRotationGesture}>
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
              >
                <Icon source="rotate-right" color="blue" size={24} />
              </TouchableOpacity>
            </GestureDetector>
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