import express, { Request, Response } from 'express';
import pool from '../db.js';
import { Question } from '../types/index.js';

const router = express.Router();

/**
 * @swagger
 * /questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter questions by category
 *         example: Math
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get all questions (optional category filter)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category } = req.query as { category?: string };
    let query: string = 'SELECT id, question, options, correct_answer as "correctAnswer", category FROM questions';
    const params: (string | number)[] = [];

    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }

    const result = await pool.query<Question>(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /questions/{id}:
 *   get:
 *     summary: Get a specific question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Question ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Question details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// Get a specific question by ID
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const questionId: number = Number(req.params.id);
    
    if (isNaN(questionId)) {
      res.status(400).json({ error: 'Invalid question ID' });
      return;
    }

    const result = await pool.query<Question>(
      'SELECT id, question, options, correct_answer as "correctAnswer", category FROM questions WHERE id = $1',
      [questionId]
    );
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

