import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface AboutItem {
  title: string;
  content: string;
  icon: string;
}

export default function AboutScreen({ navigation }: any) {
  const aboutItems: AboutItem[] = [
    {
      title: 'Our Mission',
      icon: 'target',
      content:
        'ExamPrep aims to provide accessible, AI-powered learning solutions for students in rural and underserved communities, democratizing quality education.',
    },
    {
      title: 'What We Offer',
      icon: 'star',
      content:
        'Interactive quizzes, offline resources, AI tutoring, progress tracking, and personalized learning paths across multiple subjects and languages.',
    },
    {
      title: 'Technology',
      icon: 'code-working',
      content:
        'Built with cutting-edge technology including machine learning, natural language processing, and offline-first architecture for maximum accessibility.',
    },
    {
      title: 'Our Team',
      icon: 'people',
      content:
        'A passionate team of educators, developers, and AI researchers committed to transforming education in underserved communities.',
    },
  ];

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) => console.error('Failed to open URL:', err));
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About ExamPrep</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="book" size={60} color="#6200ee" />
          </View>
          <Text style={styles.appName}>ExamPrep</Text>
          <Text style={styles.tagline}>AI-Powered Learning for Everyone</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>
        </View>

        {/* About Items */}
        {aboutItems.map((item, index) => (
          <View key={index} style={styles.aboutCard}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon as any} size={24} color="#6200ee" />
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
            </View>
            <Text style={styles.cardContent}>{item.content}</Text>
          </View>
        ))}

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featureTitle}>Key Features</Text>
          <View style={styles.featureGrid}>
            {[
              { icon: 'checkmark-circle', label: 'Interactive Quizzes' },
              { icon: 'download', label: 'Offline Mode' },
              { icon: 'sparkles', label: 'AI Tutoring' },
              { icon: 'trending-up', label: 'Progress Tracking' },
              { icon: 'language', label: 'Multi-Language' },
              { icon: 'wifi-off', label: 'Low Bandwidth' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon as any} size={24} color="#6200ee" />
                </View>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Links Section */}
        <View style={styles.linksSection}>
          <Text style={styles.linksTitle}>Important Links</Text>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => handleOpenLink('https://examprep.app/privacy')}
          >
            <Ionicons name="shield-checkmark" size={20} color="#6200ee" />
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => handleOpenLink('https://examprep.app/terms')}
          >
            <Ionicons name="document-text" size={20} color="#6200ee" />
            <Text style={styles.linkText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => handleOpenLink('https://examprep.app')}
          >
            <Ionicons name="globe" size={20} color="#6200ee" />
            <Text style={styles.linkText}>Visit Our Website</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Company Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ExamPrep Education Pvt. Ltd.</Text>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={16} color="#6200ee" />
            <Text style={styles.infoText}>New Delhi, India</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="mail" size={16} color="#6200ee" />
            <Text style={styles.infoText}>support@examprep.app</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="call" size={16} color="#6200ee" />
            <Text style={styles.infoText}>+91 9876543210</Text>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.socialSection}>
          <Text style={styles.socialTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://facebook.com/examprep')}
            >
              <Ionicons name="logo-facebook" size={24} color="#1877F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://twitter.com/examprep')}
            >
              <Ionicons name="logo-twitter" size={24} color="#1DA1F2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://instagram.com/examprep')}
            >
              <Ionicons name="logo-instagram" size={24} color="#E4405F" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleOpenLink('https://linkedin.com/company/examprep')}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>© 2025 ExamPrep. All rights reserved.</Text>
          <Text style={styles.madeWithText}>Made with ❤️ for Indian students</Text>
        </View>

        <View style={styles.bottomPadding} />
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  versionBadge: {
    backgroundColor: '#6200ee',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  versionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  featuresSection: {
    marginVertical: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureItem: {
    width: '31%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    elevation: 1,
  },
  featureIcon: {
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  linksSection: {
    marginBottom: 24,
  },
  linksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  linkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    elevation: 1,
  },
  linkText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
  },
  socialSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 16,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  madeWithText: {
    fontSize: 12,
    color: '#999',
  },
  bottomPadding: {
    height: 20,
  },
});
