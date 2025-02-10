import React from 'react';
import { Image, useImage } from "@shopify/react-native-skia";
import Animated from 'react-native-reanimated';

const ImageElement = React.memo(({ element, animatedStyle }) => {
  const image = useImage(element.uri);
  if (!image) return null;

  return (
    <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
      <Image
        image={image}
        x={element.position.x}
        y={element.position.y}
        width={element.width}
        height={element.height}
        fit="contain"
      />
    </Animated.View>
  );
});

export default ImageElement; 