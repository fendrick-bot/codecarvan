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
interface Resource {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
}

const RESOURCES_STORAGE_KEY = 'uploaded_resources';

export default function ResourcesScreen({ navigation }: any) {
  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Basic Math: Number Sense',
      subject: 'Math',
      description: 'Learn the fundamentals of numbers and basic operations',
      fileName: 'math-basics.pdf',
    },
    {
      id: '2',
      title: 'Reading Practice: Short Stories',
      subject: 'English',
      description: 'Improve reading comprehension with engaging short stories',
      fileName: 'reading-stories.pdf',
    },
  ]);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const subjects = ['Math', 'Science', 'English', 'Social', 'Computer', 'Agriculture', 'GK', 'Hindi'];

  const loadResources = useCallback(async () => {
    try {
      const initialResources = [
        {
          id: '1',
          title: 'Basic Math: Number Sense',
          subject: 'Math',
          description: 'Learn the fundamentals of numbers and basic operations',
          fileName: 'math-basics.pdf',
        },
        {
          id: '2',
          title: 'Reading Practice: Short Stories',
          subject: 'English',
          description: 'Improve reading comprehension with engaging short stories',
          fileName: 'reading-stories.pdf',
        },
      ];
      
      const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
      if (savedResources) {
        const parsed = JSON.parse(savedResources);
        setResources([...initialResources, ...parsed]);
      } else {
        setResources(initialResources);
      }
    } catch (error) {
      console.log('Error loading resources:', error);
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
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newResource: Resource = {
        id: String(Date.now()),
        title,
        subject: selectedSubject,
        description,
        fileName: selectedFile.name,
      };

      const updatedResources = [...resources, newResource];
      setResources(updatedResources);

      // Save to AsyncStorage
      try {
        // Get existing saved resources
        const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
        let existingResources: Resource[] = [];
        if (savedResources) {
          existingResources = JSON.parse(savedResources);
        }
        
        // Add new resource and save
        const allResources = [...existingResources, newResource];
        await AsyncStorage.setItem(RESOURCES_STORAGE_KEY, JSON.stringify(allResources));
      } catch (storageError) {
        console.log('Error saving to storage:', storageError);
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Learning Resources</Text>
        <Text style={styles.body}>
          Curated lessons, PDFs, and short videos suited for low-bandwidth
          environments. Tap an item to open details.
        </Text>

        {resources.map((resource) => (
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
        ))}
      </ScrollView>

      {/* Floating Upload Button Above Tab */}
      <TouchableOpacity
        style={styles.floatingUploadButton}
        onPress={() => setShowUploadDialog(true)}
      >
        <Text style={styles.floatingUploadButtonText}>+ Upload Resource</Text>
      </TouchableOpacity>

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
