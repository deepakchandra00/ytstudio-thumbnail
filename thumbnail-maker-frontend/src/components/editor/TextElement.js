import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Group, Text, matchFont, Circle, Rect } from "@shopify/react-native-skia";
import { GestureHandler } from './GestureHandler';

const TextElement = ({
  element,
  isSelected,
  onSelect,
  onDrag,
  onRotate,
  isDragging,
  setIsDragging
}) => {
  const fontStyle = {
    fontFamily: Platform.select({ ios: "Helvetica", default: "sans-serif" }),
    fontSize: element.size || 20,
    fontWeight: "normal"
  };
  
  const font = matchFont(fontStyle);

  if (!font || !element.content) {
    return null;
  }

  const size = {
    width: element.width || 300,
    height: element.height || 100,
  };

  return (
    <View style={{ position: 'absolute', left: 0, top: 0 }}>
      <GestureHandler
        position={element.position}
        size={size}
        onDragStart={() => {
          setIsDragging(true);
          onSelect();
        }}
        onDragEnd={(newPosition) => {
          setIsDragging(false);
          onDrag(newPosition);
        }}
      >
        <Group>
          <Text
            x={0}
            y={fontStyle.fontSize}
            text={element.content}
            font={font}
            color={element.color || "black"}
          />
          
          {isSelected && (
            <>
              <Group
                style="stroke"
                color="#007AFF"
                strokeWidth={1}
                strokeDash={[5, 5]}
              >
                <Rect 
                  x={-5} 
                  y={-fontStyle.fontSize} 
                  width={size.width + 10} 
                  height={size.height + 10} 
                />
              </Group>
              
              <Circle 
                cx={size.width + 20} 
                cy={size.height / 2} 
                r={10} 
                color="#007AFF" 
              />
            </>
          )}
        </Group>
      </GestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default TextElement; 