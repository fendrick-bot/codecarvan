import { Router, Request, Response } from 'express';
import pool from '../db.js';
import { callLLM, callLLMGroq, type LLMRequest } from '../utils/llmService.js';

const router = Router();

/**
 * POST /api/ai/summarize
 * Summarize a PDF document using LLM
 * 
 * Request body:
 * {
 *   "documentId": 1,
 *   "maxTokens": 1000,
 *   "useLLM": "groq" | "huggingface" (default: "groq")
 * }
 */
router.post('/summarize', async (req: Request, res: Response) => {
  try {
    const { documentId, maxTokens = 1000, useLLM = 'groq' } = req.body;

    // Validate input
    if (!documentId) {
      return res.status(400).json({
        success: false,
        error: 'documentId is required'
      });
    }

    // Check if API token is configured
    const apiToken = useLLM === 'groq' 
      ? process.env.GROQ_API_KEY 
      : process.env.HUGGINGFACE_API_KEY;

    if (!apiToken) {
      return res.status(500).json({
        success: false,
        error: `${useLLM === 'groq' ? 'GROQ_API_KEY' : 'HUGGINGFACE_API_KEY'} not configured in environment`
      });
    }

    console.log(`[AI Model] Summarizing document ID: ${documentId} using ${useLLM}`);

    // Step 1: Fetch document metadata and all its chunks from database
    console.log('[AI Model] Step 1: Fetching document and chunks from database');
    
    const docResult = await pool.query(
      `SELECT id, title, description, subject FROM documents WHERE id = $1`,
      [documentId]
    );

    if (!docResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: `Document with ID ${documentId} not found`
      });
    }

    const document = docResult.rows[0];
    console.log(`[AI Model] ✓ Found document: "${document.title}"`);

    // Step 2: Fetch all chunks for this document
    const chunksResult = await pool.query(
      `SELECT id, chunk_text, chunk_index FROM vectors 
       WHERE document_id = $1 
       ORDER BY chunk_index ASC`,
      [documentId]
    );

    if (!chunksResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: `No chunks found for document ID ${documentId}`
      });
    }

    // Combine all chunk text to create full document text
    const fullText = chunksResult.rows
      .map((row: any) => row.chunk_text)
      .join('\n\n');

    console.log(`[AI Model] ✓ Fetched ${chunksResult.rows.length} chunks (${fullText.length} characters)`);

    // Step 3: Prepare summarization prompt
    const summarizationPrompt = `Please provide a concise summary of the following document titled "${document.title}" (Subject: ${document.subject}):

${fullText}

Summary:`;

    const systemPrompt = `You are an expert at summarizing educational documents. 
Provide clear, concise summaries that capture the key points and concepts.
Format the summary in easy-to-read paragraphs.`;

    console.log('[AI Model] Step 2: Calling LLM for summarization');

    // Step 4: Call LLM
    const llmRequest: LLMRequest = {
      prompt: summarizationPrompt,
      systemPrompt: systemPrompt,
      maxTokens: maxTokens,
      temperature: 0.5 // Lower temperature for more focused summaries
    };

    const llmResponse = useLLM === 'groq'
      ? await callLLMGroq(llmRequest, apiToken)
      : await callLLM(llmRequest, apiToken);

    if (!llmResponse.success) {
      console.error('[AI Model] LLM Error:', llmResponse.error);
      return res.status(500).json({
        success: false,
        error: `Failed to generate summary: ${llmResponse.error}`
      });
    }

    console.log('[AI Model] ✓ Summary generated successfully');
    console.log(`[AI Model] Summary length: ${llmResponse.content.length} characters`);

    // Step 5: Return result
    return res.status(200).json({
      success: true,
      data: {
        documentId,
        title: document.title,
        subject: document.subject,
        description: document.description,
        chunksCount: chunksResult.rows.length,
        originalTextLength: fullText.length,
        summary: llmResponse.content,
        llmProvider: useLLM
      }
    });

  } catch (error) {
    console.error('[AI Model] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/ai/explain
 * Get explanation for specific topics from a document
 * 
 * Request body:
 * {
 *   "documentId": 1,
 *   "topic": "What is machine learning?",
 *   "maxTokens": 1500,
 *   "useLLM": "groq" | "huggingface"
 * }
 */
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { documentId, topic, maxTokens = 1500, useLLM = 'groq' } = req.body;

    // Validate input
    if (!documentId || !topic) {
      return res.status(400).json({
        success: false,
        error: 'documentId and topic are required'
      });
    }

    const apiToken = useLLM === 'groq' 
      ? process.env.GROQ_API_KEY 
      : process.env.HUGGINGFACE_API_KEY;

    if (!apiToken) {
      return res.status(500).json({
        success: false,
        error: `${useLLM === 'groq' ? 'GROQ_API_KEY' : 'HUGGINGFACE_API_KEY'} not configured`
      });
    }

    console.log(`[AI Model] Explaining topic: "${topic}" from document ID: ${documentId}`);

    // Fetch document and chunks
    const docResult = await pool.query(
      `SELECT id, title, subject FROM documents WHERE id = $1`,
      [documentId]
    );

    if (!docResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: `Document with ID ${documentId} not found`
      });
    }

    const document = docResult.rows[0];

    const chunksResult = await pool.query(
      `SELECT chunk_text FROM vectors 
       WHERE document_id = $1 
       ORDER BY chunk_index ASC`,
      [documentId]
    );

    if (!chunksResult.rows.length) {
      return res.status(404).json({
        success: false,
        error: `No chunks found for document`
      });
    }

    const fullText = chunksResult.rows
      .map((row: any) => row.chunk_text)
      .join('\n\n');

    // Prepare explanation prompt
    const explanationPrompt = `Based on the following document about "${document.subject}":

${fullText}

Please explain: ${topic}

Provide a clear, educational explanation with examples if applicable.`;

    const systemPrompt = `You are an expert educational tutor. 
Explain concepts clearly and make them easy to understand.
Use examples and analogies when helpful.`;

    // Call LLM
    const llmRequest: LLMRequest = {
      prompt: explanationPrompt,
      systemPrompt: systemPrompt,
      maxTokens: maxTokens,
      temperature: 0.6
    };

    const llmResponse = useLLM === 'groq'
      ? await callLLMGroq(llmRequest, apiToken)
      : await callLLM(llmRequest, apiToken);

    if (!llmResponse.success) {
      return res.status(500).json({
        success: false,
        error: `Failed to generate explanation: ${llmResponse.error}`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        documentId,
        title: document.title,
        topic,
        explanation: llmResponse.content,
        llmProvider: useLLM
      }
    });

  } catch (error) {
    console.error('[AI Model] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
