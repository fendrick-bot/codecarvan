import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ContactInfo {
  id: string;
  type: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

export default function ContactUsScreen({ navigation }: any) {
  const [messageText, setMessageText] = useState('');
  const [selectedType, setSelectedType] = useState('general');
  const [sending, setSending] = useState(false);

  const contactInfo: ContactInfo[] = [
    {
      id: 'email',
      type: 'email',
      label: 'Email',
      value: 'support@examprep.app',
      icon: 'mail',
      color: '#FF6B6B',
    },
    {
      id: 'phone',
      type: 'phone',
      label: 'Phone',
      value: '+91 9876543210',
      icon: 'call',
      color: '#4ECDC4',
    },
    {
      id: 'website',
      type: 'website',
      label: 'Website',
      value: 'www.examprep.app',
      icon: 'globe',
      color: '#45B7D1',
    },
    {
      id: 'address',
      type: 'address',
      label: 'Address',
      value: 'New Delhi, India',
      icon: 'location',
      color: '#A29BFE',
    },
  ];

  const issueTypes = [
    { id: 'general', label: 'General Inquiry' },
    { id: 'bug', label: 'Report a Bug' },
    { id: 'feature', label: 'Feature Request' },
    { id: 'feedback', label: 'Feedback' },
  ];

  const handleContactPress = (contact: ContactInfo) => {
    const { type, value } = contact;

    if (type === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (type === 'phone') {
      Linking.openURL(`tel:${value.replace(/\s/g, '')}`);
    } else if (type === 'website') {
      Linking.openURL(`https://${value}`);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    setSending(true);
    try {
      // Simulate sending message
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        'Success',
        'Your message has been sent successfully. We will get back to you soon!',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessageText('');
              setSending(false);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <Ionicons name="help-buoy" size={40} color="#6200ee" />
          <Text style={styles.introTitle}>We're Here to Help</Text>
          <Text style={styles.introText}>
            Have questions or feedback? Reach out to us through any of the channels below.
          </Text>
        </View>

        {/* Direct Contact Methods */}
        <Text style={styles.sectionTitle}>Contact Methods</Text>
        {contactInfo.map((contact) => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactCard}
            onPress={() => handleContactPress(contact)}
          >
            <View style={[styles.contactIconContainer, { backgroundColor: contact.color }]}>
              <Ionicons name={contact.icon as any} size={24} color="#fff" />
            </View>
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>{contact.label}</Text>
              <Text style={styles.contactValue}>{contact.value}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        ))}

        {/* Message Form */}
        <Text style={styles.sectionTitle}>Send us a Message</Text>

        {/* Issue Type */}
        <View style={styles.issueTypeContainer}>
          <Text style={styles.issueTypeLabel}>Issue Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.issueTypeScroll}
          >
            {issueTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.issueTypeChip,
                  selectedType === type.id && styles.selectedIssueType,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Text
                  style={[
                    styles.issueTypeText,
                    selectedType === type.id && styles.selectedIssueTypeText,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input */}
        <View style={styles.messageContainer}>
          <Text style={styles.messageLabel}>Message</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell us what you think or any issue you're facing..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            value={messageText}
            onChangeText={setMessageText}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{messageText.length}/500</Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqCard}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={24} color="#6200ee" />
            <Text style={styles.faqTitle}>FAQ</Text>
          </View>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I reset my password?</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How can I download resources for offline use?</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>What are the subscription benefits?</Text>
            <Ionicons name="chevron-forward" size={18} color="#ccc" />
          </TouchableOpacity>
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendingButton]}
          onPress={handleSendMessage}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={20} color="#fff" style={styles.sendIcon} />
              <Text style={styles.sendButtonText}>Send Message</Text>
            </>
          )}
        </TouchableOpacity>

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
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    elevation: 2,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginTop: 20,
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  contactIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  issueTypeContainer: {
    marginBottom: 16,
  },
  issueTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  issueTypeScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  issueTypeChip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
  },
  selectedIssueType: {
    backgroundColor: '#6200ee',
    borderColor: '#6200ee',
  },
  issueTypeText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  selectedIssueTypeText: {
    color: '#fff',
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    maxHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  faqTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  faqQuestion: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  sendButton: {
    backgroundColor: '#6200ee',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  sendingButton: {
    opacity: 0.7,
  },
  sendIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 10,
  },
});
