import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ClearCacheScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [cacheStats, setCacheStats] = useState({
    downloadedResources: '2.5 MB',
    quizData: '1.2 MB',
    images: '3.8 MB',
    offline: '5.1 MB',
  });

  const cacheItems = [
    {
      id: 'resources',
      name: 'Downloaded Resources',
      description: 'Cached PDFs and learning materials',
      size: '2.5 MB',
      icon: 'download',
      color: '#FF6B6B',
    },
    {
      id: 'quizdata',
      name: 'Quiz Data',
      description: 'Quiz questions and answers cache',
      size: '1.2 MB',
      icon: 'help-circle',
      color: '#4ECDC4',
    },
    {
      id: 'images',
      name: 'Images & Media',
      description: 'Cached images and thumbnails',
      size: '3.8 MB',
      icon: 'image',
      color: '#45B7D1',
    },
    {
      id: 'offline',
      name: 'Offline Content',
      description: 'Content for offline learning',
      size: '5.1 MB',
      icon: 'cloud-offline',
      color: '#A29BFE',
    },
  ];

  const totalCacheSize = '12.6 MB';

  const handleClearCache = (itemId: string) => {
    Alert.alert(
      'Clear Cache',
      `Are you sure you want to clear this cache? This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear',
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate clearing cache
              await new Promise((resolve) => setTimeout(resolve, 2000));
              Alert.alert('Success', 'Cache cleared successfully!');
              setLoading(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Cache',
      `This will clear ${totalCacheSize} of cache. This action cannot be undone.`,
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Clear All',
          onPress: async () => {
            setLoading(true);
            try {
              // Simulate clearing all cache
              await new Promise((resolve) => setTimeout(resolve, 2500));
              setCacheStats({
                downloadedResources: '0 MB',
                quizData: '0 MB',
                images: '0 MB',
                offline: '0 MB',
              });
              Alert.alert('Success', 'All cache cleared successfully!');
              setLoading(false);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Storage & Cache</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Total Cache Info */}
        <View style={styles.totalCacheCard}>
          <View style={styles.cacheIconContainer}>
            <Ionicons name="trash" size={40} color="#f44336" />
          </View>
          <View style={styles.cacheInfo}>
            <Text style={styles.totalCacheLabel}>Total Cache Size</Text>
            <Text style={styles.totalCacheSize}>{totalCacheSize}</Text>
            <Text style={styles.cacheDescription}>
              Free up space by clearing unused cache
            </Text>
          </View>
        </View>

        {/* Cache Items */}
        <Text style={styles.sectionTitle}>Cache Breakdown</Text>
        {cacheItems.map((item) => (
          <View key={item.id} style={styles.cacheItemCard}>
            <View style={[styles.itemIconContainer, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon as any} size={24} color="#fff" />
            </View>

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemSize}>{item.size}</Text>
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => handleClearCache(item.id)}
              disabled={loading}
            >
              <Ionicons
                name="close-circle"
                size={24}
                color={loading ? '#ccc' : '#f44336'}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Storage Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FFC107" />
            <Text style={styles.tipsTitle}>Storage Tips</Text>
          </View>
          <Text style={styles.tipText}>
            • Clear cache regularly to maintain optimal app performance
          </Text>
          <Text style={styles.tipText}>
            • Downloaded resources will be cleared, but your progress will be saved
          </Text>
          <Text style={styles.tipText}>
            • You can always re-download content when needed
          </Text>
        </View>

        {/* Clear All Button */}
        <TouchableOpacity
          style={[styles.clearAllButton, loading && styles.disabledButton]}
          onPress={handleClearAll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="trash" size={20} color="#fff" style={styles.buttonIcon} />
              <Text style={styles.clearAllButtonText}>Clear All Cache</Text>
            </>
          )}
        </TouchableOpacity>
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
  totalCacheCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  cacheIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cacheInfo: {
    flex: 1,
  },
  totalCacheLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  totalCacheSize: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 4,
  },
  cacheDescription: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cacheItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  itemSize: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  clearButton: {
    padding: 8,
  },
  tipsCard: {
    backgroundColor: '#fff9e6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
    elevation: 1,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  tipText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  clearAllButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginRight: 10,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
