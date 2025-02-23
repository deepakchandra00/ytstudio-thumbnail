import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { IconButton, Surface, Title, } from 'react-native-paper';
import getEnvVars from '../../config/constants';
import ImageElement from './ImageElement';

const STICKER_BASE_URL = 'https://youtube-thumbnail.s3.us-east-1.amazonaws.com/';
const folderNames = ['Frames', 'element', 'female-model', 'festival', 'other'];

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};

const StickerItem = React.memo(({ sticker, onPress }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <TouchableOpacity 
      style={[styles.stickerButton, isHovered && styles.hoveredSticker]}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImageElement
        element={{
          type: 'image',
          uri: `${STICKER_BASE_URL}${sticker}`,
          position: { x: 0, y: 0 },
          width: Dimensions.get('window').width / 6 - 32,
          height: Dimensions.get('window').width / 6 - 32,
        }}
        isPreview={true}
        containerStyle={styles.stickerImage}
      />
    </TouchableOpacity>
  );
});

const StickerPicker = ({ visible, onClose, onSelectSticker }) => {
  const [stickers, setStickers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(folderNames[0]);
  const [continuationToken, setContinuationToken] = useState('');

  const { apiUrl } = getEnvVars();

  useEffect(() => {
    if (visible) {
      fetchStickers();
    }
  }, [visible, activeTab]);

  const fetchStickers = async (continuationToken = '') => {
    try {
      setLoading(true);
      setError(null);

      const stickerUrl = `${apiUrl}/stickers?folder=element/${activeTab}&limit=30${continuationToken ? `&continuationToken=${continuationToken}` : ''}`;
      console.log('Fetching from:', stickerUrl);

      const response = await fetch(stickerUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const stickerList = await response.json();
      if (!Array.isArray(stickerList)) {
        throw new Error('Invalid data format received');
      }
console.log(stickerList, 'responsewa');
      const stickerKeys = stickerList.map(item => item.Key);
      setStickers(stickerKeys);
      setContinuationToken(stickerList.continuationToken); // Assuming the API returns a continuation token
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load stickers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (folderName) => {
    setActiveTab(folderName);
  };

  const filteredStickers = useMemo(() => {
    return stickers.filter(sticker =>
      sticker.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [stickers, debouncedSearchQuery]);

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
      // Load more stickers when scrolled to the bottom
      if (continuationToken) {
        fetchStickers(continuationToken);
      }
    }
  };

  return (
    <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
      <SafeAreaView style={styles.safeArea}>
        <Surface style={styles.container}>
          <View style={styles.header}>
            <Title style={styles.headerTitle}>Stickers</Title>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <IconButton icon="close" size={20} />
            </TouchableOpacity>
          </View>
          <View style={styles.tabsContainer}>
            {folderNames.map((folderName) => (
              <TouchableOpacity
                key={folderName}
                onPress={() => handleTabClick(folderName)}
                style={[styles.tabButton, activeTab === folderName ? styles.activeTab : null]}
              >
                <Text style={styles.tabText}>{folderName}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.searchContainer}>
            <IconButton icon="magnify" size={18} style={styles.searchIcon} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stickers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}> 
                <IconButton icon="close-circle" size={16} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
            {/* Loading & Error States */}
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="small" color="#666" />
                <Text style={styles.loadingText}>Loading stickers...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.stickersGrid}>
                {filteredStickers.map((sticker, index) => (
                  <StickerItem 
                    key={index}
                    sticker={sticker}
                    onPress={() => {
                      const stickerElement = { 
                        type: 'image',
                        uri: `${STICKER_BASE_URL}${sticker}`,
                        position: {
                          x: Dimensions.get('window').width / 2 - 75,
                          y: Dimensions.get('window').height / 2 - 75,
                        },
                        width: 200,
                        height: 200,
                        rotation: 0,
                        scale: 1,
                        zIndex: Date.now(),
                        originalWidth: 200,
                        originalHeight: 200,
                        id: `sticker-${Date.now()}`,
                        isSelected: true,
                      };
                      onSelectSticker(stickerElement);
                      onClose();
                    }}
                  />
                ))}
                {filteredStickers.length === 0 && (
                  <View style={styles.noResultsContainer}>
                    <IconButton icon="sticker-remove" size={48} />
                    <Text style={styles.noResultsText}>
                      {searchQuery ? 'No stickers found' : 'No stickers available'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </Surface>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '85%',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    width: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  tabText: {
    fontSize: 16,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#333',
    paddingHorizontal: 8,
  },
  searchIcon: {
    margin: 0,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  stickerButton: {
    width: Dimensions.get('window').width / 6 - 10,
    height: Dimensions.get('window').width / 6 - 10,
    margin: 6,
    borderRadius: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stickerImage: {
    width: '100%',
    height: '100%',
  },
  hoveredSticker: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  centerContent: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 14,
  },
  errorText: {
    color: '#ff4444',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 14,
  },
  noResultsContainer: {
    width: '100%',
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default StickerPicker;