import express, { Response } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateQuizSubmission } from '../middleware/validation.js';
import { AuthenticatedRequest, QuizSubmission, QuizResult, QuizResultItem, Question } from '../types/index.js';

const router = express.Router();

/**
 * @swagger
 * /quiz/submit:
 *   post:
 *     summary: Submit quiz answers and get results
 *     tags: [Quiz]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizSubmission'
 *           example:
 *             answers:
 *               - questionId: 1
 *                 selectedAnswer: 0
 *               - questionId: 2
 *                 selectedAnswer: 2
 *     responses:
 *       200:
 *         description: Quiz results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizResult'
 *       400:
 *         description: Bad request (validation error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized (invalid or missing token)
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
// Submit quiz answers and get results (protected route)
router.post('/submit', authenticateToken, validateQuizSubmission, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { answers } = req.body as QuizSubmission;
    let score: number = 0;
    const results: QuizResultItem[] = [];

    for (const { questionId, selectedAnswer } of answers) {
      const questionResult = await pool.query<Question>(
        'SELECT id, question, options, correct_answer FROM questions WHERE id = $1',
        [questionId]
      );

      if (questionResult.rows.length > 0) {
        const question = questionResult.rows[0];
        const isCorrect: boolean = question.correct_answer === selectedAnswer;
        if (isCorrect) score++;

        results.push({
          questionId,
          question: question.question,
          options: question.options,
          selectedAnswer,
          correctAnswer: question.correct_answer,
          isCorrect,
        });
      }
    }

    const total: number = answers.length;
    const percentage: number = Math.round((score / total) * 100);

    // Save quiz result to database
    await pool.query(
      'INSERT INTO quiz_results (user_id, score, total, percentage) VALUES ($1, $2, $3, $4)',
      [req.user.userId, score, total, percentage]
    );

    const quizResult: QuizResult = {
      score,
      total,
      percentage,
      results,
    };

    res.json(quizResult);
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

