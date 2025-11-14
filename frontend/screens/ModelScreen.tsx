/**
 * Example Screen using the Gemma3 Model
 * Demonstrates how to load and use the model in offline mode
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useGemmaModel } from '../hooks/useGemmaModel';

interface Props {
  navigation: any;
}

export default function ModelScreen({ navigation }: Props) {
  const { isLoaded, isLoading, error, loadModel, generate } = useGemmaModel();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [generating, setGenerating] = useState(false);
  const [maxLength, setMaxLength] = useState(100);
  const [temperature, setTemperature] = useState(0.7);

  const handleLoadModel = async () => {
    try {
      await loadModel();
      Alert.alert('Success', 'Model loaded successfully!');
    } catch (err) {
      Alert.alert('Error', `Failed to load model: ${err}`);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Error', 'Please enter a prompt');
      return;
    }

    setGenerating(true);
    setResponse('');

    try {
      const result = await generate(prompt, {
        maxLength,
        temperature,
      });
      setResponse(result);
    } catch (err) {
      Alert.alert('Error', `Generation failed: ${err}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Gemma3 Model</Text>
        <Text style={styles.subtitle}>Offline AI Text Generation</Text>

        {/* Model Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status:</Text>
          <Text style={[styles.statusText, isLoaded && styles.statusLoaded]}>
            {isLoading ? 'Loading...' : isLoaded ? 'Loaded ✓' : 'Not Loaded'}
          </Text>
          {error && <Text style={styles.errorText}>{error.message}</Text>}
        </View>

        {/* Load Model Button */}
        {!isLoaded && !isLoading && (
          <TouchableOpacity
            style={styles.loadButton}
            onPress={handleLoadModel}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Load Model</Text>
          </TouchableOpacity>
        )}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6200ee" />
            <Text style={styles.loadingText}>Loading model... This may take a minute.</Text>
          </View>
        )}

        {/* Input Section */}
        {isLoaded && (
          <>
            <Text style={styles.label}>Enter your prompt:</Text>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Type your prompt here..."
              multiline
              numberOfLines={4}
              editable={!generating}
            />

            {/* Settings */}
            <View style={styles.settingsContainer}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Max Length: {maxLength}</Text>
                <TextInput
                  style={styles.numberInput}
                  value={maxLength.toString()}
                  onChangeText={(text) => setMaxLength(parseInt(text) || 100)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Temperature: {temperature.toFixed(1)}</Text>
                <TextInput
                  style={styles.numberInput}
                  value={temperature.toString()}
                  onChangeText={(text) => setTemperature(parseFloat(text) || 0.7)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Generate Button */}
            <TouchableOpacity
              style={[styles.generateButton, generating && styles.buttonDisabled]}
              onPress={handleGenerate}
              disabled={generating || !prompt.trim()}
            >
              {generating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate</Text>
              )}
            </TouchableOpacity>

            {/* Response */}
            {response && (
              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>Response:</Text>
                <Text style={styles.responseText}>{response}</Text>
              </View>
            )}
          </>
        )}

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>ℹ️ Information</Text>
          <Text style={styles.infoText}>
            • Model runs completely offline{'\n'}
            • First load may take 30-60 seconds{'\n'}
            • Requires ~1GB free memory{'\n'}
            • Works without internet connection
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e74c3c',
  },
  statusLoaded: {
    color: '#27ae60',
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
  },
  loadButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 15,
  },
  settingsContainer: {
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    width: 80,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: '#6200ee',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  responseContainer: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  infoContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});

