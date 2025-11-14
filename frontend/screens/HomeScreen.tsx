import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { questionsAPI, categoriesAPI } from '../services/api';

type RootStackParamList = {
  Home: undefined;
  QuizMain: { questions: Question[] };
  Results: { results: QuizResults };
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'HomeTab'>;

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  results: any[];
}

interface Props {
  navigation: HomeScreenNavigationProp;
}

interface CatalogItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: string;
  subject: string;
}

export default function HomeScreen({ navigation }: Props) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { user } = useAuth();

  // Learning Catalog for Rural Students
  const learningCatalog: CatalogItem[] = [
    {
      id: '1',
      title: 'Mathematics',
      description: 'Basic to advanced math concepts',
      icon: '🔢',
      level: 'All Levels',
      subject: 'Math',
    },
    {
      id: '2',
      title: 'Science',
      description: 'Physics, Chemistry, Biology',
      icon: '🔬',
      level: 'All Levels',
      subject: 'Science',
    },
    {
      id: '3',
      title: 'English Language',
      description: 'Grammar, Vocabulary, Reading',
      icon: '📖',
      level: 'All Levels',
      subject: 'English',
    },
    {
      id: '4',
      title: 'Hindi',
      description: 'भाषा और साहित्य',
      icon: '📝',
      level: 'All Levels',
      subject: 'Hindi',
    },
    {
      id: '5',
      title: 'Social Studies',
      description: 'History, Geography, Civics',
      icon: '🌍',
      level: 'All Levels',
      subject: 'Social',
    },
    {
      id: '6',
      title: 'Computer Basics',
      description: 'Digital literacy for beginners',
      icon: '💻',
      level: 'Beginner',
      subject: 'Computer',
    },
    {
      id: '7',
      title: 'Agriculture',
      description: 'Farming techniques and knowledge',
      icon: '🌾',
      level: 'All Levels',
      subject: 'Agriculture',
    },
    {
      id: '8',
      title: 'General Knowledge',
      description: 'Current affairs and facts',
      icon: '🧠',
      level: 'All Levels',
      subject: 'GK',
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = useCallback(async (showError = true) => {
    try {
      const response = await categoriesAPI.getAll();
      
      if (response.error) {
        if (showError) {
          Alert.alert(
            'Connection Error',
            response.error || 'Failed to connect to server.\n\nPlease check:\n• Backend server is running\n• Network connection\n• API URL is correct',
            [{ text: 'OK' }]
          );
        }
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      if (response.data) {
        setCategories(response.data);
      }
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (showError) {
        Alert.alert(
          'Network Error',
          'Failed to connect to server.\n\nPlease check:\n• Backend server is running on http://10.56.198.235:3000\n• Network connection\n• Firewall settings',
          [{ text: 'OK' }]
        );
      }
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCategories(false);
  }, [fetchCategories]);

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
  };

  const startQuiz = async () => {
    if (startingQuiz) return;

    setStartingQuiz(true);
    try {
      const response = await questionsAPI.getAll(selectedCategory || undefined);
      
      if (response.error) {
        Alert.alert(
          'Error Loading Questions',
          response.error || 'Failed to load questions. Please try again.',
          [{ text: 'OK' }]
        );
        setStartingQuiz(false);
        return;
      }
      
      if (response.data) {
        if (response.data.length === 0) {
          Alert.alert(
            'No Questions Available',
            selectedCategory
              ? `No questions found in "${selectedCategory}" category.\n\nPlease select a different category.`
              : 'No questions are available. Please try again later.',
            [{ text: 'OK' }]
          );
          setStartingQuiz(false);
          return;
        }
        navigation.navigate('QuizMain', { questions: response.data });
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred while loading questions. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setStartingQuiz(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
        </View>
      </View>

      {/* Learning Catalog Section */}
      <View style={styles.catalogSection}>
        <View style={styles.catalogHeader}>
          <Text style={styles.catalogTitle}>📚 Learning Catalog</Text>
          <Text style={styles.catalogSubtitle}>Explore courses and subjects</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catalogScrollContent}
        >
          {learningCatalog.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.catalogCard}
              activeOpacity={0.8}
              onPress={() => {
                // Navigate to specific subject or filter by category
                setSelectedCategory(item.subject);
              }}
            >
              <View style={styles.catalogIconContainer}>
                <Text style={styles.catalogIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.catalogCardTitle}>{item.title}</Text>
              <Text style={styles.catalogCardDescription} numberOfLines={2}>
                {item.description}
              </Text>
              <View style={styles.catalogLevelBadge}>
                <Text style={styles.catalogLevelText}>{item.level}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Instructions */}
      <Text style={styles.subtitle}>Select a category or start a general quiz</Text>
      
      {/* Categories List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item}
        style={styles.categoryList}
        contentContainerStyle={styles.categoryListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        ListHeaderComponent={
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === null && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategorySelect(null)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === null && styles.categoryTextSelected,
              ]}
            >
              📚 All Categories
            </Text>
            {selectedCategory === null && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        }
        ListEmptyComponent={
          !refreshing && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No categories available</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategorySelect(item)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === item && styles.categoryTextSelected,
              ]}
            >
              📖 {item}
            </Text>
            {selectedCategory === item && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        )}
      />
      
      {/* Start Quiz Button */}
      <TouchableOpacity
        style={[
          styles.startButton,
          (startingQuiz || categories.length === 0) && styles.startButtonDisabled,
        ]}
        onPress={startQuiz}
        disabled={startingQuiz || categories.length === 0}
        activeOpacity={0.8}
      >
        {startingQuiz ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonSpinner} />
            <Text style={styles.startButtonText}>Loading Questions...</Text>
          </View>
        ) : (
          <Text style={styles.startButtonText}>
            {selectedCategory ? `Start ${selectedCategory} Quiz` : 'Start Quiz'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Info Footer */}
      {selectedCategory && (
        <Text style={styles.infoText}>
          Selected: {selectedCategory} • {categories.length} {categories.length === 1 ? 'category' : 'categories'} available
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  userName: {
    fontSize: 16,
    color: '#6200ee',
    marginTop: 2,
    fontWeight: '600',
  },
  catalogSection: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 10,
  },
  catalogHeader: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  catalogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  catalogSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  catalogScrollContent: {
    paddingHorizontal: 15,
    paddingRight: 20,
  },
  catalogCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    marginRight: 12,
    width: 160,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  catalogIconContainer: {
    backgroundColor: '#fff',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  catalogIcon: {
    fontSize: 28,
  },
  catalogCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  catalogCardDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
  },
  catalogLevelBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  catalogLevelText: {
    fontSize: 10,
    color: '#2e7d32',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 15,
    marginBottom: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  categoryList: {
    flex: 1,
  },
  categoryListContent: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  categoryButton: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryButtonSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
    shadowColor: '#6200ee',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  categoryTextSelected: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
    marginLeft: 10,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  startButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSpinner: {
    marginRight: 10,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
});

