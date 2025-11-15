import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { resourcesAPI } from '../services/api';

interface Resource {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
}

const RESOURCES_STORAGE_KEY = 'uploaded_resources';

export default function ResourcesScreen({ navigation }: any) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [selectedFilterSubject, setSelectedFilterSubject] = useState('All');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const subjects = ['Math', 'Science', 'English', 'Social', 'Computer', 'Agriculture', 'GK', 'Hindi'];
  const filterOptions = ['All', ...subjects];

  const loadResources = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch resources from API
      const response = await resourcesAPI.getAll();
      
      if (response.data) {
        const apiResources = response.data.map((resource: any) => ({
          id: String(resource.id),
          title: resource.title,
          subject: resource.subject,
          description: resource.description,
          fileName: resource.file_name,
        }));
        setResources(apiResources);
        // Filter to show all by default
        setFilteredResources(apiResources);
      } else {
        // Fallback to local storage if API fails
        const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
        if (savedResources) {
          const parsed = JSON.parse(savedResources);
          setResources(parsed);
          setFilteredResources(parsed);
        } else {
          setResources([]);
          setFilteredResources([]);
        }
      }
    } catch (error) {
      console.log('Error loading resources:', error);
      // Fallback to local storage
      try {
        const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
        if (savedResources) {
          const parsed = JSON.parse(savedResources);
          setResources(parsed);
          setFilteredResources(parsed);
        } else {
          setResources([]);
          setFilteredResources([]);
        }
      } catch (storageError) {
        console.log('Error loading from storage:', storageError);
        setResources([]);
        setFilteredResources([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  useFocusEffect(
    useCallback(() => {
      loadResources();
    }, [loadResources])
  );

  const handleFilterChange = (subject: string) => {
    setSelectedFilterSubject(subject);
    if (subject === 'All') {
      setFilteredResources(resources);
    } else {
      setFilteredResources(resources.filter(r => r.subject === subject));
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Validation Error', 'Please enter a description');
      return;
    }
    if (!selectedFile) {
      Alert.alert('Validation Error', 'Please select a PDF file');
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('subject', selectedSubject);
      formData.append('pdf', {
        uri: selectedFile.uri,
        name: selectedFile.name,
        type: 'application/pdf',
      } as any);

      // Upload to API
      const response = await resourcesAPI.uploadPDF(formData);

      if (response.error) {
        Alert.alert('Upload Error', response.error);
        setIsUploading(false);
        return;
      }

      // Create new resource object
      const newResource: Resource = {
        id: String(response.data?.resourceId || Date.now()),
        title,
        subject: selectedSubject,
        description,
        fileName: selectedFile.name,
      };

      // Save to local storage
      try {
        const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
        let existingResources: Resource[] = [];
        if (savedResources) {
          existingResources = JSON.parse(savedResources);
        }
        
        const allResources = [...existingResources, newResource];
        await AsyncStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(allResources));
      } catch (storageError) {
        console.log('Error saving to storage:', storageError);
      }

      // Update UI
      const updatedResources = [...resources, newResource];
      setResources(updatedResources);
      
      // Apply filter to updated resources
      if (selectedFilterSubject === 'All') {
        setFilteredResources(updatedResources);
      } else {
        setFilteredResources(updatedResources.filter(r => r.subject === selectedFilterSubject));
      }

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedFile(null);
      setSelectedSubject('Math');
      setShowUploadDialog(false);

      Alert.alert('Success', 'Resource uploaded successfully!');
    } catch (err) {
      Alert.alert('Error', 'Failed to upload resource');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelDialog = () => {
    setShowUploadDialog(false);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setSelectedSubject('Math');
  };

  return (
    <View style={styles.container}>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loaderText}>Loading resources...</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Learning Resources</Text>
            <Text style={styles.body}>
              Curated lessons, PDFs, and short videos suited for low-bandwidth
              environments. Tap an item to open details.
            </Text>

            {/* Subject Filter */}
            <View style={styles.filterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {filterOptions.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.filterButton,
                      selectedFilterSubject === subject && styles.filterButtonActive,
                    ]}
                    onPress={() => handleFilterChange(subject)}
                  >
                    <Text
                      style={[
                        styles.filterButtonText,
                        selectedFilterSubject === subject && styles.filterButtonTextActive,
                      ]}
                    >
                      {subject}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {filteredResources.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No resources found for {selectedFilterSubject}
                </Text>
              </View>
            ) : (
              filteredResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  style={styles.card}
                  onPress={() => { /* open resource */ }}
                >
                  <Text style={styles.cardTitle}>{resource.title}</Text>
                  <Text style={styles.cardSubject}>{resource.subject}</Text>
                  <Text style={styles.cardDescription}>{resource.description}</Text>
                  <Text style={styles.cardSubtitle}>PDF · {resource.fileName}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* Floating Upload Button Above Tab */}
          <TouchableOpacity
            style={styles.floatingUploadButton}
            onPress={() => setShowUploadDialog(true)}
          >
            <Text style={styles.floatingUploadButtonText}>+ Upload Resource</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Upload Dialog Modal */}
      <Modal
        visible={showUploadDialog}
        transparent
        animationType="slide"
        onRequestClose={handleCancelDialog}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent} bounces={false}>
            <Text style={styles.modalTitle}>Upload Resource</Text>

            {/* Subject Selection */}
            <Text style={styles.label}>Subject</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedSubject}
                onValueChange={(itemValue) => setSelectedSubject(itemValue)}
              >
                {subjects.map((subject) => (
                  <Picker.Item key={subject} label={subject} value={subject} />
                ))}
              </Picker>
            </View>

            {/* Title Input */}
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter resource title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
            />

            {/* Description Input */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              placeholder="Enter resource description"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor="#999"
            />

            {/* PDF Upload */}
            <Text style={styles.label}>PDF File</Text>
            <TouchableOpacity
              style={styles.filePickerButton}
              onPress={handlePickDocument}
            >
              <Text style={styles.filePickerButtonText}>
                {selectedFile ? selectedFile.name : 'Select PDF File'}
              </Text>
            </TouchableOpacity>

            {selectedFile && (
              <Text style={styles.selectedFileName}>
                ✓ Selected: {selectedFile.name}
              </Text>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={handleCancelDialog}
                disabled={isUploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.uploadActionButton]}
                onPress={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.uploadActionButtonText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.modalBottomPadding} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    marginBottom: 12,
    color: '#555',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterScroll: {
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardSubject: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4CAF50',
    marginTop: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },
  floatingUploadButton: {
    position: 'absolute',
    bottom: 70,
    left: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  floatingUploadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '90%',
  },
  modalBottomPadding: {
    height: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  descriptionInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  filePickerButton: {
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#f0f8f0',
    alignItems: 'center',
    marginBottom: 8,
  },
  filePickerButtonText: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 14,
  },
  selectedFileName: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  uploadActionButton: {
    backgroundColor: '#4CAF50',
  },
  uploadActionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
