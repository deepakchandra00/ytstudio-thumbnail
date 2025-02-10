import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('authToken');
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export default function TemplatesScreen({ navigation }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/templates', {
        headers: {
          'Authorization': `Bearer ${await getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTemplate = ({ item }) => (
    <Card
      style={styles.card}
      onPress={() => navigation.navigate('Editor', { template: item })}
    >
      <Card.Cover source={{ uri: item.thumbnail }} />
      <Card.Content>
        <Title>{item.name}</Title>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <FlatList
      data={templates}
      renderItem={renderTemplate}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 