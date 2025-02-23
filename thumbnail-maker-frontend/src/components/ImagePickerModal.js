import React, { useState, useEffect } from 'react';
import { Dialog, Portal, Button} from 'react-native-paper';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Image,
  } from 'react-native';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.29.102:5000/api/stickers';
const AWS_BASE_URL = 'https://youtube-thumbnail.s3.us-east-1.amazonaws.com/';
const folderNames = ['background', 'game', 'upload'];

const ImagePickerModal = ({ show, handleClose, onPickBackground }) => {
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
                                    <Text style={activeTab === folder ? styles.activeTab : styles.inactiveTab}>{folder}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {activeTab === 'upload' && ( // Render upload input if 'upload' tab is active
                            <TouchableOpacity onPress={() => handleImageUpload('image_path_here')}>
                                <Text>Upload Image</Text>
                            </TouchableOpacity>
                        )}
                        <View style={styles.imageContainer}>
                            {backgroundImages.map((img, index) => (
                                <TouchableOpacity key={index} onPress={() => onPickBackground(AWS_BASE_URL + img)}>
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
        backgroundColor: 'white',
        margin: 20,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
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
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
    },
});

export default ImagePickerModal;