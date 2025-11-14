import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
 
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'update' | 'message';
  title: string;
  description: string;
  icon: string;
  color: string;
  timestamp: string;
  read: boolean;
}

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'achievement',
      title: 'Achievement Unlocked!',
      description: 'You scored 90% on the Mathematics quiz. Excellent performance!',
      icon: 'trophy',
      color: '#FFD700',
      timestamp: '2 hours ago',
      read: false,
    },
    {
      id: '2',
      type: 'reminder',
      title: 'Daily Learning Reminder',
      description: 'Time to continue your learning journey. Complete 2 more quizzes today!',
      icon: 'alarm',
      color: '#4ECDC4',
      timestamp: '4 hours ago',
      read: false,
    },
    {
      id: '3',
      type: 'update',
      title: 'New Content Available',
      description: 'New Science resources and quizzes have been added. Check them out!',
      icon: 'star',
      color: '#FF6B6B',
      timestamp: '1 day ago',
      read: true,
    },
    {
      id: '4',
      type: 'message',
      title: 'System Update',
      description: 'We have updated the app with new features and bug fixes.',
      icon: 'information-circle',
      color: '#6200ee',
      timestamp: '2 days ago',
      read: true,
    },
    {
      id: '5',
      type: 'achievement',
      title: '7-Day Streak',
      description: 'Congratulations! You have completed 7 consecutive days of learning.',
      icon: 'flame',
      color: '#FF9500',
      timestamp: '3 days ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'star';
      case 'reminder':
        return 'alarm';
      case 'update':
        return 'refresh';
      case 'message':
        return 'mail';
      default:
        return 'notifications';
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="#fff" />
      </View>

      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteNotification(item.id)}
      >
        <Ionicons name="close" size={20} color="#ccc" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all</Text>
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 28 }} />}
      </View>

      {/* Content */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={true}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No notifications</Text>
          <Text style={styles.emptySubText}>You're all caught up!</Text>
        </View>
      )}
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
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  badge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markAllText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    marginBottom: 10,
    elevation: 2,
  },
  unreadCard: {
    backgroundColor: '#f0f7ff',
    borderLeftWidth: 4,
    borderLeftColor: '#6200ee',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
