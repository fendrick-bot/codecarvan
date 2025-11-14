import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import RNFS from 'react-native-fs';

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
      // Initialize ElevenLabs client
      const client = new ElevenLabsClient({
        apiKey: apiKey,
      });

      // Generate audio from text
      const audio = await client.textToSpeech.convert(voiceId, {
        outputFormat: "mp3_44100_128",
        text: text,
        modelId: "eleven_multilingual_v2",
      });

      // Convert audio stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);

      // Generate file path
      const timestamp = Date.now();
      const audioFileName = fileName ? `${fileName}.mp3` : `speech_${timestamp}.mp3`;
      const filePath = `${RNFS.DocumentDirectoryPath}/${audioFileName}`;

      // Save to local file system
      await RNFS.writeFile(filePath, audioBuffer.toString('base64'), 'base64');

      console.log('Audio saved successfully at:', filePath);
      return filePath;

    } catch (error) {
      console.error('Error in text-to-speech conversion:', error);
      throw error;
    }
  }
};

export default TextToSpeechModule;