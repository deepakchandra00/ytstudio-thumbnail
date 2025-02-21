import React, { useCallback, useState, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle,
  runOnJS
} from 'react-native-reanimated';
import { Text, matchFont, Canvas, Path, Paint } from "@shopify/react-native-skia";
import { View, Platform } from 'react-native';
import TextFormatterWidget from './TextFormatterWidget';
import { GoogleFontsManager } from '../../utils/fontUtils';

const TextElement = ({ 
  element, 
  isSelected, 
  onSelect, 
  onDrag, 
  isDragging,
  setIsDragging,
  onUpdateTextStyle 
}) => {
  const [font, setFont] = useState(null);
  const [textColor, setTextColor] = useState(element.color || "#000000");
  const [textEffects, setTextEffects] = useState(element.effects || []);
  const [fontDetails, setFontDetails] = useState({
    fontName: element.fontName || 'Inter',
    fontWeight: element.fontWeight || 'normal',
    fontStyle: element.fontStyle || 'normal',
    textDecorationLine: element.textDecorationLine || 'none'
  });

  console.log('Initial Element:', JSON.stringify(element, null, 2));

  // Dynamic font loading
  useEffect(() => {
    const loadFont = async () => {
      try {
        // Determine font properties
        const isBold = textEffects.includes('Bold') || element.fontWeight === 'bold';
        const isItalic = textEffects.includes('Italic') || element.fontStyle === 'italic';
        const fontName = element.fontName || 'Inter';

        await GoogleFontsManager.loadGoogleFont(fontName);

        const fontStyle = {
          fontFamily: fontName,
          fontSize: element.size || 16,
          fontWeight: isBold ? 'bold' : 'normal',
          fontStyle: isItalic ? 'italic' : 'normal'
        };

        const matchedFont = matchFont(fontStyle);
        console.log('Matched Font Details:', {
          fontName,
          fontWeight: fontStyle.fontWeight,
          fontStyle: fontStyle.fontStyle
        });
        
        if (matchedFont) {
          setFont(matchedFont);
          setFontDetails(prev => ({
            ...prev,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal'
          }));
        }
      } catch (error) {
        console.error('Font loading error:', error);
      }
    };

    loadFont();
  }, [
    element.fontName, 
    element.size, 
    textEffects, 
    element.fontWeight, 
    element.fontStyle
  ]);

  // Determine text decoration based on effects
  const getTextDecoration = useCallback(() => {
    const hasUnderline = textEffects.includes('Underline') || element.textDecorationLine === 'underline';
    const hasStrikethrough = textEffects.includes('Strikethrough') || element.textDecorationLine === 'line-through';

    if (hasUnderline && hasStrikethrough) {
      return 'underline line-through';
    } else if (hasUnderline) {
      return 'underline';
    } else if (hasStrikethrough) {
      return 'line-through';
    }
    return 'none';
  }, [textEffects, element.textDecorationLine]);

  // Render custom underline if needed
  const renderUnderline = useCallback((textWidth, fontSize) => {
    const hasUnderline = textEffects.includes('Underline') || element.textDecorationLine === 'underline';
    
    if (!hasUnderline) return null;

    // Underline positioning slightly below the text baseline
    const underlineY = fontSize + 2;
    const underlinePath = `M0 ${underlineY} H${textWidth}`;

    return (
      <Path 
        path={underlinePath}
        style="stroke"
        strokeWidth={1.5}
        color={textColor}
      />
    );
  }, [textEffects, element.textDecorationLine, textColor]);

  // Handle text style update with comprehensive logging
  const handleTextStyleUpdate = useCallback((elementId, newStyle) => {
    console.group('TextElement Style Update');
    console.log('Current Element:', element);
    console.log('New Style:', newStyle);
    
    // Update color if provided
    if (newStyle.color) {
      setTextColor(newStyle.color);
    }

    // Update text effects
    if (newStyle.effects) {
      setTextEffects(newStyle.effects);
    }

    // Update font details
    const updatedFontDetails = {
      fontName: newStyle.fontName || fontDetails.fontName,
      fontWeight: newStyle.fontWeight || 
        (newStyle.effects?.includes('Bold') ? 'bold' : 'normal'),
      fontStyle: newStyle.fontStyle || 
        (newStyle.effects?.includes('Italic') ? 'italic' : 'normal'),
      textDecorationLine: newStyle.textDecorationLine || 
        getTextDecoration()
    };
    setFontDetails(updatedFontDetails);
    
    // Propagate style update to parent component
    if (onUpdateTextStyle) {
      onUpdateTextStyle(elementId, {
        ...element,
        ...newStyle,
        ...updatedFontDetails
      });
    }
    
    console.groupEnd();
  }, [element, fontDetails, getTextDecoration, onUpdateTextStyle]);

  // Add a shared value for rotation
  const rotation = useSharedValue(0);

  const position = useSharedValue({
    x: element.position.x,
    y: element.position.y
  });

  // Rotation gesture handler
  const rotationGesture = Gesture.Rotation()
  .onUpdate((event) => {
    // Convert radians to degrees
    rotation.value = event.rotation * (180 / Math.PI);
  });

  // Use worklet-compatible animated style
  const animatedStyle = useAnimatedStyle(() => {
    // More precise width calculation
    const contentLength = element.content.length;
    const fontSize = element.size;
    
    // Sophisticated width estimation
    const estimatedWidth = (() => {
      // Character width varies by font, so use a more dynamic approach
      // Different multipliers for different character types
      const baseMultipliers = {
        'normal': 0.55,   // Standard characters
        'wide': 0.7,      // Wide characters like 'W', 'M'
        'narrow': 0.4     // Narrow characters like 'I', 'l'
      };

      // Calculate average character width
      const averageCharWidth = fontSize * (
        baseMultipliers.normal * 0.6 + 
        baseMultipliers.wide * 0.2 + 
        baseMultipliers.narrow * 0.2
      );

      // Adjust for font weight and style
      const weightMultiplier = fontDetails.fontWeight === 'bold' ? 1.1 : 1;
      const styleMultiplier = fontDetails.fontStyle === 'italic' ? 1.05 : 1;

      // Final width calculation with padding
      return (averageCharWidth * contentLength * weightMultiplier * styleMultiplier) + 20;
    })();

    return {
      position: 'absolute',
      transform: [
        { translateX: position.value.x },
        { translateY: position.value.y },
        { rotate: `${rotation.value}deg` }
      ],
      width: estimatedWidth,
      height: fontSize * 1.5, // Slightly increased height
      // Add border when selected
      borderWidth: isSelected ? 1 : 0,
      borderColor: isSelected ? 'blue' : 'transparent',
      borderStyle: 'dashed'
    };
  }, [
    position, 
    rotation, 
    isSelected, 
    element.content, 
    element.size,
    fontDetails.fontWeight,
    fontDetails.fontStyle
  ]);

  const handleDragEnd = useCallback((x, y) => {
    if (onDrag) {
      onDrag({ x, y });
    }
  }, [onDrag]);

  const gesture = Gesture.Simultaneous(
    Gesture.Pan()
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
    .shouldCancelWhenOutside(true),
    rotationGesture
  )

  console.log('Rendering TextElement with font:', font);

  // Skip rendering if font is not loaded
  if (!font) {
    console.log('Font not loaded');
    return null;
  }

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[
            animatedStyle, 
            { 
              position: 'absolute'
            }
          ]}
        >
          <Canvas style={{ flex: 1 }}>
            <Text
              font={font}  // Use dynamically loaded font
              text={element.content}
              x={0}
              y={element.size}
              color={textColor}  // Use local state for color
            />
            {renderUnderline(
              element.size * element.content.length / 1.6, 
              element.size
            )}
          </Canvas>
        </Animated.View>
      </GestureDetector>
      {isSelected && (
        <TextFormatterWidget 
          selectedElement={{
            ...element,
            ...fontDetails
          }}
          onUpdateTextStyle={handleTextStyleUpdate}
        />
      )}
    </View>
  );
};

export default TextElement;