import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { quizAPI } from '../services/api';

type RootStackParamList = {
  Home: undefined;
  QuizMain: { questions: Question[] };
  Results: { results: QuizResults };
};

type QuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuizMain'>;

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

interface Answer {
  questionId: number;
  selectedAnswer: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  iconFamily: 'ionicons' | 'materialcommunity';
  subcategories: SubCategory[];
  color: string;
}

interface SubCategory {
  id: string;
  name: string;
  questionCount: number;
}

interface Props {
  route: { params?: { questions?: Question[] } };
  navigation: QuizScreenNavigationProp;
}

export default function QuizScreen({ route, navigation }: Props) {
  const questions = route.params?.questions || [];
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const categories: Category[] = [
    {
      id: '1',
      name: 'Mathematics',
      icon: 'calculator-variant',
      iconFamily: 'materialcommunity',
      color: '#FF6B6B',
      subcategories: [
        { id: '1-1', name: 'Algebra', questionCount: 15 },
        { id: '1-2', name: 'Geometry', questionCount: 12 },
        { id: '1-3', name: 'Calculus', questionCount: 10 },
        { id: '1-4', name: 'Statistics', questionCount: 8 },
      ],
    },
    {
      id: '2',
      name: 'Science',
      icon: 'test-tube',
      iconFamily: 'materialcommunity',
      color: '#4ECDC4',
      subcategories: [
        { id: '2-1', name: 'Physics', questionCount: 20 },
        { id: '2-2', name: 'Chemistry', questionCount: 18 },
        { id: '2-3', name: 'Biology', questionCount: 16 },
      ],
    },
    {
      id: '3',
      name: 'English',
      icon: 'book-open-variant',
      iconFamily: 'materialcommunity',
      color: '#95E1D3',
      subcategories: [
        { id: '3-1', name: 'Grammar', questionCount: 14 },
        { id: '3-2', name: 'Vocabulary', questionCount: 16 },
        { id: '3-3', name: 'Reading Comprehension', questionCount: 12 },
      ],
    },
    {
      id: '4',
      name: 'Hindi',
      icon: 'language-typescript',
      iconFamily: 'materialcommunity',
      color: '#F38181',
      subcategories: [
        { id: '4-1', name: 'व्याकरण', questionCount: 13 },
        { id: '4-2', name: 'साहित्य', questionCount: 10 },
        { id: '4-3', name: 'समझ', questionCount: 11 },
      ],
    },
    {
      id: '5',
      name: 'Social Studies',
      icon: 'globe-model',
      iconFamily: 'materialcommunity',
      color: '#AA96DA',
      subcategories: [
        { id: '5-1', name: 'History', questionCount: 17 },
        { id: '5-2', name: 'Geography', questionCount: 15 },
        { id: '5-3', name: 'Civics', questionCount: 14 },
      ],
    },
    {
      id: '6',
      name: 'General Knowledge',
      icon: 'brain',
      iconFamily: 'materialcommunity',
      color: '#FCBAD3',
      subcategories: [
        { id: '6-1', name: 'Current Affairs', questionCount: 20 },
        { id: '6-2', name: 'Science & Nature', questionCount: 18 },
        { id: '6-3', name: 'Sports', questionCount: 12 },
      ],
    },
  ];

  if (!questions || questions.length === 0) {
    if (!selectedCategory) {
      return <CategorySelectionScreen categories={categories} onSelectCategory={setSelectedCategory} />;
    } else {
      return <SubCategorySelectionScreen category={selectedCategory} onBack={() => setSelectedCategory(null)} />;
    }
  }

  return <QuizContentScreen questions={questions} navigation={navigation} />;
}

// Category Selection Screen
function CategorySelectionScreen({
  categories,
  onSelectCategory,
}: {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}) {
  const renderIcon = (category: Category) => {
    const iconProps = { size: 32, color: '#fff' };
    if (category.iconFamily === 'ionicons') {
      return <Ionicons name={category.icon as any} {...iconProps} />;
    }
    return <MaterialCommunityIcons name={category.icon} {...iconProps} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.headerNoGradient}>
        <Text style={styles.headerTitleSmall}>Select a Category</Text>
        <Text style={styles.headerSubtitleSmall}>Choose a subject to begin your quiz</Text>
      </View>

      {/* Categories Grid */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { borderTopColor: category.color, borderTopWidth: 4 }]}
              onPress={() => onSelectCategory(category)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                {renderIcon(category)}
              </View>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryCount}>
                {category.subcategories.length} sub-categories
              </Text>
              <View style={styles.categoryArrow}>
                <Ionicons name="chevron-forward" size={20} color="#6200ee" />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Sub-Category Selection Screen
