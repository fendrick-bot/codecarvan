import { HfInference } from '@huggingface/inference';
import * as fs from 'fs';
import * as path from 'path';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

/**
 * Clean text: remove invalid UTF-8 sequences and problematic characters
 */
const sanitizeText = (text: string): string => {
  if (!text) return '';
  
  // Remove control characters except common whitespace
  let cleaned = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Remove invalid UTF-8 sequences and surrogates
  cleaned = cleaned.replace(/[\uD800-\uDFFF]/g, '');
  
  // Replace multiple spaces/newlines with single space
  cleaned = cleaned.replace(/\s+/g, ' ');
  
  // Trim
  cleaned = cleaned.trim();
  
  return cleaned;
};

/**
 * Enhanced PDF text extraction with multiple fallback strategies
 */
export const extractPDFText = async (filePath: string): Promise<string> => {
  console.log(`[extractPDFText] Starting extraction from: ${filePath}`);
  
  // Check if file exists and get size
  if (!fs.existsSync(filePath)) {
    console.error(`[extractPDFText] ✗ File does not exist: ${filePath}`);
    throw new Error(`File not found: ${filePath}`);
  }
  
  const stats = fs.statSync(filePath);
  console.log(`[extractPDFText] File size: ${stats.size} bytes`);
  
  if (stats.size === 0) {
    console.error('[extractPDFText] ✗ File is empty');
    throw new Error('PDF file is empty');
  }
  
  const dataBuffer = fs.readFileSync(filePath);
  console.log(`[extractPDFText] Buffer created: ${dataBuffer.length} bytes`);

  // Strategy 1: Try pdf-parse with default export
  try {
    console.log('[extractPDFText] Trying Strategy 1: pdf-parse (direct import)...');
    const pdfModule: any = await import('pdf-parse');
    console.log(`[extractPDFText] Module keys: ${Object.keys(pdfModule).join(', ')}`);
    
    // Try default export first, then fallback to named exports
    let pdfFunc = pdfModule.default;
    
    // If no default, check for other common export patterns
    if (!pdfFunc) {
      console.log('[extractPDFText] No default export, checking alternatives...');
      pdfFunc = pdfModule.pdf || pdfModule.parsePDF || pdfModule;
    }
    
    if (typeof pdfFunc !== 'function') {
      throw new Error(`Module export is not a function, type: ${typeof pdfFunc}`);
    }
    
    console.log('[extractPDFText] pdf-parse function found, parsing...');
    const data = await pdfFunc(dataBuffer);
    console.log('[extractPDFText] pdf-parse parsing completed');
    
    if (data && data.text && data.text.trim().length > 0) {
      const sanitized = sanitizeText(data.text);
      console.log(`[extractPDFText] ✓ Extracted ${data.text.length} characters (sanitized: ${sanitized.length}) using pdf-parse`);
      return sanitized;
    } else {
      console.warn('[extractPDFText] ⚠ pdf-parse returned empty text');
    }
  } catch (error) {
    console.warn('[extractPDFText] Strategy 1 failed:', (error as Error).message);
  }

  // Strategy 2: Try pdfjs-dist with Uint8Array conversion
  try {
    console.log('[extractPDFText] Trying Strategy 2: pdfjs-dist (Uint8Array mode)...');
    const pdfjs: any = await import('pdfjs-dist');
    console.log('[extractPDFText] pdfjs-dist module loaded');
    
    // Convert Buffer to Uint8Array (pdfjs-dist requires this)
    const uint8Array = new Uint8Array(dataBuffer);
    console.log(`[extractPDFText] Converted Buffer to Uint8Array (${uint8Array.length} bytes)`);
    
    const pdf = await pdfjs.getDocument(uint8Array).promise;
    console.log(`[extractPDFText] PDF loaded, has ${pdf.numPages} pages`);
    
    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 100); // Limit to 100 pages for large files
    
    for (let i = 1; i <= maxPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => (item.str || '').trim())
          .filter((str: string) => str.length > 0)
          .join(' ');
        
        if (pageText.length > 0) {
          fullText += pageText + '\n';
        }
      } catch (pageError) {
        console.warn(`[extractPDFText] Warning: Could not extract page ${i}: ${(pageError as Error).message}`);
      }
    }
    
    if (fullText.trim().length > 0) {
      const sanitized = sanitizeText(fullText);
      console.log(`[extractPDFText] ✓ Extracted ${fullText.length} characters (sanitized: ${sanitized.length}) using pdfjs-dist`);
      return sanitized;
    } else {
      console.warn('[extractPDFText] ⚠ pdfjs-dist extracted empty text');
    }
  } catch (error) {
    console.warn('[extractPDFText] Strategy 2 failed:', (error as Error).message);
  }

  // Strategy 3: Fallback - extract whatever we can with minimal processing
  try {
    console.log('[extractPDFText] Trying Strategy 3: Minimal pdf-parse fallback...');
    
    // Try requiring as CommonJS via dynamic import
    const parsePDF: any = (await import('pdf-parse')).default;
    
    const options = {
      version: 'v2.0.550', // Explicitly set version
      max: 0  // Extract text from all pages
    };
    
    console.log('[extractPDFText] Attempting parse with options:', options);
    const data = await parsePDF(dataBuffer, options);
    
    if (data && data.text) {
      const extractedText = sanitizeText(data.text);
      if (extractedText.length > 0) {
        console.log(`[extractPDFText] ✓ Extracted ${extractedText.length} characters (minimal fallback)`);
        return extractedText;
      }
    }
  } catch (error) {
    console.warn('[extractPDFText] Strategy 3 failed:', (error as Error).message);
  }

  // If all strategies fail, throw error
  console.error('[extractPDFText] ✗ All extraction strategies failed');
  throw new Error(`Could not extract text from PDF: ${path.basename(filePath)}. All extraction methods failed.`);
};

