import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stage, Layer, Image, Text as KonvaText } from 'react-konva';
import { Button, TextInput } from 'react-native-paper';

export default function EditorScreen({ route, navigation }) {
  const { template } = route.params;
  const [elements, setElements] = useState(template?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);

  const handleElementChange = (index, changes) => {
    const newElements = [...elements];
    newElements[index] = { ...newElements[index], ...changes };
    setElements(newElements);
  };

  const addText = () => {
    setElements([
      ...elements,
      {
        type: 'text',
        text: 'New Text',
        x: 100,
        y: 100,
        fontSize: 20,
        fill: 'white',
      },
    ]);
  };

  const addImage = async () => {
    // Implementation for image picking and adding to canvas
  };

  return (
    <View style={styles.container}>
      <Stage width={1280} height={720}>
        <Layer>
          {elements.map((elem, index) => (
            elem.type === 'text' ? (
              <KonvaText
                key={index}
                {...elem}
                draggable
                onDragEnd={(e) => handleElementChange(index, {
                  x: e.target.x(),
                  y: e.target.y(),
                })}
                onClick={() => setSelectedElement(index)}
              />
            ) : (
              <Image
                key={index}
                {...elem}
                draggable
                onDragEnd={(e) => handleElementChange(index, {
                  x: e.target.x(),
                  y: e.target.y(),
                })}
                onClick={() => setSelectedElement(index)}
              />
            )
          ))}
        </Layer>
      </Stage>
      <View style={styles.toolbar}>
        <Button onPress={addText}>Add Text</Button>
        <Button onPress={addImage}>Add Image</Button>
        <Button onPress={() => {}}>Export</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-around',
  },
}); 