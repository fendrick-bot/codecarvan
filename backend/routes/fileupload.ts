import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import pool from '../db.js';
import { extractPDFText, chunkText, generateEmbedding } from '../utils/pdfProcessor.js';

const router = Router();

// Configure multer with file validation
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Log file details for debugging
  console.log(`[Multer] File received - name: ${file.originalname}, mimetype: ${file.mimetype}, encoding: ${file.encoding}`);
  
  // Allow PDF files (be more permissive with MIME types)
  const isPdf = file.originalname.toLowerCase().endsWith('.pdf') || 
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/x-pdf' ||
                file.mimetype === 'application/octet-stream'; // Some browsers send this
  
  if (isPdf) {
    console.log('[Multer] ✓ File accepted');
    cb(null, true);
  } else {
    console.log('[Multer] ✗ File rejected - not a PDF');
    cb(new Error(`Only PDF files are allowed (received ${file.mimetype})`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Upload endpoint with comprehensive error handling
router.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  let documentId: number | null = null;
  let filePath: string | null = null;

  try {
    const { title, description, subject } = req.body;
    const file = req.file;

    // Validate required fields
    if (!file) {
      console.error('[Upload] ✗ No file provided');
      return res.status(400).json({ error: 'PDF file is required' });
    }

    if (!title || !subject) {
      console.error('[Upload] ✗ Missing title or subject');
      // Clean up file if validation fails
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    filePath = file.path;
    console.log(`[Upload] ✓ File received: ${file.originalname}`);
    console.log(`[Upload] File details - path: ${filePath}, size: ${file.size} bytes, mimetype: ${file.mimetype}`);
    console.log(`[Upload] File exists on disk: ${fs.existsSync(filePath!)}`);
    
    // Verify file was actually written
    if (!fs.existsSync(filePath!)) {
      throw new Error(`File was not saved to disk at ${filePath}`);
    }
    
    console.log(`[Upload] Starting processing for: ${file.originalname} (${file.size} bytes)`);

    // 1. Store document metadata in Postgres
    const docResult = await pool.query(
      'INSERT INTO documents (title, description, subject, file_path) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, description || null, subject, filePath]
    );

    documentId = docResult.rows[0].id;
    console.log(`[Upload] Document created with ID: ${documentId}`);

    // 2. Extract text from PDF
    console.log('[Upload] Extracting text from PDF...');
    const pdfText = await extractPDFText(filePath!);

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    console.log(`[Upload] Extracted text: ${pdfText.length} characters`);

    // 3. Split into chunks
    console.log('[Upload] Chunking text...');
    const chunks = chunkText(pdfText);

    if (chunks.length === 0) {
      throw new Error('No chunks generated from PDF text');
    }

    console.log(`[Upload] Generated ${chunks.length} chunks`);

    // 4. Generate embeddings and store in vector DB
    console.log('[Upload] Generating embeddings...');
    let successCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      try {
        const embedding = await generateEmbedding(chunks[i]);
        
        console.log(`[Upload] Chunk ${i} embedding:`, {
          length: embedding.length,
          first5: embedding.slice(0, 5),
          hasZeros: embedding.every((v: number) => v === 0),
          sample: embedding.slice(0, 3).map((v: number) => v.toFixed(4)).join(', ')
        });
        
        // Convert embedding array to pgvector format: "[0.1, 0.2, 0.3, ...]"
        const embeddingVector = `[${embedding.join(',')}]`;
        
        await pool.query(
          'INSERT INTO vectors (document_id, chunk_text, embedding, chunk_index) VALUES ($1, $2, $3, $4)',
          [documentId, chunks[i], embeddingVector, i]
        );

        successCount++;

        // Log progress every 10 chunks
        if ((i + 1) % 10 === 0) {
          console.log(`[Upload] Progress: ${i + 1}/${chunks.length} chunks processed`);
        }
      } catch (chunkError) {
        const errMsg = `Chunk ${i} failed: ${(chunkError as Error).message}`;
        console.error(`[Upload] ${errMsg}`);
        errors.push(errMsg);
        
        // Continue to next chunk even if this one fails
        // This allows partial uploads when API has issues
      }
    }

    console.log(`[Upload] Completed: ${successCount}/${chunks.length} chunks stored successfully`);

    // Clean up the uploaded file after processing
    try {
    //   if (filePath && fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //     console.log(`[Upload] Temporary file deleted: ${filePath}`);
    //   }
    } catch (deleteError) {
      console.warn('[Upload] Failed to delete temp file:', (deleteError as Error).message);
    }

    // If we got at least some chunks, consider it a partial success
    if (successCount === 0 && chunks.length > 0) {
      // All chunks failed - likely API key issue
      res.status(500).json({
        error: 'Failed to generate embeddings for all chunks',
        details: errors.length > 0 ? errors[0] : 'Unknown error',
        hint: 'Check that HUGGINGFACE_API_KEY is set correctly in your .env file'
      });
    } else {
      res.json({
        success: true,
        documentId,
        chunksProcessed: successCount,
        totalChunks: chunks.length,
        message: `Document uploaded and vectorized successfully (${successCount}/${chunks.length} chunks processed)`,
        warnings: errors.length > 0 ? errors : undefined
      });
    }
  } catch (error) {
    console.error('[Upload] Error:', (error as Error).message);

    // Attempt cleanup
    try {
    //   if (documentId) {
    //     console.log(`[Upload] Deleting document ${documentId} due to error...`);
    //     await pool.query('DELETE FROM documents WHERE id = $1', [documentId]);
    //   }
    //   if (filePath && fs.existsSync(filePath)) {
    //     fs.unlinkSync(filePath);
    //   }
    } catch (cleanupError) {
      console.error('[Upload] Cleanup failed:', (cleanupError as Error).message);
    }

    res.status(500).json({
      error: (error as Error).message || 'Failed to process document',
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
});

// Query endpoint for RAG
router.post('/query', async (req: Request, res: Response) => {
  try {
    const { query, subject, topK = 5 } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`[Query] Processing: "${query}" (topK: ${topK})`);

    const queryEmbedding = await generateEmbedding(query);

    let sqlQuery = `
      SELECT v.chunk_text, d.title, d.subject,
             1 - (v.embedding <=> $1::vector) as similarity
      FROM vectors v
      JOIN documents d ON v.document_id = d.id
    `;

    const params: any[] = [JSON.stringify(queryEmbedding)];

    if (subject) {
      sqlQuery += ` WHERE d.subject = $2`;
      params.push(subject);
    }

    sqlQuery += ` ORDER BY similarity DESC LIMIT $${params.length + 1}`;
    params.push(topK);

    const result = await pool.query(sqlQuery, params);

    console.log(`[Query] Found ${result.rows.length} results`);

    res.json({
      success: true,
      context: result.rows,
      query,
      resultsCount: result.rows.length
    });
  } catch (error) {
    console.error('[Query] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to process query' });
  }
});

// Get all documents
router.get('/documents', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, title, description, subject, uploaded_at, 
              (SELECT COUNT(*) FROM vectors WHERE document_id = documents.id) as chunk_count
       FROM documents ORDER BY uploaded_at DESC`
    );
    res.json({ success: true, documents: result.rows });
  } catch (error) {
    console.error('[Documents] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Delete document
router.delete('/documents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM documents WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('[Delete] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;