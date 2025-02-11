import React, { useMemo } from 'react';
import { Image as SkiaImage, useImage } from "@shopify/react-native-skia";
import Animated from 'react-native-reanimated';
import { View } from 'react-native';

const ImageElement = React.memo(({ element, animatedStyle }) => {
  const image = useImage(element.uri);

  const renderImage = useMemo(() => {
    if (!image) {
      console.warn(`Failed to load image: ${element.uri}`);
      return null;
    }

    return (
      <SkiaImage
        image={image}
        x={element.position.x}
        y={element.position.y}
        width={element.width}
        height={element.height}
        fit="contain"
      />
    );
  }, [image, element]);

  return (
    <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
      {renderImage}
    </Animated.View>
  );
});

ImageElement.displayName = 'ImageElement';

export default ImageElement;