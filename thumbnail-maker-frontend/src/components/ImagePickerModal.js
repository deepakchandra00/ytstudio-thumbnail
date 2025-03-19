import React, { useState, useEffect } from 'react';
import { Dialog, Portal, Button, IconButton, useTheme } from 'react-native-paper';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'https://thumbnail-maker-one.vercel.app/api/stickers';
const AWS_BASE_URL = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/200x200/';
const AWS_BASE_URL_BIG = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/';
const folderNames = ['import', 'general', 'game'];
const ITEMS_PER_PAGE = 20;

const ImagePickerModal = ({ show, handleClose, onPickBackground, onSetBackground }) => {
    const [activeTab, setActiveTab] = useState(folderNames[0]);
    const [backgroundImages, setBackgroundImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [nextToken, setNextToken] = useState(null);
    const theme = useTheme();

    const fetchBackgroundImages = async (folder, isInitialLoad = false) => {
        if (loading || (!hasMore && !isInitialLoad)) return;

        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}`, {
                params: {
                    folder: `background/${folder}`,
                    limit: ITEMS_PER_PAGE,
                    token: nextToken,
                }
            });

            console.log(response, 'response');

            let newImages = [];
            let newToken = null;
            let isTruncated = false;

            if (response.data && Array.isArray(response.data)) {
                newImages = response.data.images.map(item => item.key || item);
                setBackgroundImages(newImages);
                console.log(newImages, "newImages");
                isTruncated = newImages.length === ITEMS_PER_PAGE;
            } else if (response.data && response.data.images) {
                newImages = response.data.images;
                newToken = response.data.nextToken;
                isTruncated = response.data.isTruncated;
            }

            if (isInitialLoad) {
                setBackgroundImages(newImages);
            } else {
                // Remove duplicates
                setBackgroundImages(prevImages => {
                    const imageSet = new Set(prevImages);
                    newImages.forEach(img => imageSet.add(img));
                    return Array.from(imageSet);
                });
            }

            setNextToken(newToken);
            setHasMore(isTruncated);
        } catch (error) {
            console.error('Error fetching background images:', error);
            if (isInitialLoad) {
                setBackgroundImages([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setNextToken(null);
        setHasMore(true);
        setBackgroundImages([]);
        fetchBackgroundImages(activeTab, true);
    }, [activeTab]);

    const handleImageUpload = async (image) => {
        console.log('Image uploaded:', image);
    };

    const renderImageItem = ({ item }) => (
        <TouchableOpacity 
            onPress={() => onSetBackground(AWS_BASE_URL_BIG + item.key)}
            style={styles.imageWrapper}
        >{console.log(item, "item")}
            <Image 
                source={{ uri: AWS_BASE_URL + item.key }} 
                style={styles.image}
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            {loading && <ActivityIndicator size="large" color={theme.colors.primary} />}
            {!hasMore && backgroundImages.length > 0 && (
                <Text style={styles.noMoreText}>No more images</Text>
            )}
        </View>
    );

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            fetchBackgroundImages(activeTab);
        }
    };

    console.log(backgroundImages, "backgroundImages");

    return (
        <Portal>
            <Dialog visible={show} onDismiss={handleClose} style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Dialog.Title style={styles.modalTitle}>Select Image</Dialog.Title>
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={handleClose}
                        style={styles.closeButton}
                    />
                </View>
                <Dialog.Content style={styles.dialogContent}>
                    <View style={styles.contentContainer}>
                        <View style={styles.tabContainer}>
                            {folderNames.map((folder) => (
                                <TouchableOpacity 
                                    key={folder} 
                                    onPress={() => setActiveTab(folder)} 
                                    style={[
                                        styles.tabButton,
                                        activeTab === folder && styles.activeTabButton
                                    ]}
                                >
                                    <Text style={[
                                        styles.tabText,
                                        activeTab === folder && styles.activeTabText
                                    ]}>
                                        {folder}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {activeTab === 'import' && (
                            <View style={styles.uploadContainer}>
                                <TouchableOpacity 
                                    style={styles.uploadButton}
                                    onPress={() => handleImageUpload('camera_image_path_here')}
                                >
                                    <IconButton
                                        icon="camera"
                                        size={30}
                                        iconColor={theme.colors.primary}
                                    />
                                    <Text style={styles.uploadText}>Camera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.uploadButton}
                                    onPress={onPickBackground}
                                >
                                    <IconButton
                                        icon="image"
                                        size={30}
                                        iconColor={theme.colors.primary}
                                    />
                                    <Text style={styles.uploadText}>Gallery</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        <FlatList
                            data={backgroundImages}
                            renderItem={renderImageItem}
                            keyExtractor={(item, index) => `${item}-${index}`}
                            numColumns={4}
                            contentContainerStyle={styles.imageContainer}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                        />
                    </View>
                </Dialog.Content>
            </Dialog>
        </Portal>
    );
};

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 4;

const styles = StyleSheet.create({
    modalContainer: {
        height: '80%',
        width: '100%',
        alignSelf: 'center',
        borderRadius: 20,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    closeButton: {
        margin: 0,
    },
    dialogContent: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    contentContainer: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#f5f5f5',
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 20,
    },
    activeTabButton: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabText: {
        fontSize: 14,
        color: '#666',
        textTransform: 'capitalize',
    },
    activeTabText: {
        color: '#000',
        fontWeight: '600',
    },
    uploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 16,
        backgroundColor: '#fff',
    },
    uploadButton: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#f8f8f8',
    },
    uploadText: {
        marginTop: 4,
        fontSize: 12,
        color: '#666',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        padding: 8,
        backgroundColor: '#fff',
    },
    imageWrapper: {
        width: imageSize,
        height: imageSize,
        margin: 4,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    footerContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noMoreText: {
        color: '#666',
        fontSize: 14,
        marginTop: 10,
    },
});

export default ImagePickerModal;