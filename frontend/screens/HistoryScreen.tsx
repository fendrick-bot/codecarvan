import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface HistoryItem {
  id: string;
  quizName: string;
  subject: string;
  date: string;
  score: number;
  totalQuestions: number;
  timeTaken: string;
}

export default function HistoryScreen({ navigation }: any) {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: '1',
      quizName: 'Mathematics Basics',
      subject: 'Math',
      date: '2025-11-14',
      score: 85,
      totalQuestions: 20,
      timeTaken: '25 mins',
    },
    {
      id: '2',
      quizName: 'Science Chapter 5',
      subject: 'Science',
      date: '2025-11-12',
      score: 72,
      totalQuestions: 15,
      timeTaken: '18 mins',
    },
    {
      id: '3',
      quizName: 'English Grammar',
      subject: 'English',
      date: '2025-11-10',
      score: 90,
      totalQuestions: 20,
      timeTaken: '22 mins',
    },
    {
      id: '4',
      quizName: 'Social Studies',
      subject: 'Social',
      date: '2025-11-08',
      score: 78,
      totalQuestions: 25,
      timeTaken: '30 mins',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#f44336';
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => (
    <TouchableOpacity style={styles.historyCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.quizName}>{item.quizName}</Text>
          <Text style={styles.subject}>{item.subject}</Text>
        </View>
        <View style={[styles.scoreContainer, { backgroundColor: getScoreColor(item.score) }]}>
          <Text style={styles.scoreText}>{item.score}%</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={14} color="#666" />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="checkmark-circle" size={14} color="#666" />
          <Text style={styles.detailText}>
            {Math.round((item.score / 100) * item.totalQuestions)}/{item.totalQuestions}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.detailText}>{item.timeTaken}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quiz History</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
          </View>
        ) : history.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{history.length}</Text>
                <Text style={styles.statLabel}>Quizzes Taken</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {Math.round(history.reduce((acc, item) => acc + item.score, 0) / history.length)}%
                </Text>
                <Text style={styles.statLabel}>Average Score</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{history.length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>

            <FlatList
              data={history}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No quiz history yet</Text>
            <Text style={styles.emptySubText}>Start taking quizzes to build your history</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  listContainer: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitleContainer: {
    flex: 1,
  },
  quizName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subject: {
    fontSize: 12,
    color: '#999',
  },
  scoreContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
