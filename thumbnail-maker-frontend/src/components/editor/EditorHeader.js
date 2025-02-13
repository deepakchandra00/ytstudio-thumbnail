import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Surface, IconButton, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useEditorStore } from '../../store';

const EditorHeader = ({
  onPickBackground,
  elements,
  onRemoveElement,
  headerMenuVisible,
  setHeaderMenuVisible,
}) => {
  const navigation = useNavigation();
  const { history } = useEditorStore();

  const handleBack = () => {
    // Check if there are unsaved changes
    if (history.length > 0) {
      Alert.alert(
        'Unsaved Changes',
        'Are you sure you want to go back? Any unsaved changes will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Go Back',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <Surface style={styles.header}>
      <View style={styles.headerLeft}>
        <IconButton
          icon="arrow-left"
          mode="contained"
          onPress={handleBack}
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
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    elevation: 4,
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