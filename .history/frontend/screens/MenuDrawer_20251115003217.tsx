import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
}

export default function MenuDrawer({ navigation }: any) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {} },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.closeDrawer();
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: 'person',
      onPress: () => {
        navigation.navigate('Profile');
        navigation.closeDrawer();
      },
    },
    {
      id: 'progress',
      label: 'My Progress',
      icon: 'trending-up',
      onPress: () => {
        Alert.alert('Progress', 'Coming soon: Track your learning progress');
      },
    },
    {
      id: 'downloads',
      label: 'Offline Resources',
      icon: 'download',
      onPress: () => {
        Alert.alert('Downloads', 'Coming soon: Download resources for offline access');
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onPress: () => {
        Alert.alert('Settings', 'Coming soon: Customize your learning experience');
      },
    },
    {
      id: 'help',
      label: 'Help & Support',
      icon: 'help-circle',
      onPress: () => {
        Alert.alert('Help', 'Contact support: support@examprep.app\nVersion: 1.0.0');
      },
    },
    {
      id: 'about',
      label: 'About',
      icon: 'information-circle',
      onPress: () => {
        Alert.alert(
          'About ExamPrep',
          'ExamPrep v1.0.0\n\nAI-powered learning assistant for rural students\n\n© 2025 ExamPrep Team'
        );
      },
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={60} color="#fff" />
        </View>
        <Text style={styles.userName}>{user?.name || 'Student'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
      </View>

      <ScrollView style={styles.menuList}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={24} color="#6200ee" style={styles.menuIcon} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
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
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuList: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 1,
  },
  menuIcon: {
    marginRight: 15,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});
