import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from "./src/store";
import SplashScreen from './src/screens/SplashScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import EditorScreen from './src/screens/EditorScreen';

const Stack = createNativeStackNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac4',
  },
};

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="Splash" 
            component={SplashScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ title: 'YouTube Thumbnail Maker' }}
          />
          <Stack.Screen 
            name="Editor" 
            component={EditorScreen} 
            options={{ title: 'Edit Thumbnail' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
