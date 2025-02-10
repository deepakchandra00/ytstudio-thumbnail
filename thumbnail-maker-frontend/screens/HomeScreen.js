import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Templates')}
        style={styles.button}
      >
        Create New Thumbnail
      </Button>
      <Button 
        mode="outlined" 
        onPress={() => navigation.navigate('Editor', { template: null })}
        style={styles.button}
      >
        Start from Scratch
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  button: {
    marginVertical: 10,
  },
}); 