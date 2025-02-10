import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { Button, Card, Title, Avatar, Appbar, ActivityIndicator } from 'react-native-paper';
import { useAuth, useTemplateStore } from '../store';

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { templates, loading, error, fetchTemplates } = useTemplateStore();
console.log(templates, loading, error)
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        await fetchTemplates();
      } catch (err) {
        console.error('Failed to fetch templates:', err.message);
      }
    };
    loadTemplates();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderTemplate = ({ item }) => (
    <Card style={styles.card}>
      <Card.Cover source={{ uri: item.preview }} />
      <Card.Title title={item.name} />
      <Card.Actions>
        <Button onPress={() => navigation.navigate('Editor', { template: item })}>
          Use Template
        </Button>
      </Card.Actions>
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
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title={`Welcome, ${user?.name || 'Guest'}`} />
        <Appbar.Action icon="logout" onPress={handleLogout} />
      </Appbar.Header>

      {error ? (
        <View style={styles.centered}>
          <Text style={styles.error}>Error: {error}</Text>
          <Button mode="contained" onPress={fetchTemplates} style={styles.retryButton}>
            Retry
          </Button>
        </View>
      ) : (
        <>
          <Title style={styles.title}>Choose a Template</Title>
          <FlatList
            data={templates}
            renderItem={renderTemplate}
            keyExtractor={item => item.id}
            numColumns={2}
          />
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Editor', { template: null })}
            style={styles.blankButton}
          >
            Start from Blank
          </Button>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginVertical: 16,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    margin: 8,
  },
  blankButton: {
    margin: 16,
  },
  retryButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    margin: 16,
    fontSize: 16,
  },
});

export default HomeScreen; 