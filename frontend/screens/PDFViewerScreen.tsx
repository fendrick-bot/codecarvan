import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { resourcesAPI } from '../services/api';

interface PDFViewerScreenProps {
  route: any;
  navigation: any;
}

interface Resource {
  id: string | number;
  title: string;
  description: string;
  subject: string;
  file_name: string;
  file_size?: number;
}

interface SummaryData {
  documentId: number;
  title: string;
  subject: string;
  description: string;
  chunksCount: number;
  originalTextLength: number;
  summary: string;
  llmProvider: string;
}

export default function PDFViewerScreen({ route, navigation }: PDFViewerScreenProps) {
  const resource: Resource | undefined = route?.params?.resource;
  const [isLoading, setIsLoading] = useState(true);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const downloadPdf = async () => {
    if (!resource) {
      setError('No resource provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Try to load PDF from AsyncStorage cache
      const cacheKey = `pdf-${resource.id}`;
      console.log('Checking AsyncStorage for cache key:', cacheKey);
      
      try {
        const cachedPdf = await AsyncStorage.getItem(cacheKey);
        if (cachedPdf) {
          console.log('✓ PDF found in AsyncStorage cache');
          setPdfUri(cachedPdf);
          setIsLoading(false);
          return;
        }
      } catch (cacheError) {
        console.log('AsyncStorage cache check failed:', cacheError);
      }

      // PDF not cached, download from server
      const apiUrl = `http://10.56.198.235:3000/api/resources/${resource.id}`;
      console.log('PDF not in cache, downloading from:', apiUrl);

      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      console.log(`✓ Blob received, size: ${blob.size} bytes`);

      if (blob.size === 0) {
        throw new Error('PDF downloaded but has 0 bytes');
      }

      // Convert blob to base64 data URI for WebView
      const reader = new FileReader();
      
      reader.onload = async () => {
        try {
          const dataUri = reader.result as string;
          console.log('DataURI created, length:', dataUri.length);
          
          if (!dataUri.startsWith('data:')) {
            throw new Error('Invalid data URI');
          }

          // Extract the base64 part
          const base64Part = dataUri.split(',')[1];
          if (!base64Part) {
            throw new Error('Failed to extract base64 from data URI');
          }

          console.log('Base64 extracted successfully');
          
          // Create HTML with inline canvas rendering
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  html, body { 
                    width: 100%; 
                    height: 100%;
                    background: #525252;
                    font-family: Arial, sans-serif;
                  }
                  #container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    overflow: auto;
                    padding: 10px;
                  }
                  canvas {
                    border: 1px solid #ccc;
                    margin: 5px 0;
                    background: white;
                    max-width: 100%;
                    height: auto;
                  }
                  #controls {
                    background: white;
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 10px;
                    display: flex;
                    gap: 10px;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                  }
                  button {
                    padding: 8px 16px;
                    background: #6200ee;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    min-width: 100px;
                  }
                  button:disabled {
                    background: #ccc;
                    cursor: not-allowed;
                  }
                  #pageInfo {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    min-width: 80px;
                    text-align: center;
                  }
                </style>
              </head>
              <body>
                <div id="controls">
                  <button onclick="previousPage()" id="prevBtn">← Previous</button>
                  <span id="pageInfo">Page 1</span>
                  <button onclick="nextPage()" id="nextBtn">Next →</button>
                </div>
                <div id="container"></div>
                <script>
                  const base64String = '${base64Part}';
                  const binaryString = atob(base64String);
                  const bytes = new Uint8Array(binaryString.length);
                  for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                  }
                  
                  let pdfDoc = null;
                  let currentPage = 1;
                  
                  pdfjsLib.getDocument({ data: bytes }).promise.then(doc => {
                    pdfDoc = doc;
                    console.log('PDF loaded with', doc.numPages, 'pages');
                    renderPage(1);
                  }).catch(err => {
                    console.error('Error loading PDF:', err);
                    document.getElementById('container').innerHTML = '<p>Error loading PDF</p>';
                  });
                  
                  function renderPage(pageNum) {
                    if (!pdfDoc) return;
                    if (pageNum < 1 || pageNum > pdfDoc.numPages) return;
                    
                    currentPage = pageNum;
                    document.getElementById('pageInfo').textContent = 'Page ' + pageNum + ' of ' + pdfDoc.numPages;
                    document.getElementById('prevBtn').disabled = pageNum === 1;
                    document.getElementById('nextBtn').disabled = pageNum === pdfDoc.numPages;
                    
                    pdfDoc.getPage(pageNum).then(page => {
                      const scale = 2;
                      const viewport = page.getViewport({ scale: scale });
                      const canvas = document.createElement('canvas');
                      const context = canvas.getContext('2d');
                      canvas.height = viewport.height;
                      canvas.width = viewport.width;
                      
                      page.render({
                        canvasContext: context,
                        viewport: viewport
                      }).promise.then(() => {
                        document.getElementById('container').innerHTML = '';
                        document.getElementById('container').appendChild(canvas);
                      });
                    });
                  }
                  
                  function nextPage() {
                    if (pdfDoc && currentPage < pdfDoc.numPages) {
                      renderPage(currentPage + 1);
                    }
                  }
                  
                  function previousPage() {
                    if (currentPage > 1) {
                      renderPage(currentPage - 1);
                    }
                  }
                </script>
              </body>
            </html>
          `;

          // Save HTML to AsyncStorage cache (if available)
          const cacheKey = `pdf-${resource.id}`;
          try {
            console.log('Saving PDF to AsyncStorage with key:', cacheKey);
            await AsyncStorage.setItem(cacheKey, htmlContent);
            console.log('✓ PDF cached successfully in AsyncStorage');
          } catch (cacheWriteError) {
            console.log('Could not save to AsyncStorage:', cacheWriteError);
          }

          setPdfUri(htmlContent);
          console.log('PDF HTML with PDF.js set successfully');
          setIsLoading(false);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          console.error('Error processing blob:', errorMsg);
          setError(errorMsg);
          setIsLoading(false);
        }
      };

      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        setError('Failed to read PDF file');
        setIsLoading(false);
      };

      console.log('Starting to read blob as DataURL');
      reader.readAsDataURL(blob);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error downloading PDF:', errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    if (!resource) return;

    setIsSummarizing(true);
    setSummaryData(null);

    try {
      console.log('Generating summary for resource:', resource.id);
      
      const resourceId = typeof resource.id === 'string' ? parseInt(resource.id) : resource.id;
      const response = await resourcesAPI.summarize(resourceId, 1000, 'groq');

      console.log('Full API response:', JSON.stringify(response, null, 2));

      if (response.error) {
        throw new Error(response.error);
      }

      // API response structure: { data: { success: true, data: {...summary data...} }, error?: string }
      const wrapper = response.data;
      console.log('Response wrapper data:', JSON.stringify(wrapper, null, 2));

      if (wrapper && wrapper.success && wrapper.data) {
        console.log('Summary data extracted:', JSON.stringify(wrapper.data, null, 2));
        setSummaryData(wrapper.data);
        setShowSummaryModal(true);
        console.log('Modal state set to true');
      } else {
        console.error('Unexpected response structure:', wrapper);
        throw new Error('No summary data in response');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error generating summary:', errorMessage);
      Alert.alert('Error', 'Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  useEffect(() => {
    console.log('Initiating PDF download');
    downloadPdf();
  }, [resource?.id]);

  useEffect(() => {
    console.log('PDF URI state changed:', pdfUri ? 'SET' : 'NULL');
  }, [pdfUri]);

  if (!resource) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Error</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#d32f2f" />
          <Text style={styles.errorText}>Resource not found</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {resource?.title || 'PDF Viewer'}
          </Text>
          <Text style={styles.headerSubtitle}>{resource?.subject || ''}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* PDF Container */}
      <View style={styles.pdfContainer}>
        {isLoading ? (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loaderText}>Downloading PDF...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#d32f2f" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => downloadPdf()}
            >
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : pdfUri ? (
          <WebView
            source={{
              html: pdfUri,
            }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator size="large" color="#6200ee" />
                <Text style={styles.loaderText}>Loading PDF...</Text>
              </View>
            )}
            onError={(error) => {
              console.error('WebView error:', error);
              setError('Failed to load PDF in viewer');
            }}
            onLoad={() => {
              console.log('WebView loaded successfully');
            }}
            onMessage={(event) => {
              console.log('WebView message:', event.nativeEvent.data);
            }}
            scalesPageToFit={true}
            scrollEnabled={true}
            javaScriptEnabled={true}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No PDF available</Text>
          </View>
        )}
      </View>

      {/* Footer with file info and buttons */}
      <View style={styles.footer}>
        <View style={styles.fileInfoContainer}>
          <Ionicons
            name="document-text"
            size={16}
            color="#6200ee"
            style={styles.statusIcon}
          />
          <View style={styles.fileDetails}>
            <Text style={styles.fileInfo}>
              📄 {resource?.file_name || 'PDF'}
              {resource?.file_size &&
                ` • ${(resource.file_size / 1024 / 1024).toFixed(1)} MB`}
            </Text>
            {resource?.description && (
              <Text style={styles.description} numberOfLines={2}>
                {resource.description}
              </Text>
            )}
          </View>
        </View>

        {/* Summarize Button */}
        <TouchableOpacity
          style={[
            styles.summarizeButton,
            isSummarizing && styles.summarizeButtonDisabled,
          ]}
          onPress={generateSummary}
          disabled={isSummarizing}
        >
          {isSummarizing ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
                style={styles.buttonSpinner}
              />
              <Text style={styles.summarizeButtonText}>
                Generating Summary...
              </Text>
            </>
          ) : (
            <>
              <Ionicons
                name="sparkles"
                size={18}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.summarizeButtonText}>Summarize</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Summary Display - Using Alert for simplicity */}
      {showSummaryModal && summaryData && (
        <View style={styles.simpleModalOverlay}>
          <View style={styles.simpleModalBox}>
            <TouchableOpacity 
              style={styles.simpleCloseButton}
              onPress={() => setShowSummaryModal(false)}
            >
              <Text style={styles.simpleCloseText}>✕</Text>
            </TouchableOpacity>
            
            <ScrollView style={styles.simpleScrollView}>
              <Text style={styles.simpleTitle}>{summaryData.title}</Text>
              <Text style={styles.simpleSubject}>Subject: {summaryData.subject}</Text>
              <Text style={styles.simpleSummaryText}>{summaryData.summary}</Text>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 28,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  headerSpacer: {
    width: 28,
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  pdfView: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressBar: {
    marginTop: 16,
    width: '60%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#6200ee',
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  statusIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  fileDetails: {
    flex: 1,
  },
  fileInfo: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
    marginBottom: 4,
  },
  summarizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  summarizeButtonDisabled: {
    opacity: 0.7,
  },
  summarizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonSpinner: {
    marginRight: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: '80%',
    width: '90%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  scrollContent: {
    flex: 1,
  },
  summaryContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  summaryText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  // Simple Modal Styles
  simpleModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  simpleModalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '85%',
    maxHeight: '75%',
    paddingTop: 15,
    paddingHorizontal: 15,
    paddingBottom: 15,
    elevation: 10,
  },
  simpleCloseButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  simpleCloseText: {
    fontSize: 24,
    color: '#333',
    fontWeight: 'bold',
  },
  simpleScrollView: {
    marginTop: 10,
  },
  simpleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  simpleSubject: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    fontWeight: '600',
  },
  simpleSummaryText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
  },
});
