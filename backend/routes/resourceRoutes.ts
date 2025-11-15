import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import pool from '../db.js';
import { callLLM, callLLMGroq, type LLMRequest } from '../utils/llmService.js';

const router = Router();

// Configure multer for resource uploads
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = 'uploads/resources';
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
  console.log(`[Multer] File received - name: ${file.originalname}, mimetype: ${file.mimetype}`);
  
  // Allow PDF files
  const isPdf = file.originalname.toLowerCase().endsWith('.pdf') || 
                file.mimetype === 'application/pdf' ||
                file.mimetype === 'application/x-pdf' ||
                file.mimetype === 'application/octet-stream';
  
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

// Upload resource PDF endpoint
router.post('/upload', upload.single('pdf'), async (req: Request, res: Response) => {
  let resourceId: number | null = null;
  let filePath: string | null = null;

  try {
    const { title, description, subject } = req.body;
    const file = req.file;

    // Validate required fields
    if (!file) {
      console.error('[Resource Upload] ✗ No file provided');
      return res.status(400).json({ error: 'PDF file is required' });
    }

    if (!title || !subject) {
      console.error('[Resource Upload] ✗ Missing title or subject');
      if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Title and subject are required' });
    }

    filePath = file.path;
    console.log(`[Resource Upload] ✓ File received: ${file.originalname}`);
    console.log(`[Resource Upload] File details - path: ${filePath}, size: ${file.size} bytes`);
    
    // Verify file was actually written
    if (!fs.existsSync(filePath!)) {
      throw new Error(`File was not saved to disk at ${filePath}`);
    }

    // Store resource metadata in Postgres
    const resourceResult = await pool.query(
      `INSERT INTO resources (title, description, subject, file_path, file_name, file_size) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, title, description, subject, file_name, created_at`,
      [title, description || null, subject, filePath, file.originalname, file.size]
    );

    resourceId = resourceResult.rows[0].id;
    console.log(`[Resource Upload] Resource created with ID: ${resourceId}`);

    res.json({
      success: true,
      resourceId,
      message: 'Resource uploaded successfully',
      resource: resourceResult.rows[0]
    });
  } catch (error) {
    console.error('[Resource Upload] Error:', (error as Error).message);

    // Attempt cleanup
    try {
      if (resourceId) {
        await pool.query('DELETE FROM resources WHERE id = $1', [resourceId]);
      }
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (cleanupError) {
      console.error('[Resource Upload] Cleanup failed:', (cleanupError as Error).message);
    }

    res.status(500).json({
      error: (error as Error).message || 'Failed to upload resource',
      details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
    });
  }
});

// Get all resources
router.get('/list', async (req: Request, res: Response) => {
  try {
    const { subject } = req.query;
    
    let query = 'SELECT id, title, description, subject, file_name, file_size, file_path, created_at FROM resources';
    const params: any[] = [];

    if (subject) {
      query += ' WHERE subject = $1';
      params.push(subject);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    console.log(`[Get Resources] Found ${result.rows.length} resources`);
    
    // Log file existence for debugging
    result.rows.forEach(row => {
      const fileExists = fs.existsSync(row.file_path);
      console.log(`[Get Resources] Resource ${row.id}: ${row.file_name} - File exists: ${fileExists}`);
    });

    res.json({ 
      success: true, 
      resources: result.rows,
      count: result.rows.length 
    });
  } catch (error) {
    console.error('[Get Resources] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// Debug endpoint - get all resources with file info
router.get('/debug/all', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, title, file_name, file_path, file_size FROM resources ORDER BY id DESC');
    
    const resourcesWithFileStatus = result.rows.map(row => ({
      id: row.id,
      title: row.title,
      file_name: row.file_name,
      file_path: row.file_path,
      file_size: row.file_size,
      file_exists: fs.existsSync(row.file_path),
      file_stats: fs.existsSync(row.file_path) ? {
        size: fs.statSync(row.file_path).size,
        mtime: fs.statSync(row.file_path).mtime
      } : null
    }));

    res.json({ resources: resourcesWithFileStatus });
  } catch (error) {
    console.error('[Debug] Error:', (error as Error).message);
    res.status(500).json({ error: (error as Error).message });
  }
});

// Get resource by ID - metadata only
router.get('/:id/metadata', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT id, title, description, subject, file_name, file_size, created_at FROM resources WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ success: true, resource: result.rows[0] });
  } catch (error) {
    console.error('[Get Resource] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// Get resource PDF file by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(`[Get Resource PDF] Requesting resource ID: ${id}`);
    
    const result = await pool.query(
      'SELECT file_path, file_name, file_size FROM resources WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      console.error(`[Get Resource PDF] Resource not found: ${id}`);
      return res.status(404).json({ error: 'Resource not found' });
    }

    const { file_path, file_name, file_size } = result.rows[0];
    console.log(`[Get Resource PDF] Found file: ${file_path}, size: ${file_size}`);

    // Check if file exists
    if (!fs.existsSync(file_path)) {
      console.error(`[Get Resource PDF] File not found at: ${file_path}`);
      return res.status(404).json({ error: 'PDF file not found on server' });
    }

    // Get actual file stats
    const stats = fs.statSync(file_path);
    console.log(`[Get Resource PDF] Serving file: ${file_path}, actual size: ${stats.size} bytes`);

    // Send the PDF file with correct headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${file_name}"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    const fileStream = fs.createReadStream(file_path);
    
    fileStream.on('error', (error) => {
      console.error(`[Get Resource PDF] Stream error:`, error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to read PDF file' });
      }
    });

    fileStream.on('end', () => {
      console.log(`[Get Resource PDF] File stream ended successfully for resource ${id}`);
    });

    fileStream.pipe(res);
  } catch (error) {
    console.error('[Get Resource] Error:', (error as Error).message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to fetch resource' });
    }
  }
});

// Delete resource
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get file path before deleting
    const result = await pool.query('SELECT file_path FROM resources WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const filePath = result.rows[0].file_path;

    // Delete from database
    await pool.query('DELETE FROM resources WHERE id = $1', [id]);

    // Delete file from disk
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`[Delete Resource] File deleted: ${filePath}`);
      } catch (fileDeleteError) {
        console.warn('[Delete Resource] Failed to delete file:', fileDeleteError);
      }
    }

    res.json({ success: true, message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('[Delete Resource] Error:', (error as Error).message);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});

export default router;
