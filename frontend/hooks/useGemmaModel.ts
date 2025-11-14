/**
 * React Hook for using the Gemma3 model
 * Provides easy access to model loading and text generation
 */

import { useState, useEffect, useCallback } from 'react';
import { modelService, ModelGenerationOptions } from '../services/modelService';

export interface UseGemmaModelReturn {
  // State
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  
  // Methods
  loadModel: () => Promise<void>;
  generate: (prompt: string, options?: ModelGenerationOptions) => Promise<string>;
  dispose: () => void;
}

/**
 * Hook for using the Gemma3 model
 */
export function useGemmaModel(): UseGemmaModelReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Load the model
   */
  const loadModel = useCallback(async () => {
    if (isLoaded || isLoading) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await modelService.loadModel();
      setIsLoaded(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load model');
      setError(error);
      console.error('Error loading model:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, isLoading]);

  /**
   * Generate text from a prompt
   */
  const generate = useCallback(
    async (prompt: string, options?: ModelGenerationOptions): Promise<string> => {
      if (!isLoaded) {
        throw new Error('Model not loaded. Call loadModel() first.');
      }

      try {
        setError(null);
        const result = await modelService.generate(prompt, options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Generation failed');
        setError(error);
        throw error;
      }
    },
    [isLoaded]
  );

  /**
   * Dispose of the model
   */
  const dispose = useCallback(() => {
    modelService.dispose();
    setIsLoaded(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispose();
    };
  }, [dispose]);

  return {
    isLoaded,
    isLoading,
    error,
    loadModel,
    generate,
    dispose,
  };
}