/**
 * Split text into overlapping chunks for better context preservation
 */
export const chunkText = (text: string, chunkSize: number = 500, overlap: number = 50): string[] => {
  if (!text || text.trim().length === 0) {
    console.warn('[chunkText] Empty text provided');
    return [];
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ').trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }
  
  console.log(`[chunkText] Created ${chunks.length} chunks from text (total words: ${words.length})`);
  return chunks;
};

/**
 * Generate embeddings with error handling and validation
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    if (!text || text.trim().length === 0) {
      console.warn('[generateEmbedding] Empty text provided, returning zero vector');
      return Array(384).fill(0);
    }

    // Check if API key is configured
    if (!process.env.HUGGINGFACE_API_KEY) {
      console.error('[generateEmbedding] ✗ HUGGINGFACE_API_KEY is not set');
      throw new Error('HUGGINGFACE_API_KEY environment variable is not configured');
    }

    // Truncate text to avoid API limits (Hugging Face typically supports ~512 tokens)
    const maxLength = 512;
    const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;
    
    // Sanitize to remove any problematic characters
    const sanitized = sanitizeText(truncatedText);

    console.log('[generateEmbedding] Calling Hugging Face API with', sanitized.length, 'characters');

    try {
      const result: any = await hf.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: sanitized
      });

      console.log(`[generateEmbedding] API response:`, {
        type: typeof result,
        isArray: Array.isArray(result),
        isNull: result === null,
        isUndefined: result === undefined,
        value: Array.isArray(result) ? `array[${result.length}]` : result
      });

      // Handle different response formats
      if (!result) {
        console.error('[generateEmbedding] ✗ API returned null/undefined');
        throw new Error('Hugging Face API returned empty response');
      }

      // If result is a single embedding array (not nested)
      if (Array.isArray(result) && result.length > 0 && typeof result[0] === 'number') {
        console.log(`[generateEmbedding] Got direct embedding array with ${result.length} dimensions`);
        return padEmbedding(result as number[], 384);
      }

      // If result is nested array (array of embeddings)
      if (Array.isArray(result) && Array.isArray(result[0])) {
        const embedding = result[0] as number[];
        console.log(`[generateEmbedding] Got nested embedding, first has ${embedding.length} dimensions`);
        return padEmbedding(embedding, 384);
      }

      // If it's some other structure, log it and try to extract
      console.error('[generateEmbedding] ✗ Unexpected result format:', JSON.stringify(result).substring(0, 200));
      throw new Error(`Unexpected API response format: ${typeof result}`);
    } catch (apiError) {
      const errorMsg = (apiError as any).message || String(apiError);
      console.error('[generateEmbedding] API call failed:', errorMsg);
      
      // Check for specific error types
      if (errorMsg.includes('HTTP') || errorMsg.includes('401') || errorMsg.includes('403')) {
        console.error('[generateEmbedding] ✗ Authentication or API error - check your HUGGINGFACE_API_KEY');
      } else if (errorMsg.includes('429') || errorMsg.includes('rate')) {
        console.error('[generateEmbedding] ✗ Rate limited by Hugging Face API - please wait and retry');
      } else if (errorMsg.includes('Connection') || errorMsg.includes('Network')) {
        console.error('[generateEmbedding] ✗ Network error - check your internet connection');
      }
      
      throw apiError;
    }
  } catch (error) {
    console.error('[generateEmbedding] Generation failed:', (error as Error).message);
    // Throw error instead of returning zero vector so upload can fail gracefully
    throw error;
  }
};

/**
 * Helper: Pad or truncate embedding to target dimension
 */
const padEmbedding = (embedding: number[], targetDim: number): number[] => {
  if (embedding.length === targetDim) {
    return embedding;
  }
  
  if (embedding.length > targetDim) {
    console.log(`[padEmbedding] Truncating embedding from ${embedding.length} to ${targetDim} dimensions`);
    return embedding.slice(0, targetDim);
  }
  
  // Pad with zeros
  console.log(`[padEmbedding] Padding embedding from ${embedding.length} to ${targetDim} dimensions`);
  return [...embedding, ...Array(targetDim - embedding.length).fill(0)];
};
