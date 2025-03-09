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
  Image,
  Animated,
} from 'react-native';
import { IconButton, Surface, Title, useTheme } from 'react-native-paper';
import getEnvVars from '../../config/constants';
import axios from 'axios';

const STICKER_BASE_URL = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/100x100/';
const STICKER_BASE_URL_BIG = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/';

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

const StickerItem = React.memo(({ sticker, onPress, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity 
        style={[styles.stickerButton, isHovered && styles.hoveredSticker]}
        onPress={onPress}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image 
          source={{ uri: STICKER_BASE_URL + sticker }} 
          style={styles.stickerImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </Animated.View>
  );
});

const StickerPicker = ({ visible, onClose, onSelectSticker }) => {
  const [stickers, setStickers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(folderNames[0]);
  const [continuationToken, setContinuationToken] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const theme = useTheme();

  const { apiUrl } = getEnvVars();

  useEffect(() => {
    if (visible) {
      setStickers([]);
      setContinuationToken('');
      setHasMore(true);
      fetchStickers();
    }
  }, [visible, activeTab]);

  const fetchStickers = async (continuationToken = '') => {
    try {
      if (continuationToken) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await axios.get(`${apiUrl}/stickers`, {
        params: {
          folder: `elements/${activeTab}`,
          limit: 20,
          token: continuationToken || undefined
        }
      });

      if (response.data && response.data.images) {
        const newStickers = response.data.images.map(item => item.key);
        
        setStickers(prev => continuationToken ? [...prev, ...newStickers] : newStickers);
        setContinuationToken(response.data.nextToken);
        setHasMore(response.data.isTruncated);
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load stickers. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
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
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && hasMore && !loadingMore) {
      fetchStickers(continuationToken);
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
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScrollView}
          >
            <View style={styles.tabsContainer}>
              {folderNames.map((folderName) => (
                <TouchableOpacity
                  key={folderName}
                  onPress={() => handleTabClick(folderName)}
                  style={[
                    styles.tabButton,
                    activeTab === folderName && styles.activeTab
                  ]}
                >
                  <Text style={[
                    styles.tabText,
                    activeTab === folderName && styles.activeTabText
                  ]}>
                    {folderName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
          <ScrollView 
            onScroll={handleScroll} 
            scrollEventThrottle={16}
            contentContainerStyle={styles.scrollContent}
          >
            {loading ? (
              <View style={styles.centerContent}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Loading stickers...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerContent}>
                <IconButton icon="alert-circle" size={48} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : (
              <View style={styles.stickersGrid}>
                {filteredStickers.map((sticker, index) => (
                  <StickerItem 
                    key={index}
                    sticker={sticker}
                    index={index}
                    onPress={() => {
                      const stickerElement = { 
                        type: 'image',
                        uri: `${STICKER_BASE_URL_BIG}${sticker}`,
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
                    <IconButton icon="sticker-remove" size={48} color="#666" />
                    <Text style={styles.noResultsText}>
                      {searchQuery ? 'No stickers found' : 'No stickers available'}
                    </Text>
                  </View>
                )}
                {loadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                    <Text style={styles.loadingMoreText}>Loading more...</Text>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  tabsScrollView: {
    maxHeight: 50,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
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
  scrollContent: {
    flexGrow: 1,
  },
  stickersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  stickerButton: {
    width: Dimensions.get('window').width / 6 - 16,
    height: Dimensions.get('window').width / 6 - 16,
    margin: 8,
    borderRadius: 12,
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
    transform: [{ scale: 1.05 }],
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
  loadingMoreContainer: {
    width: '100%',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
});

export default StickerPicker;