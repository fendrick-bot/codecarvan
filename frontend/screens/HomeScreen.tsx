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
import { useAuth } from '../contexts/AuthContext';
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

export default function HomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  // Learning Catalog for Rural Students with Modern Icons
  const learningCatalog: CatalogItem[] = [
    {
      id: '1',
      title: 'Mathematics',
      description: 'Basic to advanced math concepts',
      iconName: 'calculator-variant',
      iconFamily: 'materialcommunity',
      iconColor: '#FF6B6B',
      level: 'All Levels',
      subject: 'Math',
    },
    {
      id: '2',
      title: 'Science',
      description: 'Physics, Chemistry, Biology',
      iconName: 'test-tube',
      iconFamily: 'materialcommunity',
      iconColor: '#4ECDC4',
      level: 'All Levels',
      subject: 'Science',
    },
    {
      id: '3',
      title: 'English Language',
      description: 'Grammar, Vocabulary, Reading',
      iconName: 'book-open-variant',
      iconFamily: 'materialcommunity',
      iconColor: '#45B7D1',
      level: 'All Levels',
      subject: 'English',
    },
    {
      id: '4',
      title: 'Hindi',
      description: 'भाषा और साहित्य',
      iconName: 'language-typescript',
      iconFamily: 'materialcommunity',
      iconColor: '#F7B731',
      level: 'All Levels',
      subject: 'Hindi',
    },
    {
      id: '5',
      title: 'Social Studies',
      description: 'History, Geography, Civics',
      iconName: 'globe-model',
      iconFamily: 'materialcommunity',
      iconColor: '#A29BFE',
      level: 'All Levels',
      subject: 'Social',
    },
    {
      id: '6',
      title: 'Computer Basics',
      description: 'Digital literacy for beginners',
      iconName: 'laptop',
      iconFamily: 'materialcommunity',
      iconColor: '#6C5CE7',
      level: 'Beginner',
      subject: 'Computer',
    },
    {
      id: '7',
      title: 'Agriculture',
      description: 'Farming techniques and knowledge',
      iconName: 'sprout',
      iconFamily: 'materialcommunity',
      iconColor: '#00B894',
      level: 'All Levels',
      subject: 'Agriculture',
    },
    {
      id: '8',
      title: 'General Knowledge',
      description: 'Current affairs and facts',
      iconName: 'brain',
      iconFamily: 'materialcommunity',
      iconColor: '#FD79A8',
      level: 'All Levels',
      subject: 'GK',
    },
  ];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCourseSelect = (course: CatalogItem) => {
    navigation.navigate('Subjects', { subject: course });
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

          <View style={styles.cardsGrid}>
            {learningCatalog.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.catalogCard}
                onPress={() => handleCourseSelect(item)}
                activeOpacity={0.8}
              >
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
