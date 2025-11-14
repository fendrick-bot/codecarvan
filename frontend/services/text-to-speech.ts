// Text-to-Speech Service using ElevenLabs
import * as FileSystem from 'expo-file-system';

interface TextToSpeechOptions {
  text: string;
  apiKey: string;
  voiceId?: string;
  fileName?: string;
}

const TextToSpeechModule = {
  /**
   * Convert text to speech using ElevenLabs API and save MP3 locally
   * @param {string} text - The text to convert to speech
   * @param {string} apiKey - Your ElevenLabs API key
   * @param {string} voiceId - ElevenLabs voice ID (default: "JBFqnCBsd6RMkjVDRZzb")
   * @param {string} fileName - Optional custom filename (without extension)
   * @returns {Promise<string>} - Path to saved MP3 file
   */
  convertAndSave: async (
    text: string,
    apiKey: string,
    voiceId: string = "JBFqnCBsd6RMkjVDRZzb",
    fileName?: string
  ): Promise<string> => {
    try {
      // Call ElevenLabs API with query parameter for output format
      const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API Error ${response.status}: ${errorText}`);
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioBuffer = await audioBlob.arrayBuffer();

      // Generate file path
      const timestamp = Date.now();
      const audioFileName = fileName ? `${fileName}.mp3` : `speech_${timestamp}.mp3`;
      const filePath = `${FileSystem.documentDirectory}${audioFileName}`;

      // Save to local file system as base64
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      await FileSystem.writeAsStringAsync(filePath, base64Audio, {
        encoding: 'base64',
      });

      console.log('Audio saved successfully at:', filePath);
      return filePath;

    } catch (error) {
      console.error('Error in text-to-speech conversion:', error);
      throw error;
    }
  }
};

export default TextToSpeechModule;