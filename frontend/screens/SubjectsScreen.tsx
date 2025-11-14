import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Topic {
  id: string;
  title: string;
  description: string;
  subtopics: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

const subjectData: { [key: string]: Topic[] } = {
  Math: [
    {
      id: '1',
      title: 'Number Systems',
      description: 'Natural, Whole, Integer, Rational, Real numbers',
      subtopics: ['Types of Numbers', 'Operations', 'Properties'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Algebra',
      description: 'Equations, Variables, Expressions, and Functions',
      subtopics: ['Linear Equations', 'Quadratic Equations', 'Polynomials'],
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'Geometry',
      description: 'Shapes, Areas, Volumes, and Theorems',
      subtopics: ['Triangles', 'Circles', 'Polygons', 'Theorems'],
      difficulty: 'Intermediate',
    },
    {
      id: '4',
      title: 'Trigonometry',
      description: 'Angles, Ratios, and Applications',
      subtopics: ['Trigonometric Ratios', 'Identities', 'Applications'],
      difficulty: 'Advanced',
    },
    {
      id: '5',
      title: 'Calculus Basics',
      description: 'Limits, Derivatives, and Integrals',
      subtopics: ['Limits', 'Derivatives', 'Integration'],
      difficulty: 'Advanced',
    },
  ],
  Science: [
    {
      id: '1',
      title: 'Physics Fundamentals',
      description: 'Motion, Forces, Energy, and Waves',
      subtopics: ['Newton\'s Laws', 'Energy', 'Waves', 'Light'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Chemistry Basics',
      description: 'Atoms, Molecules, Reactions, and States of Matter',
      subtopics: ['Atomic Structure', 'Chemical Bonds', 'Reactions', 'Periodic Table'],
      difficulty: 'Beginner',
    },
    {
      id: '3',
      title: 'Biology Essentials',
      description: 'Cells, Genetics, Evolution, and Ecology',
      subtopics: ['Cell Structure', 'Genetics', 'Evolution', 'Ecosystems'],
      difficulty: 'Beginner',
    },
    {
      id: '4',
      title: 'Electricity & Magnetism',
      description: 'Electric Charges, Currents, and Magnetic Fields',
      subtopics: ['Electric Circuits', 'Magnetism', 'Electromagnetism'],
      difficulty: 'Advanced',
    },
  ],
  English: [
    {
      id: '1',
      title: 'Grammar Fundamentals',
      description: 'Parts of Speech, Tenses, and Sentence Structure',
      subtopics: ['Nouns & Verbs', 'Tenses', 'Clauses', 'Sentence Types'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Vocabulary Building',
      description: 'Word meanings, Synonyms, Antonyms, and Usage',
      subtopics: ['Common Words', 'Advanced Words', 'Idioms', 'Phrases'],
      difficulty: 'Beginner',
    },
    {
      id: '3',
      title: 'Reading Comprehension',
      description: 'Understanding texts and answering questions',
      subtopics: ['Passage Types', 'Question Types', 'Strategies'],
      difficulty: 'Intermediate',
    },
    {
      id: '4',
      title: 'Creative Writing',
      description: 'Essay writing, Stories, and Poetry',
      subtopics: ['Essays', 'Stories', 'Poetry', 'Technical Writing'],
      difficulty: 'Intermediate',
    },
    {
      id: '5',
      title: 'Literature Analysis',
      description: 'Classic texts, Authors, and Literary Devices',
      subtopics: ['Shakespeare', 'Modern Literature', 'Literary Devices'],
      difficulty: 'Advanced',
    },
  ],
  Social: [
    {
      id: '1',
      title: 'Ancient History',
      description: 'Civilizations, Empires, and Cultural Development',
      subtopics: ['Egypt', 'Mesopotamia', 'Indus Valley', 'Ancient China'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Medieval History',
      description: 'Kingdom, Rulers, and Social Changes',
      subtopics: ['Medieval Europe', 'Islamic World', 'Indian Kingdoms'],
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'Modern History',
      description: 'Industrial Revolution, Wars, and Independence',
      subtopics: ['Industrial Revolution', 'World Wars', 'Independence Movements'],
      difficulty: 'Intermediate',
    },
    {
      id: '4',
      title: 'Geography Basics',
      description: 'Maps, Climate, Terrain, and Resources',
      subtopics: ['Physical Geography', 'Political Geography', 'Climate Zones'],
      difficulty: 'Beginner',
    },
    {
      id: '5',
      title: 'Civics & Government',
      description: 'Constitutions, Rights, and Political Systems',
      subtopics: ['Indian Constitution', 'Government', 'Citizens Rights'],
      difficulty: 'Intermediate',
    },
  ],
  Computer: [
    {
      id: '1',
      title: 'Computer Basics',
      description: 'Hardware, Software, and Components',
      subtopics: ['Hardware', 'Software', 'Operating Systems'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Internet & Networks',
      description: 'How Internet works, Email, and Online Safety',
      subtopics: ['Internet Basics', 'Email', 'Web Browsing', 'Cybersecurity'],
      difficulty: 'Beginner',
    },
    {
      id: '3',
      title: 'Office Applications',
      description: 'Word Processing, Spreadsheets, and Presentations',
      subtopics: ['MS Word', 'MS Excel', 'PowerPoint'],
      difficulty: 'Beginner',
    },
  ],
  Agriculture: [
    {
      id: '1',
      title: 'Crop Management',
      description: 'Soil, Seeds, Planting, and Harvesting',
      subtopics: ['Soil Types', 'Seed Selection', 'Crop Rotation', 'Harvesting'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Organic Farming',
      description: 'Sustainable and Chemical-free Methods',
      subtopics: ['Composting', 'Pest Management', 'Crop Rotation'],
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'Irrigation Techniques',
      description: 'Water Management and Systems',
      subtopics: ['Drip Irrigation', 'Sprinkler Systems', 'Water Conservation'],
      difficulty: 'Intermediate',
    },
  ],
  GK: [
    {
      id: '1',
      title: 'World Geography',
      description: 'Countries, Capitals, and Important Locations',
      subtopics: ['Countries', 'Capitals', 'Landmarks', 'Natural Wonders'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'Current Affairs',
      description: 'Recent news and global events',
      subtopics: ['Politics', 'Sports', 'Science', 'Entertainment'],
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'Science & Technology',
      description: 'Discoveries, Inventions, and Technology',
      subtopics: ['Discoveries', 'Inventions', 'Space Exploration', 'Technology'],
      difficulty: 'Intermediate',
    },
    {
      id: '4',
      title: 'Sports & Awards',
      description: 'Sports events, Records, and Awards',
      subtopics: ['Olympics', 'World Cups', 'Awards', 'Records'],
      difficulty: 'Beginner',
    },
  ],
  Hindi: [
    {
      id: '1',
      title: 'हिंदी व्याकरण',
      description: 'संज्ञा, सर्वनाम, क्रिया और वाक्य',
      subtopics: ['संज्ञा', 'सर्वनाम', 'क्रिया', 'विशेषण'],
      difficulty: 'Beginner',
    },
    {
      id: '2',
      title: 'हिंदी साहित्य',
      description: 'कवि, लेखक और महत्वपूर्ण कृतियाँ',
      subtopics: ['प्राचीन साहित्य', 'आधुनिक साहित्य', 'प्रसिद्ध कवि'],
      difficulty: 'Intermediate',
    },
    {
      id: '3',
      title: 'शब्दावली विस्तार',
      description: 'समानार्थी, विलोम और मुहावरे',
      subtopics: ['समानार्थी शब्द', 'विलोम शब्द', 'मुहावरे', 'लोकोक्तियाँ'],
      difficulty: 'Intermediate',
    },
  ],
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return '#00B894';
    case 'Intermediate':
      return '#F7B731';
    case 'Advanced':
      return '#FF6B6B';
    default:
      return '#6C5CE7';
  }
};

export default function SubjectsScreen({ route, navigation }: any) {
  const { subject } = route.params;
  const topics = subjectData[subject.subject] || [];

  const handleTopicPress = (topic: Topic) => {
    navigation.navigate('Lesson', { topic, subject });
  };

  const renderTopicCard = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={styles.topicCard}
      onPress={() => handleTopicPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.topicHeader}>
        <View style={styles.topicNumber}>
          <Text style={styles.topicNumberText}>{item.id}</Text>
        </View>
        <View style={styles.topicHeaderContent}>
          <Text style={styles.topicTitle}>{item.title}</Text>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: getDifficultyColor(item.difficulty) + '20' },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: getDifficultyColor(item.difficulty) },
              ]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.topicDescription}>{item.description}</Text>

      <View style={styles.subtopicsContainer}>
        {item.subtopics.slice(0, 2).map((subtopic, index) => (
          <View key={index} style={styles.subtopicTag}>
            <Text style={styles.subtopicText}>{subtopic}</Text>
          </View>
        ))}
        {item.subtopics.length > 2 && (
          <View style={styles.subtopicTag}>
            <Text style={styles.subtopicText}>+{item.subtopics.length - 2} more</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: subject.iconColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{subject.title}</Text>
          <Text style={styles.headerSubtitle}>{topics.length} Topics</Text>
        </View>
      </View>

      {/* Topics List */}
      <FlatList
        data={topics}
        renderItem={renderTopicCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  topicCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  topicHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  topicNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topicNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  topicHeaderContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  topicDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  subtopicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subtopicTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 4,
  },
  subtopicText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
});
