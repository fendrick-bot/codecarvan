import express, { Request, Response } from 'express';
import pool from '../db.js';

const router = express.Router();

interface CategoryRow {
  category: string;
}

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get all question categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["Math", "Science", "History"]
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query<CategoryRow>('SELECT DISTINCT category FROM questions ORDER BY category');
    const categories: string[] = result.rows.map(row => row.category);
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

