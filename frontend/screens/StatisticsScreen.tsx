import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ProgressBarAndroid,
  LayoutAnimation,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface SubjectStats {
  subject: string;
  icon: string;
  color: string;
  quizzesTaken: number;
  averageScore: number;
  questionsAttempted: number;
  correctAnswers: number;
  timeSpent: string;
}

export default function StatisticsScreen({ navigation }: any) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  const subjectStats: SubjectStats[] = [
    {
      subject: 'Mathematics',
      icon: 'calculator',
      color: '#FF6B6B',
      quizzesTaken: 12,
      averageScore: 82,
      questionsAttempted: 240,
      correctAnswers: 196,
      timeSpent: '4h 30m',
    },
    {
      subject: 'Science',
      icon: 'beaker',
      color: '#4ECDC4',
      quizzesTaken: 10,
      averageScore: 75,
      questionsAttempted: 200,
      correctAnswers: 150,
      timeSpent: '3h 45m',
    },
    {
      subject: 'English',
      icon: 'book',
      color: '#45B7D1',
      quizzesTaken: 15,
      averageScore: 88,
      questionsAttempted: 300,
      correctAnswers: 264,
      timeSpent: '5h 20m',
    },
    {
      subject: 'Social Studies',
      icon: 'globe',
      color: '#A29BFE',
      quizzesTaken: 8,
      averageScore: 79,
      questionsAttempted: 160,
      correctAnswers: 126,
      timeSpent: '2h 50m',
    },
    {
      subject: 'Computer Science',
      icon: 'laptop',
      color: '#6C5CE7',
      quizzesTaken: 6,
      averageScore: 91,
      questionsAttempted: 120,
      correctAnswers: 109,
      timeSpent: '2h 15m',
    },
  ];

  const overallStats = {
    totalQuizzes: subjectStats.reduce((acc, stat) => acc + stat.quizzesTaken, 0),
    overallAverage: Math.round(
      subjectStats.reduce((acc, stat) => acc + stat.averageScore, 0) / subjectStats.length
    ),
    totalQuestions: subjectStats.reduce((acc, stat) => acc + stat.questionsAttempted, 0),
    correctAnswers: subjectStats.reduce((acc, stat) => acc + stat.correctAnswers, 0),
    totalTimeSpent: '18h 40m',
  };

  const toggleExpand = (subject: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSubject(expandedSubject === subject ? null : subject);
  };

  const accuracy = Math.round((overallStats.correctAnswers / overallStats.totalQuestions) * 100);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistics</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Overall Stats */}
        <Text style={styles.sectionTitle}>Overall Progress</Text>
        <View style={styles.overallStatsContainer}>
          <View style={styles.overallStatCard}>
            <Text style={styles.overallStatNumber}>{overallStats.totalQuizzes}</Text>
            <Text style={styles.overallStatLabel}>Total Quizzes</Text>
          </View>
          <View style={styles.overallStatCard}>
            <Text style={styles.overallStatNumber}>{overallStats.overallAverage}%</Text>
            <Text style={styles.overallStatLabel}>Average Score</Text>
          </View>
          <View style={styles.overallStatCard}>
            <Text style={styles.overallStatNumber}>{accuracy}%</Text>
            <Text style={styles.overallStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.overallStatCard}>
            <Text style={styles.overallStatNumber}>{overallStats.totalTimeSpent}</Text>
            <Text style={styles.overallStatLabel}>Time Spent</Text>
          </View>
        </View>

        {/* Subject-wise Stats */}
        <Text style={styles.sectionTitle}>Subject-wise Performance</Text>
        {subjectStats.map((stat) => (
          <TouchableOpacity
            key={stat.subject}
            style={styles.subjectCard}
            onPress={() => toggleExpand(stat.subject)}
          >
            <View style={styles.subjectCardHeader}>
              <View style={[styles.subjectIconContainer, { backgroundColor: stat.color }]}>
                <Ionicons name={stat.icon as any} size={24} color="#fff" />
              </View>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectName}>{stat.subject}</Text>
                <View style={styles.subjectScoreRow}>
                  <Text style={styles.subjectScore}>
                    {stat.quizzesTaken} quizzes • {stat.averageScore}% avg
                  </Text>
                </View>
              </View>
              <View style={styles.accuracyBadge}>
                <Text style={styles.accuracyText}>
                  {Math.round((stat.correctAnswers / stat.questionsAttempted) * 100)}%
                </Text>
              </View>
              <Ionicons
                name={expandedSubject === stat.subject ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="#666"
              />
            </View>

            {expandedSubject === stat.subject && (
              <View style={styles.expandedContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Questions Attempted:</Text>
                  <Text style={styles.detailValue}>{stat.questionsAttempted}</Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round((stat.correctAnswers / stat.questionsAttempted) * 100)}%`,
                        backgroundColor: stat.color,
                      },
                    ]}
                  />
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Correct Answers:</Text>
                  <Text style={styles.detailValue}>
                    {stat.correctAnswers}/{stat.questionsAttempted}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Time Spent:</Text>
                  <Text style={styles.detailValue}>{stat.timeSpent}</Text>
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 20,
  },
  overallStatsContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  overallStatCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  overallStatNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  overallStatLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  subjectCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  subjectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  subjectScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subjectScore: {
    fontSize: 13,
    color: '#666',
  },
  accuracyBadge: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  accuracyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  expandedContent: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});
