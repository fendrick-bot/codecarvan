import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { CONFIG } from '../config/env';
import TextToSpeechModule from '../services/text-to-speech';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isPlaying?: boolean;
  audioPath?: string;
}

// Get API key from config
const ELEVENLABS_API_KEY = CONFIG.ELEVEN_LABS_API_KEY;
const DEFAULT_VOICE_ID = CONFIG.DEFAULT_VOICE_ID;

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI Learning Assistant. I\'m here to help you with any questions about your studies. Type a question or topic you\'d like to learn about!',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  // Request audio permissions on mount
  useEffect(() => {
    requestAudioPermissions();
    return () => {
      // Cleanup sound on unmount
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const requestAudioPermissions = async () => {
    try {
      // Set audio mode for playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Error setting audio mode:', error);
    }
  };

  const generateAIResponse = async (userInput: string): Promise<string> => {
    try {
      // Simulate AI response for now (replace with actual API call later)
      const responses = [
        `That's a great question about "${userInput}"! Let me help you understand this better. This is a complex topic that involves several key concepts. First, we need to understand the fundamentals. Keep practicing and you'll master this!`,
        `Excellent inquiry! Regarding "${userInput}", here's what you need to know: This concept is fundamental to your learning. Break it down into smaller parts and practice regularly. You're on the right track!`,
        `I love your curiosity about "${userInput}"! Here's a comprehensive explanation: Understanding this requires patience and practice. Start with the basics, then gradually move to more advanced topics. Don't give up!`,
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  };

  const generateAudioFromText = async (text: string, messageId: string) => {
    setIsGeneratingAudio(true);
    try {
      console.log('Starting audio generation using TextToSpeechModule');
      
      // Use the TextToSpeechModule to generate and save audio
      const filePath = await TextToSpeechModule.convertAndSave(
        text,
        ELEVENLABS_API_KEY,
        DEFAULT_VOICE_ID,
        `speech_${messageId}`
      );

      console.log('Audio file created at:', filePath);

      // Update message with audio path
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId ? { ...msg, audioPath: filePath } : msg
        )
      );

      Alert.alert('Success', 'Audio generated successfully!');
    } catch (error) {
      console.error('Error generating audio:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Error', `Failed to generate audio:\n${errorMessage}`);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playAudio = async (audioPath: string, messageId: string) => {
    try {
      // Stop current playback if any
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }

      // Load and play new audio
      const sound = new Audio.Sound();
      try {
        await sound.loadAsync({ uri: audioPath });
        await sound.playAsync();
        soundRef.current = sound;
        setPlayingMessageId(messageId);

        // Handle playback status
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setPlayingMessageId(null);
          }
        });
      } catch (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Failed to play audio');
    }
  };

  const stopAudio = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      setPlayingMessageId(null);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate delay for AI response
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(inputText);
      const assistantMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);

      // Auto-scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="auto" />

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageWrapper,
              message.sender === 'user'
                ? styles.userMessageWrapper
                : styles.assistantMessageWrapper,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.sender === 'user'
                  ? styles.userMessage
                  : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.sender === 'user'
                    ? styles.userMessageText
                    : styles.assistantMessageText,
                ]}
              >
                {message.text}
              </Text>

              {/* Audio Controls for Assistant Messages */}
              {message.sender === 'assistant' && (
                <View style={styles.audioControls}>
                  {!message.audioPath ? (
                    <TouchableOpacity
                      style={styles.generateButton}
                      onPress={() => generateAudioFromText(message.text, message.id)}
                      disabled={isGeneratingAudio}
                    >
                      {isGeneratingAudio ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="volume-high" size={16} color="#fff" />
                          <Text style={styles.generateButtonText}>Generate Audio</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.playButton,
                        playingMessageId === message.id && styles.playButtonActive,
                      ]}
                      onPress={() =>
                        playingMessageId === message.id
                          ? stopAudio()
                          : playAudio(message.audioPath!, message.id)
                      }
                    >
                      <Ionicons
                        name={
                          playingMessageId === message.id
                            ? 'stop-circle'
                            : 'play-circle'
                        }
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.playButtonText}>
                        {playingMessageId === message.id ? 'Stop' : 'Play'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Section */}
      <View style={styles.inputSection}>
        <TextInput
          style={styles.input}
          placeholder="Ask me anything..."
          placeholderTextColor="#999"
          value={inputText}
          onChangeText={setInputText}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  assistantMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#6200ee',
  },
  assistantMessage: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  assistantMessageText: {
    color: '#333',
  },
  audioControls: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196f3',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  playButtonActive: {
    backgroundColor: '#f44336',
  },
  playButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  inputSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#f9f9f9',
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});
