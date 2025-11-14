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

interface Props {
  route: { params?: { questions?: Question[] } };
  navigation: QuizScreenNavigationProp;
}

export default function QuizScreen({ route, navigation }: Props) {
  const questions = route.params?.questions || [];
  
  if (!questions || questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.question}>No questions available. Please select a category and try again.</Text>
      </View>
    );
  }
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
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
      
      {/* Header with Progress */}
      <LinearGradient
        colors={['#6200ee', '#7c4dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.categoryLabel}>{currentQuestion.category}</Text>
              <Text style={styles.progressLabel}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressPercent}>
                {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
              </Text>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      {/* Question Card */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.questionCard}>
          <View style={styles.questionHeader}>
            <View style={styles.categoryBadge}>
              <Ionicons name="folder" size={14} color="#6200ee" />
              <Text style={styles.categoryBadgeText}>{currentQuestion.category}</Text>
            </View>
            <Text style={styles.questionNumber}>Q{currentQuestionIndex + 1}</Text>
          </View>
          
          <Text style={styles.question}>{currentQuestion.question}</Text>

          {/* Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.optionButtonSelected,
                ]}
                onPress={() => handleAnswerSelect(index)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.optionMarker,
                  selectedAnswer === index && styles.optionMarkerSelected,
                ]}>
                  <Text style={[
                    styles.optionMarkerText,
                    selectedAnswer === index && styles.optionMarkerTextSelected,
                  ]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    selectedAnswer === index && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selectedAnswer === index && (
                  <Ionicons name="checkmark-circle" size={24} color="#6200ee" />
                )}
              </TouchableOpacity>
            ))}
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
  header: {
    paddingTop: 35,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressPercent: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
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
  optionMarkerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#999',
  },
  optionMarkerTextSelected: {
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

