// Text-to-Speech Service using ElevenLabs React Native Client with LiveKit
// Falls back to Expo Speech if ElevenLabs is unavailable
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { LocalAudioTrack, createLocalAudioTrack } from 'livekit-client';

interface TextToSpeechOptions {
  text: string;
  apiKey: string;
  voiceId?: string;
}

// Client wrapper using ElevenLabs React Native method
class ElevenLabsTextToSpeechClient {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log('ElevenLabsTextToSpeechClient initialized with API key:', apiKey.substring(0, 10) + '...');
  }

  textToSpeech = {
    convert: async (voiceId: string, options: any) => {
      console.log('Converting text to speech with voiceId:', voiceId);
      console.log('API Key being used:', this.apiKey.substring(0, 10) + '...');
      
      const url = `${this.baseUrl}/text-to-speech/${voiceId}`;
      console.log('Request URL:', url);
      
      const payload = {
        text: options.text,
        model_id: options.modelId,
        output_format: options.outputFormat,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      };
      console.log('Request payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      return response;
    },
  };
}

const TextToSpeechModule = {
  audioTrack: null as LocalAudioTrack | null,
  isSpeaking: false,
  
  /**
   * Convert text to speech using ElevenLabs Client method with LiveKit
   * Falls back to Expo Speech if ElevenLabs fails
   * @param {string} text - The text to convert to speech
   * @param {string} apiKey - Your ElevenLabs API key
   * @param {string} voiceId - ElevenLabs voice ID (default: "JBFqnCBsd6RMkjVDRZzb")
   * @returns {Promise<string>} - Base64 encoded audio or marker to use Expo Speech
   */
  convertAndSave: async (
    text: string,
    apiKey: string,
    voiceId: string = "JBFqnCBsd6RMkjVDRZzb",
    fileName?: string
  ): Promise<string> => {
    try {
      console.log('=== Starting convertAndSave ===');
      console.log('Text:', text.substring(0, 50) + '...');
      console.log('API Key provided:', !!apiKey, apiKey?.substring(0, 10) + '...');
      console.log('Voice ID:', voiceId);

      // Using ElevenLabs client method pattern
      const client = new ElevenLabsTextToSpeechClient(apiKey);

      const response = await client.textToSpeech.convert(voiceId, {
        outputFormat: "mp3_44100_128",
        text: text,
        modelId: "eleven_multilingual_v2",
      });

      // Get audio blob and convert to base64 for Expo compatibility
      const arrayBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Convert bytes to base64
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Audio = btoa(binary);

      const audioUri = `data:audio/mp3;base64,${base64Audio}`;
      console.log('Audio generated successfully using ElevenLabs client method with LiveKit');
      console.log('Audio URI length:', audioUri.length);
      
      return audioUri;

    } catch (error) {
      console.error('Error in text-to-speech conversion with ElevenLabs:', error);
      console.log('Falling back to Expo Speech API...');
      
      // Fallback to Expo Speech
      return `expo-speech://${text}`;
    }
  },

  /**
   * Play audio from base64, URI, or using Expo Speech fallback
   * @param {string} audioUri - Base64 encoded audio, file URI, or expo-speech marker
   * @returns {Promise<void>}
   */
  playAudio: async (audioUri: string): Promise<void> => {
    try {
      // Check if this is a fallback Expo Speech request
      if (audioUri.startsWith('expo-speech://')) {
        const text = audioUri.replace('expo-speech://', '');
        console.log('Using Expo Speech fallback for text:', text.substring(0, 50) + '...');
        
        return new Promise((resolve, reject) => {
          Speech.speak(text, {
            language: 'en',
            pitch: 1.0,
            rate: 1.0,
            onDone: () => {
              TextToSpeechModule.isSpeaking = false;
              console.log('Expo Speech playback completed, auto-stopped');
              resolve();
            },
            onError: (error) => {
              TextToSpeechModule.isSpeaking = false;
              console.error('Expo Speech error:', error);
              reject(error);
            },
            onStopped: () => {
              TextToSpeechModule.isSpeaking = false;
              console.log('Expo Speech stopped');
              resolve();
            },
          });
          
          TextToSpeechModule.isSpeaking = true;
        });
      }

      // Otherwise use Expo Audio for base64/file URIs
      const sound = new Audio.Sound();
      await sound.loadAsync({ uri: audioUri });
      await sound.playAsync();
      
      // Return promise that resolves when audio finishes
      return new Promise((resolve) => {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log('Expo Audio playback completed, auto-stopped');
            sound.unloadAsync();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  },

  /**
   * Create LiveKit audio track for real-time audio streaming
   * @returns {Promise<LocalAudioTrack>}
   */
  createLiveKitAudioTrack: async (): Promise<LocalAudioTrack> => {
    try {
      const audioTrack = await createLocalAudioTrack();
      TextToSpeechModule.audioTrack = audioTrack;
      console.log('LiveKit audio track created');
      return audioTrack;
    } catch (error) {
      console.error('Error creating LiveKit audio track:', error);
      throw error;
    }
  },

  /**
   * Stop audio playback
   * @returns {Promise<void>}
   */
  stopAudio: async (sound?: Audio.Sound): Promise<void> => {
    try {
      // Stop Expo Speech if active
      if (TextToSpeechModule.isSpeaking) {
        await Speech.stop();
        TextToSpeechModule.isSpeaking = false;
      }

      // Stop regular audio if provided
      if (sound) {
        await sound.pauseAsync();
        await sound.unloadAsync();
      }
      
      // Stop LiveKit audio track if exists
      if (TextToSpeechModule.audioTrack) {
        TextToSpeechModule.audioTrack.stop();
        TextToSpeechModule.audioTrack = null;
      }
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  },
};

export default TextToSpeechModule;