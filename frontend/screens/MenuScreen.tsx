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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';

type MenuStackParamList = {
  MenuMain: undefined;
  Profile: undefined;
  History: undefined;
  Statistics: undefined;
  Notification: undefined;
  Theme: undefined;
  ClearCache: undefined;
  ContactUs: undefined;
  About: undefined;
};

type MenuScreenNavigationProp = StackNavigationProp<MenuStackParamList, 'MenuMain'>;

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
      
      {/* Fixed Header with Profile Section */}
      <LinearGradient
        colors={['#6200ee', '#7c4dff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileSection}
      >
        <View style={styles.headerContent}>
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
          <View style={styles.headerTextContainer}>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Scrollable Menu Items */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <MenuItem
            icon="person"
            title="Profile"
            subtitle="View and edit your profile"
            onPress={() => {
              navigation.navigate('Profile');
            }}
          />

          <MenuItem
            icon="time"
            title="Quiz History"
            subtitle="View your past quiz results"
            onPress={() => {
              navigation.navigate('History');
            }}
          />

          <MenuItem
            icon="bar-chart"
            title="Statistics"
            subtitle="Your performance stats"
            onPress={() => {
              navigation.navigate('Statistics');
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
              navigation.navigate('Notification');
            }}
          />

          <MenuItem
            icon="palette"
            title="Theme & Display"
            subtitle="Light / Dark mode"
            onPress={() => {
              navigation.navigate('Theme');
            }}
          />

          <MenuItem
            icon="trash"
            title="Storage & Cache"
            subtitle="Free up storage space"
            onPress={() => {
              navigation.navigate('ClearCache');
            }}
          />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Information</Text>
          
          <MenuItem
            icon="information-circle"
            title="About"
            subtitle="App version and information"
            onPress={() => {
              navigation.navigate('About');
            }}
          />

          <MenuItem
            icon="mail"
            title="Contact Us"
            subtitle="Get in touch with support"
            onPress={() => {
              navigation.navigate('ContactUs');
            }}
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
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
  profileSection: {
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#6200ee',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff6f00',
  },
  headerTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  menuSection: {
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6200ee',
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 10,
    letterSpacing: 0.8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemDanger: {
    backgroundColor: '#fff',
    borderColor: '#ffebee',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f3e5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  menuItemTitleDanger: {
    color: '#d32f2f',
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  chevron: {
    fontSize: 24,
    color: '#ccc',
    fontWeight: '300',
  },
  logoutButtonContainer: {
    marginHorizontal: 12,
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#d32f2f',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    padding: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButtonText: {
    color: '#d32f2f',
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '500',
  },
});

