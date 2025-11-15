import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { questionsAPI, resourcesAPI } from '../services/api';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  iconFamily: 'ionicons' | 'materialcommunity';
  iconColor: string;
  level: string;
  subject: string;
}

// Map of subjects to their icon and color configuration
const SUBJECT_CONFIG: { [key: string]: Omit<CatalogItem, 'id' | 'title' | 'subject'> } = {
  Math: {
    description: 'Basic to advanced math concepts',
    iconName: 'calculator-variant',
    iconFamily: 'materialcommunity',
    iconColor: '#FF6B6B',
    level: 'All Levels',
  },
  Science: {
    description: 'Physics, Chemistry, Biology',
    iconName: 'test-tube',
    iconFamily: 'materialcommunity',
    iconColor: '#4ECDC4',
    level: 'All Levels',
  },
  English: {
    description: 'Grammar, Vocabulary, Reading',
    iconName: 'book-open-variant',
    iconFamily: 'materialcommunity',
    iconColor: '#45B7D1',
    level: 'All Levels',
  },
  Hindi: {
    description: 'भाषा और साहित्य',
    iconName: 'language-typescript',
    iconFamily: 'materialcommunity',
    iconColor: '#F7B731',
    level: 'All Levels',
  },
  Social: {
    description: 'History, Geography, Civics',
    iconName: 'globe-model',
    iconFamily: 'materialcommunity',
    iconColor: '#A29BFE',
    level: 'All Levels',
  },
  Computer: {
    description: 'Digital literacy for beginners',
    iconName: 'laptop',
    iconFamily: 'materialcommunity',
    iconColor: '#6C5CE7',
    level: 'Beginner',
  },
  Agriculture: {
    description: 'Farming techniques and knowledge',
    iconName: 'sprout',
    iconFamily: 'materialcommunity',
    iconColor: '#00B894',
    level: 'All Levels',
  },
  GK: {
    description: 'Current affairs and facts',
    iconName: 'brain',
    iconFamily: 'materialcommunity',
    iconColor: '#FD79A8',
    level: 'All Levels',
  },
};

