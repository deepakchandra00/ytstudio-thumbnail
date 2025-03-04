import React, { useState, useEffect } from 'react';
import { Dialog, Portal, Button, IconButton } from 'react-native-paper';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
  } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.29.102:5000/api/stickers';
const AWS_BASE_URL = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/200x200/';
const AWS_BASE_URL_BIG = 'https://d27ilrqyrhzjlu.cloudfront.net/fit-in/';
const folderNames = ['import', 'general', 'game'];

const ImagePickerModal = ({ show, handleClose, onPickBackground, onSetBackground }) => {
    const [activeTab, setActiveTab] = useState(folderNames[0]); // Default to the first folder
    const [backgroundImages, setBackgroundImages] = useState([]);

    const fetchBackgroundImages = async (folder) => {
        try {
            const response = await axios.get(`${API_BASE_URL}?folder=background/${folder}&limit=20`);
            const bgDataKeys = response.data.map(item => item.Key);
            setBackgroundImages(bgDataKeys);
            console.log(bgDataKeys, 'responsewa');
        } catch (error) {
            console.error('Error fetching background images:', error);
        }
    };

    useEffect(() => {
        fetchBackgroundImages(activeTab); // Fetch images for the selected folder
    }, [activeTab]);

    const handleImageUpload = async (image) => {
        // Logic to handle image upload
        console.log('Image uploaded:', image);
    };

    return (
        <Portal>
            <Dialog visible={show} onDismiss={handleClose} style={styles.modalContainer}>
                <Dialog.Title>Select Image</Dialog.Title>
                <Dialog.Content>
                    <View>
                        <View style={styles.tabContainer}>
                            {folderNames.map((folder) => (
                                <TouchableOpacity key={folder} onPress={() => setActiveTab(folder)} style={styles.tabButton}>
                                    <Text style={[activeTab === folder ? styles.activeTab : styles.inactiveTab, styles.capitalizeText]}>
                                        {folder}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {activeTab === 'import' && (
                            <View style={styles.uploadContainer}>
                                <IconButton
                                    icon="camera"
                                    size={30}
                                    onPress={() => handleImageUpload('camera_image_path_here')}
                                />
                                <IconButton
                                    icon="image"
                                    size={30}
                                    onPress={onPickBackground}
                                />
                            </View>
                        )}
                        <View style={styles.imageContainer}>
                            {backgroundImages.map((img, index) => (
                                <TouchableOpacity key={index} onPress={() => onSetBackground(AWS_BASE_URL_BIG + img)}>
                                    <Image source={{ uri: AWS_BASE_URL + img }} style={styles.image} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={handleClose}>Close</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        height: '80%', // Limit modal height
        maxHeight: 600,
        width: '95%',
        alignSelf: 'center',
        borderRadius: 15,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        margin: 0,
    },
    dialogContent: {
        flex: 1,
        paddingHorizontal: 0,
        paddingVertical: 0,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    tabButton: {
        marginRight: 20,
    },
    activeTab: {
        fontWeight: 'bold',
    },
    inactiveTab: {
        fontWeight: 'normal',
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    image: {
        width: 70,
        height: 70,
        margin: 5,
    },
    uploadContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 10,
    },
    capitalizeText: {
        textTransform: 'capitalize',
    },
});

export default ImagePickerModal;