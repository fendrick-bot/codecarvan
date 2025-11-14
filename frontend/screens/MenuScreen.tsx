/**
 * Menu/Settings Screen
 * Contains app settings, profile, and other options including logout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
  MainTabs: undefined;
  HomeTab: undefined;
  MenuTab: undefined;
  Quiz: { questions: any[] };
  Results: { results: any };
};

type MenuScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MenuTab'>;

interface Props {
  navigation: MenuScreenNavigationProp;
}

export default function MenuScreen({ navigation }: Props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Exam Prep',
      'Exam Prep App\n\nVersion 1.0.0\n\nA comprehensive exam preparation platform to help you ace your exams!',
      [{ text: 'OK' }]
    );
  };

  const handleContact = () => {
    Alert.alert(
      'Contact Us',
      'Email: support@examprep.com\n\nWe\'d love to hear from you!',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us. We store your quiz results and progress securely. All data is encrypted and only accessible by you.',
      [{ text: 'OK' }]
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using this app, you agree to our terms of service. Use the app responsibly and for educational purposes only.',
      [{ text: 'OK' }]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. You will need to reload categories. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            // Clear cache logic here if needed
            Alert.alert('Success', 'Cache cleared successfully.');
          },
        },
      ]
    );
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    danger = false,
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, danger && styles.menuItemDanger]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.menuIcon}>{icon}</Text>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuItem
            icon="👤"
            title="Profile"
            subtitle="View and edit your profile"
            onPress={() => {
              Alert.alert('Profile', `Name: ${user?.name}\nEmail: ${user?.email}`);
            }}
          />

          <MenuItem
            icon="📊"
            title="Quiz History"
            subtitle="View your past quiz results"
            onPress={() => {
              Alert.alert('Quiz History', 'Quiz history feature coming soon!');
            }}
          />

          <MenuItem
            icon="📈"
            title="Statistics"
            subtitle="Your performance stats"
            onPress={() => {
              Alert.alert('Statistics', 'Statistics feature coming soon!');
            }}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <MenuItem
            icon="🔔"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {
              Alert.alert('Notifications', 'Notification settings coming soon!');
            }}
          />

          <MenuItem
            icon="🌙"
            title="Theme"
            subtitle="Light / Dark mode"
            onPress={() => {
              Alert.alert('Theme', 'Theme settings coming soon!');
            }}
          />

          <MenuItem
            icon="🗑️"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <MenuItem
            icon="ℹ️"
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />

          <MenuItem
            icon="📧"
            title="Contact Us"
            subtitle="Get in touch with support"
            onPress={handleContact}
          />

          <MenuItem
            icon="🔒"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacy}
          />

          <MenuItem
            icon="📄"
            title="Terms of Service"
            subtitle="Terms and conditions"
            onPress={handleTerms}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 10,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemDanger: {
    backgroundColor: '#fff',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
    textAlign: 'center',
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemTitleDanger: {
    color: '#d32f2f',
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d32f2f',
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

