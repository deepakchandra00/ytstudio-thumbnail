import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('screen');

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

export const GestureHandler = ({ children, position, size, onDragStart, onDragEnd }) => {
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const prevTranslateX = useSharedValue(position.x);
  const prevTranslateY = useSharedValue(position.y);

  const gesture = Gesture.Pan()
    .minDistance(1)
    .onStart(() => {
      prevTranslateX.value = translateX.value;
      prevTranslateY.value = translateY.value;
      onDragStart?.();
    })
    .onUpdate((event) => {
      const maxTranslateX = width - size.width;
      const maxTranslateY = height - size.height;

      translateX.value = clamp(
        prevTranslateX.value + event.translationX,
        0,
        maxTranslateX
      );
      translateY.value = clamp(
        prevTranslateY.value + event.translationY,
        0,
        maxTranslateY
      );
    })
    .onEnd(() => {
      onDragEnd?.({
        x: translateX.value,
        y: translateY.value,
      });
    })
    .runOnJS(true);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    width: size.width,
    height: size.height,
    position: 'absolute',
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[styles.container, animatedStyle]}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
}); 