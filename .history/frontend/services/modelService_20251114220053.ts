/**
 * Gemma3 Model Service
 * Handles loading and running the Gemma3 model offline in React Native
 */

import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

// Model configuration
const MODEL_CONFIG = {
  // For Expo: Use Asset.fromModule() or copy to app bundle
  // The model should be in frontend/assets/models/gemma3/ directory
  modelPath: '\Users\mritu\Downloads\Examprep\gemma3_instruct270m\model.weights.h5',
  vocabularySize: 262144,
  maxSequenceLength: 1024,
  contextWindow: 512,
};

export interface ModelGenerationOptions {
  maxLength?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

class ModelService {
  private model: tf.LayersModel | null = null;
  private tokenizer: any = null;
  private isLoaded = false;
  private isLoading = false;

  /**
   * Initialize TensorFlow.js for React Native
   */
  async initializeTF(): Promise<void> {
    // Wait for TensorFlow.js to be ready
    await tf.ready();
    console.log('TensorFlow.js initialized');
  }

  /**
   * Load the model from local assets
   * For Expo: Copy the converted TensorFlow.js model to frontend/assets/models/gemma3/
   */
  async loadModel(): Promise<void> {
    if (this.isLoaded && this.model) {
      console.log('Model already loaded');
      return;
    }

    if (this.isLoading) {
      console.log('Model is already loading...');
      return;
    }

    this.isLoading = true;

    try {
      await this.initializeTF();

      console.log('Loading Gemma3 model...');

      // Option 1: Load from bundled assets (recommended for Expo)
      // Make sure model is in frontend/assets/models/gemma3/
      try {
        // Try to load from bundled resource using Asset
        const modelAsset = Asset.fromModule(require('../assets/models/gemma3/model.json'));
        await modelAsset.downloadAsync();
        
        const modelUri = modelAsset.localUri || modelAsset.uri;
        if (!modelUri) {
          throw new Error('Could not get model URI from asset');
        }

        // Extract the base directory
        const modelBaseUri = modelUri.replace('/model.json', '') + '/';
        
        // Load the model using file:// protocol for React Native
        this.model = await tf.loadLayersModel(
          `file://${modelBaseUri}model.json`
        );
      } catch (assetError) {
        console.log('Error loading from assets, trying file system...', assetError);
        
        // Option 2: Try loading from document directory (if model was copied there)
        try {
          const docDir = FileSystem.documentDirectory;
          if (!docDir) {
            throw new Error('Document directory not available');
          }

          const modelUri = `${docDir}models/gemma3/model.json`;
          const fileInfo = await FileSystem.getInfoAsync(modelUri);
          
          if (fileInfo.exists) {
            const modelBaseUri = `${docDir}models/gemma3/`;
            this.model = await tf.loadLayersModel(
              `file://${modelBaseUri}model.json`
            );
          } else {
            throw new Error(
              'Model not found. Please copy the converted TensorFlow.js model to:\n' +
              'frontend/assets/models/gemma3/\n\n' +
              'Then run the conversion script: python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3\n' +
              'See SETUP_OFFLINE.md for detailed instructions.'
            );
          }
        } catch (fsError) {
          throw new Error(
            'Model loading failed. Please ensure the TensorFlow.js model is properly bundled.\n' +
            'Run: python convert_to_tfjs.py --output-path ../frontend/assets/models/gemma3\n' +
            'See SETUP_OFFLINE.md for detailed instructions.\n' +
            `Error: ${fsError}`
          );
        }
      }

      console.log('Model loaded successfully!');
      console.log('Model input shape:', this.model.inputs[0].shape);
      console.log('Model output shape:', this.model.outputs[0].shape);

      // Load tokenizer (you'll need to implement tokenizer loading)
      await this.loadTokenizer();

      this.isLoaded = true;
      this.isLoading = false;
    } catch (error) {
      this.isLoading = false;
      console.error('Error loading model:', error);
      throw error;
    }
  }