const STORAGE_KEY_PREFIX = 'subject_questions_';

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [learningCatalog, setLearningCatalog] = useState<CatalogItem[]>([]);
  const [loadingSubject, setLoadingSubject] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadAllSubjects();
  }, []);

  const loadAllSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get all subjects from SUBJECT_CONFIG (always show all)
      const catalog: CatalogItem[] = Object.entries(SUBJECT_CONFIG).map(
        ([subject, config], index) => ({
          id: String(index + 1),
          title: subject,
          subject: subject,
          ...config,
        })
      );
      
      setLearningCatalog(catalog);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllSubjects();
    setRefreshing(false);
  }, [loadAllSubjects]);

  const fetchQuestionsForSubject = async (subject: string) => {
    const storageKey = STORAGE_KEY_PREFIX + subject;
    
    try {
      // Always try to fetch from API first
      console.log(`Fetching ${subject} resources from API...`);
      const response = await resourcesAPI.getAll(subject);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Save to local storage for future offline use
        await AsyncStorage.setItem(storageKey, JSON.stringify(response.data));
        console.log(`✓ Fetched and cached ${response.data.length} ${subject} resources`);
        return response.data;
      } else {
        // API returned empty, check local storage as fallback
        console.log(`No resources from API, checking local storage...`);
        const cachedData = await AsyncStorage.getItem(storageKey);
        
        if (cachedData) {
          const resources = JSON.parse(cachedData);
          console.log(`✓ Loaded ${resources.length} ${subject} resources from local storage`);
          return resources;
        } else {
          console.warn(`No resources found for ${subject} anywhere`);
          return [];
        }
      }
    } catch (error) {
      console.error(`Error fetching ${subject} resources:`, error);
      
      // If API fails, try local storage as fallback
      try {
        console.log(`API failed, trying local storage fallback...`);
        const cachedData = await AsyncStorage.getItem(storageKey);
        if (cachedData) {
          const resources = JSON.parse(cachedData);
          console.log(`✓ Loaded ${resources.length} ${subject} resources from cache (offline)`);
          return resources;
        }
      } catch (storageError) {
        console.error(`Storage fallback also failed:`, storageError);
      }
      
      Alert.alert('Error', `Failed to load ${subject} resources. Please try again.`);
      return [];
    }
  };

  const handleCourseSelect = async (course: CatalogItem) => {
    setLoadingSubject(course.subject);
    
    try {
      const resources = await fetchQuestionsForSubject(course.subject);
      
      if (resources && Array.isArray(resources) && resources.length > 0) {
        navigation.navigate('Subjects', { subject: course, resources });
      } else {
        Alert.alert('No Resources', `No resources found for ${course.title}. Please upload PDF files for this subject.`);
      }
    } catch (error) {
      console.error('Error selecting course:', error);
      Alert.alert('Error', 'Failed to load resources');
    } finally {
      setLoadingSubject(null);
    }
  };

  const renderIcon = (item: CatalogItem) => {
    const iconProps = { size: 40, color: item.iconColor };
    if (item.iconFamily === 'ionicons') {
      return <Ionicons name={item.iconName as any} {...iconProps} />;
    }
    return <MaterialCommunityIcons name={item.iconName} {...iconProps} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      {/* Learning Catalog */}
      <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#6200ee']}
                tintColor="#6200ee"
              />
            }
          >
            <View style={styles.catalogSection}>
              <View style={styles.catalogHeader}>
                <Text style={styles.catalogTitle}>📚 Learning Catalog</Text>
                <Text style={styles.catalogDescription}>
                  Choose a subject to start learning
                </Text>
              </View>

              {learningCatalog.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="book-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No subjects available</Text>
                </View>
              ) : (
                <View style={styles.cardsGrid}>
                  {learningCatalog.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.catalogCard,
                        loadingSubject === item.subject && styles.catalogCardLoading,
                      ]}
                      onPress={() => handleCourseSelect(item)}
                      activeOpacity={0.8}
                      disabled={loadingSubject === item.subject}
                    >
                      {loadingSubject === item.subject ? (
                        <View style={styles.loadingOverlay}>
                          <ActivityIndicator size="small" color="#6200ee" />
                          <Text style={styles.loadingText}>Loading...</Text>
                        </View>
                      ) : null}
                      
                      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '20' }]}>
                        {renderIcon(item)}
                      </View>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.cardDescription}>{item.description}</Text>
                      <View style={styles.cardFooter}>
                        <Text style={styles.levelBadge}>{item.level}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <Text style={styles.sectionTitle}>✨ Features</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Ionicons name="mic" size={24} color="#6200ee" />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureName}>Audio Learning</Text>
                    <Text style={styles.featureDesc}>Lessons with audio support</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="chatbubble" size={24} color="#6200ee" />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureName}>AI Assistant</Text>
                    <Text style={styles.featureDesc}>Ask questions anytime</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="download" size={24} color="#6200ee" />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureName}>Offline Access</Text>
                    <Text style={styles.featureDesc}>Learn without internet</Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="globe" size={24} color="#6200ee" />
                  <View style={styles.featureContent}>
                    <Text style={styles.featureName}>Multilingual</Text>
                    <Text style={styles.featureDesc}>Learn in your language</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  catalogSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  catalogHeader: {
    marginBottom: 20,
  },
  catalogTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  catalogDescription: {
    fontSize: 14,
    color: '#666',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  catalogCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  catalogCardLoading: {
    opacity: 0.7,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    flexDirection: 'column',
    gap: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#6200ee',
    fontWeight: '600',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
  },
  levelBadge: {
    fontSize: 11,
    backgroundColor: '#f0f0f0',
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
  },
  featuresSection: {
    paddingHorizontal: 16,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featuresList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureContent: {
    marginLeft: 16,
    flex: 1,
  },
  featureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: '#999',
  },
});
