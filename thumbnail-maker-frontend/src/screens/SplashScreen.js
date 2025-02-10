import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../store';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const { checkAuth } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      // Start fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();

      // Check for existing authentication
      const isAuthenticated = await checkAuth();

      // Wait for minimum splash screen duration
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate based on auth status
      navigation.replace(isAuthenticated ? 'Home' : 'Auth');
    };

    initialize();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>YT</Text>
        </View>
        <Text style={styles.title}>YouTube Thumbnail Maker</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#ffffff20',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default SplashScreen; 