import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { quizAPI, aiAPI, resourcesAPI } from '../services/api';

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

interface Document {
  id: number;
  title: string;
  description?: string;
  subject: string;
}

interface Props {
  route: { params?: { questions?: Question[] } };
  navigation: QuizScreenNavigationProp;
}

export default function QuizScreen({ route, navigation }: Props) {
  const routeQuestions = route.params?.questions || [];
  const [questions, setQuestions] = useState<Question[]>(routeQuestions);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  // Fetch documents on mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Update questions when route params change
  useEffect(() => {
    if (route.params?.questions && route.params.questions.length > 0) {
      console.log('QuizScreen: Received questions from route params:', route.params.questions.length);
      setQuestions(route.params.questions);
    }
  }, [route.params?.questions]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      // Try to fetch from resources API which might have document list
      // For now, we'll use a mock approach - in production this should come from a dedicated API
      const response = await resourcesAPI.getAll();
      if (response.data && Array.isArray(response.data)) {
        // Convert resources to documents format
        const docs: Document[] = response.data.map((resource: any, index: number) => ({
          id: index + 1,
          title: resource.title || resource.file_name,
          description: resource.description,
          subject: resource.subject || 'General',
        }));
        setDocuments(docs);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (selectedDocuments.length === 0) {
      Alert.alert('Select Documents', 'Please select at least one document to generate quiz.');
      return;
    }

    try {
      setGeneratingQuiz(true);
      const docIds = selectedDocuments.map((doc) => doc.id);
      const customTitle = `Quiz - ${selectedDocuments.map(d => d.title).join(', ')}`;
      
      const response = await aiAPI.generateQuiz(docIds, customTitle);

      console.log('QuizScreen: Full API response:', JSON.stringify(response, null, 2));

      if (response.error) {
        Alert.alert('Error', response.error || 'Failed to generate quiz');
        return;
      }

      // Backend returns: { success: true, data: { questions, ... } }
      // apiRequest wraps it as: { data: { success: true, data: { questions, ... } } }
      const backendData = response.data?.data || response.data;
      console.log('QuizScreen: Backend data:', JSON.stringify(backendData, null, 2));
      console.log('QuizScreen: Questions array:', backendData?.questions);

      if (backendData?.questions && backendData.questions.length > 0) {
        // Start quiz with generated questions
        const quizQuestions: Question[] = backendData.questions.map(
          (q: any) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            category: 'Generated',
          })
        );
        
        console.log('QuizScreen: Generated quiz with questions:', quizQuestions.length);
        console.log('First question:', JSON.stringify(quizQuestions[0], null, 2));
        
        // Update state to show quiz content directly
        setSelectedDocuments([]);
        console.log('QuizScreen: About to set questions state with:', quizQuestions.length, 'questions');
        setQuestions(quizQuestions);
        console.log('QuizScreen: Questions state set');
      } else {
        console.error('QuizScreen: No questions in response. Backend data:', backendData);
        Alert.alert('Error', 'No questions generated. Please try again.');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      Alert.alert('Error', 'Failed to generate quiz. Please try again.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (!questions || questions.length === 0) {
    console.log('QuizScreen: Showing document selection. Current questions:', questions?.length || 0);
    return (
      <DocumentSelectionScreen
        documents={documents}
        selectedDocuments={selectedDocuments}
        onSelectDocument={(doc) => {
          const isSelected = selectedDocuments.some((d) => d.id === doc.id);
          if (isSelected) {
            setSelectedDocuments(selectedDocuments.filter((d) => d.id !== doc.id));
          } else {
            setSelectedDocuments([...selectedDocuments, doc]);
          }
        }}
        onGenerateQuiz={handleGenerateQuiz}
        loading={loading}
        generatingQuiz={generatingQuiz}
      />
    );
  }

  console.log('QuizScreen: Showing quiz content with', questions.length, 'questions');
  return <QuizContentScreen questions={questions} navigation={navigation} />;
}

// Document Selection Screen
function DocumentSelectionScreen({
  documents,
  selectedDocuments,
  onSelectDocument,
  onGenerateQuiz,
  loading,
  generatingQuiz,
}: {
  documents: Document[];
  selectedDocuments: Document[];
  onSelectDocument: (doc: Document) => void;
  onGenerateQuiz: () => void;
  loading: boolean;
  generatingQuiz: boolean;
}) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerNoGradient}>
        <Text style={styles.headerTitleSmall}>Select Documents</Text>
        <Text style={styles.headerSubtitleSmall}>
          Choose documents to generate quiz questions
        </Text>
      </View>

      {/* Documents List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        ) : documents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No documents available</Text>
            <Text style={styles.emptySubtext}>Upload documents first to generate quizzes</Text>
          </View>
        ) : (
          <View>
            {documents.map((doc) => {
              const isSelected = selectedDocuments.some((d) => d.id === doc.id);
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={[
                    styles.documentCard,
                    isSelected && styles.documentCardSelected,
                  ]}
                  onPress={() => onSelectDocument(doc)}
                  activeOpacity={0.7}
                >
                  <View style={styles.documentCheckbox}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="#fff" />
                    )}
                  </View>

                  <View style={styles.documentContent}>
                    <Text style={styles.documentTitle}>{doc.title}</Text>
                    {doc.description && (
                      <Text style={styles.documentDescription} numberOfLines={2}>
                        {doc.description}
                      </Text>
                    )}
                    <View style={styles.documentMeta}>
                      <View style={styles.subjectBadge}>
                        <Text style={styles.subjectBadgeText}>{doc.subject}</Text>
                      </View>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.documentSelector,
                      isSelected && styles.documentSelectorSelected,
                    ]}
                  >
                    <View
                      style={[
                        styles.selectCircle,
                        isSelected && styles.selectCircleSelected,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.selectedCountText}>
          {selectedDocuments.length} selected
        </Text>
        <TouchableOpacity
          style={[
            styles.generateButton,
            (selectedDocuments.length === 0 || generatingQuiz) &&
              styles.generateButtonDisabled,
          ]}
          onPress={onGenerateQuiz}
          disabled={selectedDocuments.length === 0 || generatingQuiz}
          activeOpacity={0.8}
        >
          {generatingQuiz ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.generateButtonText}>Generating...</Text>
            </>
          ) : (
            <>
              <Text style={styles.generateButtonText}>Generate Quiz</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Quiz Content Screen (original quiz)
function QuizContentScreen({
  questions,
  navigation,
  onBack,
}: {
  questions: Question[];
  navigation: QuizScreenNavigationProp;
  onBack?: () => void;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCorrect = selectedAnswer !== null ? selectedAnswer === currentQuestion.correctAnswer : false;
  
  // Prevent duplicate questions - ensure we're showing the correct question
  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerTitleSmall}>Quiz Error</Text>
        <Text style={styles.headerSubtitleSmall}>No questions available</Text>
      </View>
    );
  }

  // Count answered questions correctly - don't double count the current answer
  const answeredCount = answers.length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowCorrectAnswer(true);
  };

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
        // Calculate correct percentage from response
        const quizResults = response.data;
        const correctCount = quizResults.results?.filter((r: any) => r.isCorrect).length || 0;
        const totalCount = quizResults.results?.length || quizResults.total || finalAnswers.length;
        const calculatedPercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
        
        // Ensure percentage is calculated correctly
        quizResults.percentage = calculatedPercentage;
        quizResults.score = correctCount;
        quizResults.total = totalCount;
        
        console.log('Quiz Results:', { score: quizResults.score, total: quizResults.total, percentage: quizResults.percentage });
        navigation.navigate('Results', { results: quizResults });
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
          <Text style={styles.categoryLabel}>
            Quiz
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

  // ===== Scroll Views =====
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  // ===== Loading and Empty States =====
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 6,
    fontSize: 12,
    color: '#999',
  },

  // ===== Document Card Styles =====
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  documentCardSelected: {
    borderLeftColor: '#6200ee',
    backgroundColor: '#f9f5ff',
  },
  documentCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  documentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectBadge: {
    backgroundColor: '#f3e5f5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6200ee',
  },
  documentSelector: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#d0d0d0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  documentSelectorSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#6200ee',
  },
  selectCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  selectCircleSelected: {
    backgroundColor: '#6200ee',
  },
  documentContent: {
    flex: 1,
  },

  // ===== Bottom Bar Styles =====
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 24,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  generateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6200ee',
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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

