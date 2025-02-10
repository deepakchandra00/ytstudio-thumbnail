import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Surface, Portal, Modal, Divider } from 'react-native-paper';
import { useAuth } from '../store';

const DEFAULT_CREDENTIALS = {
  email: "deepak@example.com",
  password: "deepak@123",
};

const AuthScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('deepak@example.com');
  const [password, setPassword] = useState('deepak@123');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const auth = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await auth.login(email, password);
        navigation.replace('Home');
      } else {
        await auth.register(name, email, password);
        navigation.replace('Home');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await auth.login(DEFAULT_CREDENTIALS.email, DEFAULT_CREDENTIALS.password);
      navigation.replace('Home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface}>
          <Text style={styles.title}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          
          {!isLogin && (
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
              mode="outlined"
            />
          )}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
          
          {error ? <Text style={styles.error}>{error}</Text> : null}
          
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          >
            {isLogin ? 'Login' : 'Register'}
          </Button>
          
          {isLogin && (
            <>
              <Divider style={styles.divider} />
              <Button
                mode="outlined"
                onPress={handleDemoLogin}
                loading={loading}
                style={styles.demoButton}
              >
                Try Demo Account
              </Button>
              <Text style={styles.demoText}>
                Email: {DEFAULT_CREDENTIALS.email}
                {'\n'}
                Password: {DEFAULT_CREDENTIALS.password}
              </Text>
            </>
          )}
          
          <Button
            onPress={() => setIsLogin(!isLogin)}
            style={styles.switchButton}
          >
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  surface: {
    padding: 24,
    borderRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 8,
  },
  switchButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  divider: {
    marginVertical: 16,
  },
  demoButton: {
    marginBottom: 8,
  },
  demoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default AuthScreen; 