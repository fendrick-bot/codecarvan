import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  Home: undefined;
  QuizMain: { questions: any[] };
  Results: { results: QuizResults };
};

type ResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Results'>;

interface QuizResults {
  score: number;
  total: number;
  percentage: number;
  results: ResultItem[];
}

interface ResultItem {
  questionId: number;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

interface Props {
  route: { params: { results: QuizResults } };
  navigation: ResultsScreenNavigationProp;
}

export default function ResultsScreen({ route, navigation }: Props) {
  const { results } = route.params;
  const { score, total, percentage, results: questionResults } = results;

  const getScoreColor = (): string => {
    if (percentage >= 80) return '#4caf50';
    if (percentage >= 60) return '#ff9800';
    return '#f44336';
  };

  const getScoreMessage = (): string => {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good job!';
    return 'Keep practicing!';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>
            {score} / {total}
          </Text>
          <Text style={[styles.percentageText, { color: getScoreColor() }]}>
            {percentage}%
          </Text>
        </View>

        <Text style={styles.resultsTitle}>Question Review</Text>
        {questionResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultQuestion}>{result.question}</Text>
            <View style={styles.resultDetails}>
              <Text
                style={[
                  styles.resultAnswer,
                  result.isCorrect ? styles.correct : styles.incorrect,
                ]}
              >
                Your Answer: {result.options[result.selectedAnswer]}
                {result.isCorrect ? ' ✓' : ' ✗'}
              </Text>
              {!result.isCorrect && (
                <Text style={styles.correctAnswer}>
                  Correct Answer: {result.options[result.correctAnswer]}
                </Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scoreContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreMessage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: '600',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  resultDetails: {
    marginTop: 5,
  },
  resultAnswer: {
    fontSize: 14,
    marginBottom: 5,
  },
  correct: {
    color: '#4caf50',
  },
  incorrect: {
    color: '#f44336',
  },
  correctAnswer: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
  },
  homeButton: {
    backgroundColor: '#6200ee',
    padding: 18,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

