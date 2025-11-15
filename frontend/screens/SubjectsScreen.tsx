import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface Resource {
  id: string | number;
  title: string;
  description: string;
  subject: string;
  file_name: string;
  file_size?: number;
  created_at?: string;
}


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
  const { subject, resources = [] } = route.params;

  const handleResourcePress = async (resource: Resource) => {
    try {
      // Navigate to PDFViewer screen
      navigation.navigate('PDFViewer', { resource });
    } catch (error) {
      console.error('Error opening PDF:', error);
      Alert.alert('Error', 'Failed to open PDF file. Please try again.');
    }
  };

  const renderResourceCard = ({ item }: { item: Resource }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => handleResourcePress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.resourceHeader}>
        <View style={styles.resourceIcon}>
          <MaterialCommunityIcons name="file-pdf-box" size={32} color="#FF6B6B" />
        </View>
        <View style={styles.resourceHeaderContent}>
          <Text style={styles.resourceTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.resourceSubject}>{item.subject}</Text>
        </View>
      </View>

      <Text style={styles.resourceDescription} numberOfLines={2}>{item.description}</Text>

      <View style={styles.resourceFooter}>
        <Text style={styles.resourceFile}>
          <MaterialCommunityIcons name="paperclip" size={12} /> {item.file_name}
        </Text>
        {item.file_size && (
          <Text style={styles.resourceSize}>
            {(item.file_size / 1024).toFixed(1)} KB
          </Text>
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
          <Text style={styles.headerSubtitle}>
            {resources.length} Resource{resources.length !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>

      {/* Resources List */}
      {resources.length > 0 ? (
        <FlatList
          data={resources}
          renderItem={renderResourceCard}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="file-document-outline" size={48} color="#ccc" />
          <Text style={styles.emptyStateText}>No resources available</Text>
          <Text style={styles.emptyStateSubtext}>Upload PDF files for this subject</Text>
        </View>
      )}
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
  resourceCard: {
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
  resourceHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  resourceIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceHeaderContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resourceSubject: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  resourceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 10,
  },
  resourceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  resourceFile: {
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  resourceSize: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 6,
    textAlign: 'center',
  },
});
