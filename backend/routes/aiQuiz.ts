import { Router, Request, Response } from 'express';
import { generateAndStoreQuiz, getGeneratedQuiz } from '../utils/aiQuizService.js';
import pool from '../db.js';

const router = Router();

/**
 * POST /api/ai-quiz/generate
 * Generate a quiz from provided document IDs
 *
 * Request body:
 * {
 *   "documentIds": [1, 2, 3],
 *   "customTitle": "Optional custom quiz title"
 * }
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { documentIds, customTitle } = req.body;

    // Validate input
    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'documentIds must be a non-empty array of numbers'
      });
    }

    // Validate all IDs are numbers
    if (!documentIds.every((id: any) => typeof id === 'number')) {
      return res.status(400).json({
        success: false,
        error: 'All documentIds must be numbers'
      });
    }

    console.log(`[Quiz Route] Generating quiz for documents: ${documentIds.join(', ')}`);

    // Generate quiz
    const result = await generateAndStoreQuiz(
      documentIds,
      customTitle
    );

    return res.status(201).json({
      success: true,
      data: {
        quizId: result.quizId,
        title: result.quiz.title,
        subject: result.quiz.subject,
        documentIds: result.quiz.documentIds,
        questionsCount: result.quiz.questions.length,
        questions: result.quiz.questions.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        createdAt: result.quiz.createdAt
      }
    });
  } catch (error) {
    console.error('[Quiz Route] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Check if error is due to invalid document IDs
    if (errorMessage.includes('No documents found')) {
      return res.status(404).json({
        success: false,
        error: errorMessage
      });
    }

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/ai-quiz/:quizId
 * Retrieve a generated quiz by ID
 */
router.get('/:quizId', async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    if (!quizId || isNaN(parseInt(quizId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quizId'
      });
    }

    console.log(`[Quiz Route] Fetching quiz ID: ${quizId}`);

    const quiz = await getGeneratedQuiz(parseInt(quizId));

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID ${quizId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        quizId: quiz.id,
        title: quiz.title,
        subject: quiz.subject,
        documentIds: quiz.documentIds,
        questionsCount: quiz.questions.length,
        questions: quiz.questions.map((q, idx) => ({
          id: idx + 1,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        })),
        createdAt: quiz.createdAt
      }
    });
  } catch (error) {
    console.error('[Quiz Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/ai-quiz/document/:documentId
 * Get all quizzes generated from a specific document
 */
router.get('/document/:documentId', async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;

    if (!documentId || isNaN(parseInt(documentId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid documentId'
      });
    }

    console.log(`[Quiz Route] Fetching quizzes for document: ${documentId}`);

    const result = await pool.query(
      `SELECT id, title, subject, created_at, document_ids
       FROM ai_quizzes
       WHERE document_ids::text LIKE $1
       ORDER BY created_at DESC`,
      [`%${documentId}%`]
    );

    const quizzes = result.rows.map((row: any) => ({
      quizId: row.id,
      title: row.title,
      subject: row.subject,
      documentIds: JSON.parse(row.document_ids),
      createdAt: row.created_at
    }));

    return res.status(200).json({
      success: true,
      data: {
        documentId: parseInt(documentId),
        quizzesCount: quizzes.length,
        quizzes
      }
    });
  } catch (error) {
    console.error('[Quiz Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * DELETE /api/ai-quiz/:quizId
 * Delete a generated quiz
 */
router.delete('/:quizId', async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    if (!quizId || isNaN(parseInt(quizId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid quizId'
      });
    }

    console.log(`[Quiz Route] Deleting quiz ID: ${quizId}`);

    const result = await pool.query(
      'DELETE FROM ai_quizzes WHERE id = $1 RETURNING id',
      [parseInt(quizId)]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        error: `Quiz with ID ${quizId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Quiz ${quizId} deleted successfully`
    });
  } catch (error) {
    console.error('[Quiz Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
