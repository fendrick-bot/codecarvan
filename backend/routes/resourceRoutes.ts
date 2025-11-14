import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import pool from '../db.js';

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
    
    let query = 'SELECT id, title, description, subject, file_name, file_size, created_at FROM resources';
    const params: any[] = [];

    if (subject) {
      query += ' WHERE subject = $1';
      params.push(subject);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
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

// Get resource by ID
router.get('/:id', async (req: Request, res: Response) => {
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
