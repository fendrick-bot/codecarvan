import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UploadedResource {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
}

interface SummaryState {
  isGenerating: boolean;
  summary: string | null;
}

const RESOURCES_STORAGE_KEY = 'uploaded_resources';

export default function LessonScreen({ route, navigation }: any) {
  const { topic, subject } = route.params;
  const [resources, setResources] = useState<UploadedResource[]>([]);
  const [selectedResource, setSelectedResource] = useState<UploadedResource | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryState, setSummaryState] = useState<SummaryState>({
    isGenerating: false,
    summary: null,
  });

  // Load resources from AsyncStorage
  useEffect(() => {
    loadResources();
  }, [subject]);

  const loadResources = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockResources: UploadedResource[] = [
        {
          id: '1',
          title: 'Advanced Algebra Concepts',
          subject: 'Math',
          description: 'Comprehensive guide to polynomial equations and functions',
          fileName: 'algebra-advanced.pdf',
        },
        {
          id: '2',
          title: 'Algebra Fundamentals',
          subject: 'Math',
          description: 'Basic algebraic expressions and linear equations',
          fileName: 'algebra-basics.pdf',
        },
        {
          id: '3',
          title: 'Physics Motion Guide',
          subject: 'Science',
          description: "Newton's Laws and motion principles",
          fileName: 'physics-motion.pdf',
        },
        {
          id: '4',
          title: 'English Grammar Rules',
          subject: 'English',
          description: 'Complete grammar guide with examples',
          fileName: 'english-grammar.pdf',
        },
        {
          id: '5',
          title: 'Indian History Overview',
          subject: 'Social',
          description: 'Ancient and medieval Indian history',
          fileName: 'history-india.pdf',
        },
      ];

      // Get saved resources from AsyncStorage
      const savedResources = await AsyncStorage.getItem(RESOURCES_STORAGE_KEY);
      let uploadedResources: UploadedResource[] = [];
      
      if (savedResources) {
        try {
          uploadedResources = JSON.parse(savedResources);
        } catch (e) {
          console.log('Error parsing saved resources:', e);
        }
      }

      // Combine mock and uploaded resources, then filter by subject
      const allResources = [...mockResources, ...uploadedResources];
      const filteredResources = allResources.filter(
        (res) => res.subject === subject.subject
      );
      
      setResources(filteredResources);
    } catch (error) {
      console.log('Error loading resources:', error);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResourcePress = (resource: UploadedResource) => {
    setSelectedResource(resource);
    setSummaryState({ isGenerating: false, summary: null });
    setShowPdfModal(true);
  };

  const handleSummarize = async () => {
    setSummaryState({ isGenerating: true, summary: null });

    try {
      // Simulate API call to generate summary
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const mockSummary = `Summary of ${selectedResource?.title}:\n\n
This document covers key concepts and principles related to ${selectedResource?.title.toLowerCase()}. The content includes:\n
• Introduction and fundamental concepts
• Core principles and theories
• Practical applications and examples
• Advanced topics and extensions
• Practice problems and exercises
• Key takeaways and review points\n
The material is designed for comprehensive understanding with progressive difficulty levels. Each section builds upon previous concepts to ensure complete mastery of the subject matter.`;

      setSummaryState({ isGenerating: false, summary: mockSummary });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate summary');
      setSummaryState({ isGenerating: false, summary: null });
    }
  };

  const handleViewSummary = () => {
    if (summaryState.summary) {
      setShowPdfModal(false);
      setShowSummaryModal(true);
    }
  };

  const renderResourceCard = ({ item }: { item: UploadedResource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => handleResourcePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.resourceIcon}>
        <MaterialCommunityIcons name="file-pdf-box" size={32} color="#FF6B6B" />
      </View>
      <View style={styles.resourceContent}>
        <Text style={styles.resourceTitle}>{item.title}</Text>
        <Text style={styles.resourceDescription}>{item.description}</Text>
        <Text style={styles.resourceFileName}>{item.fileName}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: subject.iconColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{topic.title}</Text>
          <Text style={styles.headerSubtitle}>{topic.description}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Available Resources</Text>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Loading resources...</Text>
            </View>
          ) : resources.length > 0 ? (
            <FlatList
              data={resources}
              renderItem={renderResourceCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              nestedScrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={48}
                color="#ccc"
              />
              <Text style={styles.emptyStateText}>
                No resources available for this topic yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* PDF Modal - Full Screen Viewer */}
      <Modal
        visible={showPdfModal}
        transparent={false}
        animationType="fade"
        onRequestClose={() => {
          if (!summaryState.isGenerating) {
            setShowPdfModal(false);
            setSummaryState({ isGenerating: false, summary: null });
          }
        }}
      >
        <View style={styles.fullScreenPdfContainer}>
          {/* Top Bar with PDF Name and Close Button */}
          <View style={[styles.pdfBottomBar, { backgroundColor: subject.iconColor }]}>
            <View style={styles.pdfNameContainer}>
              <Text style={styles.pdfBottomBarFileName} numberOfLines={1}>
                {selectedResource?.fileName}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (!summaryState.isGenerating) {
                  setShowPdfModal(false);
                  setSummaryState({ isGenerating: false, summary: null });
                }
              }}
              disabled={summaryState.isGenerating}
              style={styles.closeButtonContainer}
            >
              <Ionicons
                name="close-circle"
                size={32}
                color={summaryState.isGenerating ? '#888' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* PDF Content */}
          <ScrollView
            style={styles.pdfViewerContent}
            contentContainerStyle={styles.pdfViewerContentInner}
            scrollEnabled={true}
          >
            <View
              style={[
                styles.pdfImageContainer,
                summaryState.isGenerating && styles.blurredPdf,
              ]}
            >
              {/* PDF Image Placeholder */}
              <View style={styles.pdfImagePlaceholder}>
                <MaterialCommunityIcons
                  name="file-pdf-box"
                  size={120}
                  color="#FF6B6B"
                  style={styles.pdfLargeIcon}
                />
                <Text style={styles.pdfViewerFileName}>
                  {selectedResource?.fileName}
                </Text>
                <Text style={styles.pdfViewerTitle}>
                  {selectedResource?.title}
                </Text>
                <Text style={styles.pdfViewerDescription}>
                  {selectedResource?.description}
                </Text>

                {/* Mock PDF Pages */}
                <View style={styles.mockPdfPages}>
                  <View style={styles.mockPage}>
                    <Text style={styles.mockPageText}>Page 1 - Introduction</Text>
                  </View>
                  <View style={styles.mockPage}>
                    <Text style={styles.mockPageText}>Page 2 - Content</Text>
                  </View>
                  <View style={styles.mockPage}>
                    <Text style={styles.mockPageText}>Page 3 - Examples</Text>
                  </View>
                </View>
              </View>

              {/* Blur Overlay when Generating */}
              {summaryState.isGenerating && (
                <View style={styles.blurOverlay}>
                  <ActivityIndicator size="large" color="#4CAF50" />
                  <Text style={styles.generatingText}>Generating summary...</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* Floating Summarize Button */}
          {!summaryState.isGenerating && !summaryState.summary && (
            <TouchableOpacity
              style={[styles.floatingSummarizeButton, { backgroundColor: subject.iconColor }]}
              onPress={handleSummarize}
              activeOpacity={0.85}
            >
              <View style={styles.summarizeButtonContent}>
                <MaterialCommunityIcons
                  name="text-box-outline"
                  size={24}
                  color="#fff"
                />
                <Text style={styles.floatingSummarizeText}>Summarize</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* View Summary Button */}
          {summaryState.summary && !summaryState.isGenerating && (
            <TouchableOpacity
              style={[styles.floatingSummarizeButton, styles.viewSummaryButton, { backgroundColor: subject.iconColor }]}
              onPress={handleViewSummary}
              activeOpacity={0.85}
            >
              <View style={styles.summarizeButtonContent}>
                <Ionicons name="eye-outline" size={24} color="#fff" />
                <Text style={styles.floatingSummarizeText}>View Summary</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </Modal>

      {/* Summary Modal - Full Page */}
      <Modal
        visible={showSummaryModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setShowSummaryModal(false);
          setSummaryState({ isGenerating: false, summary: null });
        }}
      >
        <View style={styles.summaryContainer}>
          {/* Summary Header */}
          <View style={[styles.summaryHeader, { backgroundColor: subject.iconColor }]}>
            <TouchableOpacity
              onPress={() => {
                setShowSummaryModal(false);
                setSummaryState({ isGenerating: false, summary: null });
              }}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.summaryHeaderTitle}>Summary</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Summary Content */}
          <ScrollView
            style={styles.summaryContent}
            contentContainerStyle={styles.summaryContentInner}
          >
            <View style={styles.summaryCard}>
              <Text style={styles.summaryResourceTitle}>
                {selectedResource?.title}
              </Text>
              <Text style={styles.summaryResourceSubtitle}>
                {selectedResource?.fileName}
              </Text>

              <View style={styles.summaryDivider} />

              <Text style={styles.summaryText}>{summaryState.summary}</Text>

              {/* Action Buttons */}
              <View style={styles.summaryActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Alert.alert('Success', 'Summary saved!');
                  }}
                >
                  <MaterialCommunityIcons
                    name="download"
                    size={20}
                    color="#fff"
                  />
                  <Text style={styles.actionButtonText}>Download</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.shareButton]}
                  onPress={() => {
                    Alert.alert('Shared', 'Summary shared successfully!');
                  }}
                >
                  <MaterialCommunityIcons name="share" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  resourceIcon: {
    marginRight: 12,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  resourceFileName: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },

  // PDF Modal Styles
  pdfModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  fullScreenPdfContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  pdfViewerContent: {
    flex: 1,
    backgroundColor: '#000',
  },
  pdfViewerContentInner: {
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfImageContainer: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  blurredPdf: {
    opacity: 0.4,
  },
  pdfImagePlaceholder: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    width: '90%',
    borderWidth: 2,
    borderColor: '#404040',
    borderStyle: 'dashed',
  },
  pdfLargeIcon: {
    marginBottom: 20,
  },
  pdfViewerFileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfViewerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  pdfViewerDescription: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 30,
  },
  mockPdfPages: {
    width: '100%',
    gap: 12,
    marginTop: 20,
  },
  mockPage: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mockPageText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
  },
  pdfTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pdfBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pdfNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  pdfBottomBarFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  closeButtonContainer: {
    padding: 8,
  },
  pdfTopBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  floatingSummarizeButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  viewSummaryButton: {
    backgroundColor: '#2196F3',
  },
  summarizeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  floatingSummarizeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  pdfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pdfHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  pdfContent: {
    flex: 1,
  },
  pdfContentInner: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfPlaceholder: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderStyle: 'dashed',
  },
  pdfFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  pdfDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  pdfActions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  generatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  generatingText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 12,
    fontWeight: '500',
  },
  summarizeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  viewButton: {
    backgroundColor: '#2196F3',
  },
  summarizeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  summaryContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    backgroundColor: '#4CAF50',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
  },
  summaryContent: {
    flex: 1,
  },
  summaryContentInner: {
    padding: 16,
    paddingBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  summaryResourceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  summaryResourceSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 16,
  },
  summaryText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 24,
    marginBottom: 20,
  },
  summaryActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
});