  /**
   * Load tokenizer
   * Note: You'll need to implement tokenizer loading based on your tokenizer format
   */
  private async loadTokenizer(): Promise<void> {
    try {
      // For SentencePiece tokenizer, you may need to use a JS library
      // or implement a simple tokenizer wrapper
      console.log('Tokenizer loading (implement based on your needs)');
      // TODO: Implement tokenizer loading
    } catch (error) {
      console.error('Error loading tokenizer:', error);
      throw error;
    }
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(): boolean {
    return this.isLoaded && this.model !== null;
  }

  /**
   * Get model instance
   */
  getModel(): tf.LayersModel | null {
    return this.model;
  }

  /**
   * Tokenize input text
   * This is a placeholder - implement based on your tokenizer
   */
  private tokenize(text: string): number[] {
    // TODO: Implement actual tokenization using the tokenizer
    // For now, return a simple placeholder
    // You'll need to use the SentencePiece vocabulary
    return [];
  }

  /**
   * Detokenize output tokens
   */
  private detokenize(tokens: number[]): string {
    // TODO: Implement actual detokenization
    return '';
  }

  /**
   * Generate text from a prompt
   */
  async generate(
    prompt: string,
    options: ModelGenerationOptions = {}
  ): Promise<string> {
    if (!this.isModelLoaded() || !this.model) {
      throw new Error('Model not loaded. Call loadModel() first.');
    }

    const {
      maxLength = 100,
      temperature = 0.7,
      topP = 0.9,
      topK = 50,
    } = options;

    try {
      // Tokenize input
      const inputTokens = this.tokenize(prompt);
      const inputTensor = tf.tensor2d([inputTokens], [1, inputTokens.length]);

      // Generate tokens
      const generatedTokens: number[] = [];
      let currentTokens = inputTokens;

      for (let i = 0; i < maxLength; i++) {
        // Prepare input
        const input = tf.tensor2d([currentTokens], [1, currentTokens.length]);

        // Run model prediction
        const predictions = this.model.predict(input) as tf.Tensor;
        const predictionsArray = await predictions.array();

        // Apply temperature and sample next token
        const logits = predictionsArray[0][predictionsArray[0].length - 1];
        const nextToken = this.sampleToken(logits, temperature, topP, topK);

        generatedTokens.push(nextToken);
        currentTokens.push(nextToken);

        // Check for end token
        // TODO: Implement end token checking

        // Clean up tensors
        input.dispose();
        predictions.dispose();
      }

      // Detokenize result
      const result = this.detokenize(generatedTokens);
      return result;
    } catch (error) {
      console.error('Error during generation:', error);
      throw error;
    }
  }

  /**
   * Sample a token from logits with temperature, top-p, and top-k sampling
   */
  private sampleToken(
    logits: number[],
    temperature: number,
    topP: number,
    topK: number
  ): number {
    // Apply temperature
    const scaledLogits = logits.map((logit) => logit / temperature);

    // Apply softmax
    const expLogits = scaledLogits.map((x) => Math.exp(x));
    const sumExp = expLogits.reduce((a, b) => a + b, 0);
    const probabilities = expLogits.map((x) => x / sumExp);

    // Top-k filtering
    const topKIndices = probabilities
      .map((prob, idx) => ({ prob, idx }))
      .sort((a, b) => b.prob - a.prob)
      .slice(0, topK)
      .map((item) => item.idx);

    // Top-p (nucleus) filtering
    let cumSum = 0;
    const topPIndices: number[] = [];
    for (const idx of topKIndices) {
      cumSum += probabilities[idx];
      topPIndices.push(idx);
      if (cumSum >= topP) break;
    }

    // Sample from filtered indices
    const filteredProbs = topPIndices.map((idx) => probabilities[idx]);
    const sumFiltered = filteredProbs.reduce((a, b) => a + b, 0);
    const normalizedProbs = filteredProbs.map((p) => p / sumFiltered);

    const random = Math.random();
    let cumProb = 0;
    for (let i = 0; i < normalizedProbs.length; i++) {
      cumProb += normalizedProbs[i];
      if (random <= cumProb) {
        return topPIndices[i];
      }
    }

    return topPIndices[topPIndices.length - 1];
  }

  /**
   * Dispose of the model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
      this.isLoaded = false;
    }
  }
}

// Export singleton instance
export const modelService = new ModelService();

