import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { Button, Card, Title, Appbar, ActivityIndicator } from 'react-native-paper';
import { useAuth, useTemplateStore } from '../store';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { templates, loading, error, fetchTemplates } = useTemplateStore();
  const [categorizedTemplates, setCategorizedTemplates] = useState({});

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

  useEffect(() => {
    if (templates && templates.length > 0) {
      const categorized = templates.reduce((acc, template) => {
        const category = template.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(template);
        return acc;
      }, {});
      setCategorizedTemplates(categorized);
    }
  }, [templates]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.replace('Auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderTemplate = ({ item }) => {
    const cardWidth = width * 0.5;
    const cardHeight = cardWidth * (9/16);
    const originalHeight = 200; // Original template height
    const originalWidth = 356; // Assuming original width was around 356px
    const heightRatio = cardHeight / originalHeight;
    const widthRatio = cardWidth / originalWidth;
  
    return (
      <TouchableOpacity 
        key={item.id}
        style={[styles.card, { width: cardWidth }]} 
        onPress={() => navigation.navigate('Editor', { template: { ...item } })}
      >
        <View style={{ position: 'relative', height: cardHeight }}>
          <Card.Cover 
            source={{ uri: item.backgroundImage || item.preview }} 
            style={{ 
              height: '100%', 
              width: '100%', 
              aspectRatio: 16/9 
            }} 
          />
          {item.elements && item.elements.map((element, index) => {
            if (element.type === 'text') {
              // Scale font size proportionally to the card height
              const scaledFontSize = element.size * heightRatio;
              
              // Adjust position based on both height and width ratios
              // Ensure elements stay within 0-100% range
              const adjustedX = Math.min(Math.max(element.position.x * widthRatio, 0), 100);
              const adjustedY = Math.min(Math.max(element.position.y * heightRatio, 0), 100);
              
              return (
                <Text
                  key={`${item.id}-element-${index}`}
                  style={{
                    position: 'absolute',
                    left: `${adjustedX}%`,
                    top: `${adjustedY}%`,
                    color: element.color,
                    fontSize: scaledFontSize,
                    fontFamily: element.font,
                    fontWeight: element.fontStyle === 'bold' ? 'bold' : 'normal',
                    textAlign: element.alignment,
                    zIndex: element.zIndex,
                    maxWidth: '90%', // Prevent text from overflowing
                    overflow: 'hidden',
                  }}
                  numberOfLines={2} // Limit to 2 lines to prevent overflow
                  ellipsizeMode="tail"
                >
                  {element.content}
                </Text>
              );
            }
            return null;
          })}
        </View>
      </TouchableOpacity>
    );
  };

  const CategorySlider = ({ category, templates }) => (
    <View style={styles.categoryContainer}>
      <Title style={styles.categoryTitle}>{category}</Title>
      <FlatList
        data={templates}
        renderItem={renderTemplate}
        keyExtractor={(item) => `${category}-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
        snapToAlignment="start"
        snapToInterval={width * 0.5}
        decelerationRate="fast"
      />
    </View>
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
        <ScrollView>
          {Object.entries(categorizedTemplates).map(([category, categoryTemplates]) => (
            <CategorySlider 
              key={category} 
              category={category} 
              templates={categoryTemplates} 
            />
          ))}
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Editor', { template: {} })}
            style={styles.blankButton}
          >
            Start from Blank
          </Button>
        </ScrollView>
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
  categoryContainer: {
    marginVertical: 10,
  },
  categoryTitle: {
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  horizontalList: {
    paddingHorizontal: 10,
  },
  card: {
    width: width * 0.5,
    padding: 5,
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