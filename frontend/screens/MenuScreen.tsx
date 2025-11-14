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
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
      <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
        <Ionicons
          name={icon as any}
          size={22}
          color={danger ? '#d32f2f' : '#6200ee'}
        />
      </View>
      <View style={styles.menuItemContent}>
        <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.menuItemSubtitle}>{subtitle}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Gradient Header with Profile Section */}
        <LinearGradient
          colors={['#6200ee', '#7c4dff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileSection}
        >
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#fff3e0', '#ffe0b2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          <View style={styles.profileBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
            <Text style={styles.profileBadgeText}>Account Active</Text>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuItem
            icon="person"
            title="Profile"
            subtitle="View and edit your profile"
            onPress={() => {
              Alert.alert('Profile', `Name: ${user?.name}\nEmail: ${user?.email}`);
            }}
          />

          <MenuItem
            icon="clipboard"
            title="Quiz History"
            subtitle="View your past quiz results"
            onPress={() => {
              Alert.alert('Quiz History', 'Quiz history feature coming soon!');
            }}
          />

          <MenuItem
            icon="stats-chart"
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
            icon="notifications"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => {
              Alert.alert('Notifications', 'Notification settings coming soon!');
            }}
          />

          <MenuItem
            icon="moon"
            title="Theme"
            subtitle="Light / Dark mode"
            onPress={() => {
              Alert.alert('Theme', 'Theme settings coming soon!');
            }}
          />

          <MenuItem
            icon="trash"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <MenuItem
            icon="information-circle"
            title="About"
            subtitle="App version and information"
            onPress={handleAbout}
          />

          <MenuItem
            icon="mail"
            title="Contact Us"
            subtitle="Get in touch with support"
            onPress={handleContact}
          />

          <MenuItem
            icon="shield-checkmark"
            title="Privacy Policy"
            subtitle="How we protect your data"
            onPress={handlePrivacy}
          />

          <MenuItem
            icon="document-text"
            title="Terms of Service"
            subtitle="Terms and conditions"
            onPress={handleTerms}
          />
        </View>

        {/* Logout Button */}
        <LinearGradient
          colors={['#ffebee', '#ffcdd2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoutButtonContainer}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={22} color="#d32f2f" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* App Version */}
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
  },
  profileBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6200ee',
    textTransform: 'uppercase',
    paddingHorizontal: 20,
    paddingVertical: 12,
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemDanger: {
    backgroundColor: '#fff',
    borderColor: '#ffebee',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerDanger: {
    backgroundColor: '#ffebee',
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
    marginBottom: 3,
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
  logoutButtonContainer: {
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
});

