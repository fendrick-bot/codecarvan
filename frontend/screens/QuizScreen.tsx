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
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { quizAPI } from '../services/api';

type RootStackParamList = {
  Home: undefined;
  Quiz: { questions: Question[] };
  Results: { results: QuizResults };
};

type QuizScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quiz'>;

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
  route: { params: { questions: Question[] } };
  navigation: QuizScreenNavigationProp;
}

export default function QuizScreen({ route, navigation }: Props) {
  const { questions } = route.params;
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
      <StatusBar style="auto" />
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>

      <ScrollView style={styles.content}>
        <Text style={styles.category}>{currentQuestion.category}</Text>
        <Text style={styles.question}>{currentQuestion.question}</Text>

        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedAnswer === index && styles.optionButtonSelected,
            ]}
            onPress={() => handleAnswerSelect(index)}
          >
            <Text
              style={[
                styles.optionText,
                selectedAnswer === index && styles.optionTextSelected,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.nextButton, submitting && styles.nextButtonDisabled]} 
        onPress={handleNext}
        disabled={submitting}
      >
        <Text style={styles.nextButtonText}>
          {submitting ? 'Submitting...' : isLastQuestion ? 'Submit Quiz' : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200ee',
  },
  progressText: {
    padding: 15,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  category: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 25,
    lineHeight: 28,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionButtonSelected: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#6200ee',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
});

