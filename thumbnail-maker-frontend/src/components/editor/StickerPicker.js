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
} from 'react-native';
import { IconButton, Surface, Title, Portal, Modal } from 'react-native-paper';
import getEnvVars from '../../config/constants';
import ImageElement from './ImageElement';

const STICKER_BASE_URL = 'https://youtube-thumbnail.s3.us-east-1.amazonaws.com/element/';

const StickerItem = React.memo(({ sticker, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.stickerButton}
      onPress={onPress}
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { apiUrl } = getEnvVars();

  useEffect(() => {
    if (visible) {
      fetchStickers();
    }
  }, [visible]);

  const fetchStickers = async () => {
    try {
      setLoading(true);
      setError(null);

      const stickerUrl = `${apiUrl}/stickers`;
      console.log('Fetching from:', stickerUrl);

      const response = await fetch(stickerUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const stickerList = await response.json();
      if (!Array.isArray(stickerList)) {
        throw new Error('Invalid data format received');
      }

      setStickers(stickerList);
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Failed to load stickers. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredStickers = useMemo(() => {
    return stickers.filter(sticker =>
      sticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [stickers, searchQuery]);

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onClose}
        contentContainerStyle={styles.modalContainer}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={onClose}
          >
            <TouchableOpacity 
              activeOpacity={1} 
            >
              <Surface style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                  <Title style={styles.headerTitle}>Stickers</Title>
                  <TouchableOpacity 
                    onPress={onClose} 
                    style={styles.closeButton}
                  >
                    <IconButton icon="close" size={20} />
                  </TouchableOpacity>
                </View>

                {/* Search Bar */}
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
                            width: 50,
                            height: 50,
                            rotation: 0,
                            scale: 1,
                            zIndex: Date.now(),
                            originalWidth: 50,
                            originalHeight: 50,
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
              </Surface>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
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