function SubCategorySelectionScreen({
  category,
  onBack,
}: {
  category: Category;
  onBack: () => void;
}) {
  const [startedSubcategory, setStartedSubcategory] = useState<SubCategory | null>(null);
  const [mockQuestions, setMockQuestions] = useState<Question[]>([]);

  const handleStartQuiz = (subcategory: SubCategory) => {
    // Create mock questions for demo
    const questions: Question[] = [
      {
        id: 1,
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        category: subcategory.name,
      },
      {
        id: 2,
        question: 'Which planet is the largest in our solar system?',
        options: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'],
        correctAnswer: 1,
        category: subcategory.name,
      },
      {
        id: 3,
        question: 'What is 25 × 4?',
        options: ['80', '100', '90', '110'],
        correctAnswer: 1,
        category: subcategory.name,
      },
    ];
    setMockQuestions(questions);
    setStartedSubcategory(subcategory);
  };

  if (startedSubcategory && mockQuestions.length > 0) {
    return (
      <QuizContentScreen
        questions={mockQuestions}
        category={category}
        navigation={null as any}
        onBack={() => setStartedSubcategory(null)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Sub-Categories List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.subcategoryScrollContent}>
        <View style={styles.backButtonContainer}>
          <View style={styles.backButtonCompact}>
            <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={onBack}>
              <Ionicons name="chevron-back" size={24} color={category.color} />
              <Text style={[styles.subcategoryScreenTitle, { color: category.color }]}>{category.name}</Text>
            </TouchableOpacity>
          </View>
        </View>
        {category.subcategories.map((subcategory, index) => (
          <TouchableOpacity
            key={subcategory.id}
            style={[
              styles.subcategoryCard,
              { borderLeftColor: category.color, borderLeftWidth: 4 },
            ]}
            onPress={() => handleStartQuiz(subcategory)}
            activeOpacity={0.7}
          >
            <View style={styles.subcategoryHeader}>
              <View>
                <Text style={styles.subcategoryName}>{subcategory.name}</Text>
                <View style={styles.questionCountBadge}>
                  <Ionicons name="help-circle" size={14} color="#fff" />
                  <Text style={styles.questionCountText}>{subcategory.questionCount} Questions</Text>
                </View>
              </View>
              <View style={[styles.subcategoryIndex, { backgroundColor: category.color }]}>
                <Text style={styles.subcategoryIndexText}>{index + 1}</Text>
              </View>
            </View>
            <View style={styles.subcategoryFooter}>
              <Text style={styles.difficulty}>Difficulty: Medium</Text>
              <Ionicons name="arrow-forward" size={18} color="#6200ee" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// Quiz Content Screen (original quiz)
function QuizContentScreen({
  questions,
  navigation,
  category,
  onBack,
}: {
  questions: Question[];
  navigation: QuizScreenNavigationProp;
  category?: Category;
  onBack?: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowCorrectAnswer(true);
  };

  const answeredCount = answers.length + (selectedAnswer !== null ? 1 : 0);
  const progressPercent = Math.round((answeredCount / questions.length) * 100);

  const handleNext = () => {
    if (selectedAnswer === null) {
      Alert.alert('Please Select', 'Please select an answer before continuing.');
      return;
    }

    const newAnswers: Answer[] = [
      ...answers,
      {
        questionId: currentQuestion.id,
        selectedAnswer: selectedAnswer,
      },
    ];

    setAnswers(newAnswers);

    if (isLastQuestion) {
      submitQuiz(newAnswers);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowCorrectAnswer(false);
    }
  };

  const submitQuiz = async (finalAnswers: Answer[]) => {
    setSubmitting(true);
    try {
      const response = await quizAPI.submit(finalAnswers);

      if (response.error) {
        Alert.alert('Error', response.error || 'Failed to submit quiz results.');
        setSubmitting(false);
        return;
      }

      if (response.data) {
        navigation.navigate('Results', { results: response.data });
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz results.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Header Top - Back button for all quiz scenarios */}
      <View style={[styles.headerTop, { paddingHorizontal: 16 }]}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={onBack ? onBack : () => navigation?.goBack()}
          accessibilityLabel="Go back"
        >
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={[styles.categoryLabel, category ? { color: category.color } : {}]}>
            {category ? category.name : 'Quiz'}
          </Text>
          <Text style={styles.progressLabel}>{answeredCount}/{questions.length} answered</Text>
        </View>

        <View style={styles.progressCircle}>
          <Text style={styles.progressPercent}>{progressPercent}%</Text>
        </View>
      </View>
      {/* Question Card */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.questionCard}>
          <Text style={styles.question}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const isSelectedOption = selectedAnswer === index;
              const isCorrectOption = index === currentQuestion.correctAnswer;
              const showAsCorrect = showCorrectAnswer && isCorrectOption;
              const showAsIncorrect = showCorrectAnswer && isSelectedOption && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    isSelectedOption && styles.optionButtonSelected,
                    showCorrectAnswer && showAsCorrect && styles.optionButtonCorrect,
                    showCorrectAnswer && showAsIncorrect && styles.optionButtonIncorrect,
                  ]}
                  onPress={() => handleAnswerSelect(index)}
                  activeOpacity={0.7}
                  disabled={showCorrectAnswer}
                >
                  <View
                    style={[
                      styles.optionMarker,
                      isSelectedOption && styles.optionMarkerSelected,
                      showCorrectAnswer && showAsCorrect && styles.optionMarkerCorrect,
                      showCorrectAnswer && showAsIncorrect && styles.optionMarkerIncorrect,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionMarkerText,
                        isSelectedOption && styles.optionMarkerTextSelected,
                        showCorrectAnswer && showAsCorrect && styles.optionMarkerTextCorrect,
                        showCorrectAnswer && showAsIncorrect && styles.optionMarkerTextIncorrect,
                      ]}
                    >
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      isSelectedOption && styles.optionTextSelected,
                      showCorrectAnswer && showAsCorrect && styles.optionTextCorrect,
                      showCorrectAnswer && showAsIncorrect && styles.optionTextIncorrect,
                    ]}
                  >
                    {option}
                  </Text>
                  {showCorrectAnswer && showAsCorrect && (
                    <Ionicons name="checkmark-circle" size={24} color="#4caf50" />
                  )}
                  {showCorrectAnswer && showAsIncorrect && (
                    <Ionicons name="close-circle" size={24} color="#d32f2f" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Question Info */}
          <View style={styles.infoBar}>
            <View style={styles.infoItem}>
              <Ionicons name="checkmark-done" size={16} color="#4caf50" />
              <Text style={styles.infoText}>
                Answered: {answers.length + (selectedAnswer !== null ? 1 : 0)}/{questions.length}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <Ionicons name="reader" size={16} color="#ff9800" />
              <Text style={styles.infoText}>
                Remaining: {questions.length - answers.length - (selectedAnswer !== null ? 1 : 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        {currentQuestionIndex > 0 && (
          <TouchableOpacity 
            style={styles.prevButton} 
            onPress={() => {
              if (currentQuestionIndex > 0) {
                setCurrentQuestionIndex(currentQuestionIndex - 1);
                setSelectedAnswer(null);
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#6200ee" />
            <Text style={styles.prevButtonText}>Previous</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[
            styles.nextButton, 
            submitting && styles.nextButtonDisabled,
            selectedAnswer === null && styles.nextButtonDisabled,
          ]} 
          onPress={handleNext}
          disabled={submitting || selectedAnswer === null}
          activeOpacity={0.8}
        >
          {submitting ? (
            <>
              <Ionicons name="hourglass" size={20} color="#fff" />
              <Text style={styles.nextButtonText}>Submitting...</Text>
            </>
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Submit Quiz' : 'Next Question'}
              </Text>
              <Ionicons name={isLastQuestion ? 'checkmark' : 'chevron-forward'} size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  // ===== Header Styles =====
  header: {
    paddingTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  headerNoGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerTitleSmall: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitleSmall: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
  },
  backButton: {
    marginBottom: 12,
  },

  // ===== Scroll Views =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  subcategoryScrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // ===== Category Grid =====
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  categoryArrow: {
    alignSelf: 'flex-end',
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
  },
  backButtonCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  subcategoryScreenTitle: {
    fontSize: 22,
    fontWeight: '700',
  },

  // ===== Sub-Category Cards =====
  subcategoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  subcategoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subcategoryName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  questionCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  questionCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  subcategoryIndex: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subcategoryIndexText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  subcategoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  difficulty: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },

  // ===== Quiz Content Styles =====
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButtonHeader: {
    padding: 8,
    marginRight: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 18,
    color: 'rgba(51, 51, 51, 1)',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6200ee',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6200ee',
    textTransform: 'uppercase',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6200ee',
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  question: {
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    marginBottom: 24,
    gap: 10,
  },
  optionButton: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e8e8e8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionButtonSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  optionButtonCorrect: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  optionButtonIncorrect: {
    borderColor: '#d32f2f',
    backgroundColor: '#ffebee',
  },
  optionMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d0d0d0',
  },
  optionMarkerSelected: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  optionMarkerCorrect: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  optionMarkerIncorrect: {
    backgroundColor: '#d32f2f',
    borderColor: '#d32f2f',
  },
  optionMarkerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  optionMarkerTextSelected: {
    color: '#fff',
  },
  optionMarkerTextCorrect: {
    color: '#fff',
  },
  optionMarkerTextIncorrect: {
    color: '#fff',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  optionTextSelected: {
    color: '#6200ee',
    fontWeight: '600',
  },
  optionTextCorrect: {
    color: '#4caf50',
    fontWeight: '600',
  },
  optionTextIncorrect: {
    color: '#d32f2f',
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#d0d0d0',
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  prevButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#6200ee',
    gap: 6,
  },
  prevButtonText: {
    color: '#6200ee',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
});

