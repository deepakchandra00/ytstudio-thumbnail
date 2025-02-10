import React from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS
} from 'react-native-reanimated';

export const GestureHandler = ({ 
  children, 
  position, 
  size,
  onDragStart,
  onDragEnd,
}) => {
  const offset = useSharedValue({ x: position.x, y: position.y });
  const start = useSharedValue({ x: 0, y: 0 });
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const dragGesture = Gesture.Pan()
    .enabled(true)
    .minDistance(0)
    .onStart(() => {
      start.value = {
        x: offset.value.x,
        y: offset.value.y,
      };
      runOnJS(onDragStart)?.();
    })
    .onUpdate((event) => {
      offset.value = {
        x: start.value.x + event.translationX,
        y: start.value.y + event.translationY,
      };
    })
    .onEnd(() => {
      runOnJS(onDragEnd)?.({
        x: offset.value.x,
        y: offset.value.y,
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: offset.value.x },
      { translateY: offset.value.y },
      { scale: scale.value },
      { rotate: `${rotation.value}rad` },
    ],
    position: 'absolute',
    left: 0,
    top: 0,
    width: size.width,
    height: size.height,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <GestureDetector gesture={dragGesture}>
        {children}
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
}); 