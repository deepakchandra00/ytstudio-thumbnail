import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, IconButton, Menu } from 'react-native-paper';

const EditorHeader = ({
  onBack,
  onPickBackground,
  elements,
  onRemoveElement,
  headerMenuVisible,
  setHeaderMenuVisible,
}) => (
  <Surface style={styles.header}>
    <View style={styles.headerLeft}>
      <IconButton
        icon="arrow-left"
        mode="contained"
        onPress={onBack}
      />
      <IconButton
        icon="image-area"
        mode="contained"
        onPress={onPickBackground}
      />
    </View>
    
    <View style={styles.headerRight}>
      <Menu
        visible={headerMenuVisible}
        onDismiss={() => setHeaderMenuVisible(false)}
        anchor={
          <IconButton
            icon="layers"
            mode="contained"
            onPress={() => setHeaderMenuVisible(true)}
          />
        }
      >
        {elements.map((element, index) => (
          <Menu.Item
            key={index}
            title={`${element.type} ${index + 1}`}
            right={() => (
              <IconButton
                icon="delete"
                size={20}
                onPress={() => {
                  onRemoveElement(index);
                  setHeaderMenuVisible(false);
                }}
              />
            )}
          />
        ))}
      </Menu>
    </View>
  </Surface>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    marginTop: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default EditorHeader; 