import pool from '../db.js';
import { callLLMGroq } from './llmService.js';

/**
 * AI Quiz Generation Service
 * Generates educational quizzes from PDF documents using LLM
 */

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct answer (0-3)
  explanation?: string;
}

export interface GeneratedQuiz {
  id?: number;
  documentIds: number[];
  title: string;
  subject: string;
  questions: QuizQuestion[];
  createdAt?: Date;
}

/**
 * Fetch document chunks from database
 */
async function fetchDocumentContent(documentIds: number[]): Promise<{
  id: number;
  title: string;
  subject: string;
  content: string;
}[]> {
  if (documentIds.length === 0) {
    throw new Error('No document IDs provided');
  }

  // Create placeholders for SQL query
  const placeholders = documentIds.map((_, i) => `$${i + 1}`).join(',');

  const query = `
    SELECT DISTINCT
      d.id,
      d.title,
      d.subject,
      STRING_AGG(v.chunk_text, ' ' ORDER BY v.chunk_index) as content
    FROM documents d
    LEFT JOIN vectors v ON d.id = v.document_id
    WHERE d.id IN (${placeholders})
    GROUP BY d.id, d.title, d.subject
  `;

  const result = await pool.query(query, documentIds);

  if (result.rows.length === 0) {
    throw new Error(`No documents found for IDs: ${documentIds.join(', ')}`);
  }

  return result.rows;
}

/**
 * Generate quiz questions using Groq LLM
 */
async function generateQuizQuestions(documentsContent: string, documentTitles: string): Promise<QuizQuestion[]> {
  const systemPrompt = `You are an expert educational quiz creator. Your task is to generate high-quality multiple-choice questions based on the provided document content.

CRITICAL INSTRUCTIONS:
1. Generate EXACTLY 10 questions
2. Each question must have EXACTLY 4 options
3. correctAnswer MUST be 0, 1, 2, or 3 (the INDEX of the correct option, starting from 0)
4. Only return a valid JSON array, no markdown, no extra text
5. Each question object must have these exact fields:
   - question (string): the question text
   - options (array of 4 strings): the answer choices
   - correctAnswer (integer 0-3): which option is correct (0 for first option, 1 for second, etc.)
   - explanation (string): why this answer is correct

EXAMPLES OF CORRECT correctAnswer VALUES:
- If the first option is correct: "correctAnswer": 0
- If the second option is correct: "correctAnswer": 1
- If the third option is correct: "correctAnswer": 2
- If the fourth option is correct: "correctAnswer": 3

NEVER use correctAnswer values like 1-4 or 4+. ALWAYS use 0-3.`;

  const prompt = `Based on the following educational content about "${documentTitles}", create 10 multiple-choice questions with 4 options each:

CONTENT:
${documentsContent.substring(0, 12000)}

Return ONLY a valid JSON array with no additional text:
[
  {
    "question": "What is...?",
    "options": ["First option", "Second option", "Third option", "Fourth option"],
    "correctAnswer": 0,
    "explanation": "Explanation of why the first option is correct..."
  },
  ...
]

REMEMBER: correctAnswer must be 0, 1, 2, or 3 only!`;

  const response = await callLLMGroq(
    {
      prompt,
      systemPrompt,
      maxTokens: 4000,
      temperature: 0.7
    },
    process.env.GROQ_API_KEY || ''
  );

  if (!response.success) {
    throw new Error(`LLM failed to generate questions: ${response.error}`);
  }

  // Clean response - remove markdown code blocks
  let cleanedResponse = response.content.trim();
  cleanedResponse = cleanedResponse
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^```/gm, '');

  // Find JSON array in response
  const jsonMatch = cleanedResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) {
    console.error('LLM Response:', response.content);
    throw new Error('Failed to extract valid JSON from LLM response');
  }

  try {
    const questions: QuizQuestion[] = JSON.parse(jsonMatch[0]);

    // Validate questions
    if (!Array.isArray(questions) || questions.length !== 10) {
      throw new Error(`Expected 10 questions, got ${questions.length}`);
    }

    questions.forEach((q, idx) => {
      if (!q.question || typeof q.question !== 'string') {
        throw new Error(`Question ${idx}: Invalid question text`);
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${idx}: Must have exactly 4 options`);
      }
      
      // Normalize correctAnswer - ensure it's a valid index (0-3)
      let correctAnswer = q.correctAnswer;
      if (typeof correctAnswer !== 'number') {
        throw new Error(`Question ${idx}: correctAnswer must be a number`);
      }
      
      // If correctAnswer is out of bounds, try to fix it
      if (correctAnswer < 0 || correctAnswer > 3) {
        // If it's 1-4, convert to 0-3 (LLM sometimes uses 1-based indexing)
        if (correctAnswer > 0 && correctAnswer <= 4) {
          correctAnswer = correctAnswer - 1;
          console.warn(`Question ${idx}: Corrected correctAnswer from ${q.correctAnswer} to ${correctAnswer}`);
          q.correctAnswer = correctAnswer;
        } else {
          throw new Error(`Question ${idx}: correctAnswer must be 0-3, got ${q.correctAnswer}`);
        }
      }
      
      if (!q.explanation || typeof q.explanation !== 'string') {
        throw new Error(`Question ${idx}: Missing explanation`);
      }
    });

    return questions;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Cleaned Response:', cleanedResponse);
    throw new Error(`Failed to parse quiz questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Store quiz in database
 */
async function storeQuiz(quiz: GeneratedQuiz): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Insert quiz metadata
    const quizQuery = `
      INSERT INTO ai_quizzes (document_ids, title, subject, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING id
    `;

    const quizResult = await client.query(quizQuery, [
      JSON.stringify(quiz.documentIds),
      quiz.title,
      quiz.subject
    ]);

    const quizId = quizResult.rows[0].id;

    // Insert questions
    const questionQuery = `
      INSERT INTO ai_quiz_questions (quiz_id, question_text, options, correct_answer, explanation, question_order)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      await client.query(questionQuery, [
        quizId,
        q.question,
        JSON.stringify(q.options),
        q.correctAnswer,
        q.explanation || null,
        i + 1
      ]);
    }

    await client.query('COMMIT');
    return quizId;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Retrieve quiz from database
 */
export async function getGeneratedQuiz(quizId: number): Promise<GeneratedQuiz | null> {
  const quizQuery = `
    SELECT id, document_ids, title, subject, created_at
    FROM ai_quizzes
    WHERE id = $1
  `;

  const questionsQuery = `
    SELECT question_text, options, correct_answer, explanation
    FROM ai_quiz_questions
    WHERE quiz_id = $1
    ORDER BY question_order
  `;

  const quizResult = await pool.query(quizQuery, [quizId]);
  if (quizResult.rows.length === 0) {
    return null;
  }

  const questionsResult = await pool.query(questionsQuery, [quizId]);

  const quiz = quizResult.rows[0];
  return {
    id: quiz.id,
    documentIds: JSON.parse(quiz.document_ids),
    title: quiz.title,
    subject: quiz.subject,
    createdAt: quiz.created_at,
    questions: questionsResult.rows.map((row: any) => ({
      question: row.question_text,
      options: JSON.parse(row.options),
      correctAnswer: row.correct_answer,
      explanation: row.explanation
    }))
  };
}

/**
 * Main function: Generate and store quiz from documents
 */
export async function generateAndStoreQuiz(
  documentIds: number[],
  customTitle?: string
): Promise<{ quizId: number; quiz: GeneratedQuiz }> {
  try {
    console.log(`[AI Quiz] Starting quiz generation for documents: ${documentIds.join(', ')}`);

    // Step 1: Fetch document content
    console.log('[AI Quiz] Step 1: Fetching document content');
    const documents = await fetchDocumentContent(documentIds);
    console.log(`[AI Quiz] ✓ Fetched ${documents.length} documents`);

    // Combine content from all documents
    const combinedContent = documents
      .map(doc => `Document: ${doc.title}\nSubject: ${doc.subject}\n\n${doc.content}`)
      .join('\n\n---\n\n');

    const documentTitles = documents.map(d => d.title).join(', ');
    const subject = documents[0].subject;

    // Step 2: Generate quiz questions using LLM
    console.log('[AI Quiz] Step 2: Generating quiz questions using LLM');
    const questions = await generateQuizQuestions(combinedContent, documentTitles);
    console.log(`[AI Quiz] ✓ Generated ${questions.length} questions`);

    // Step 3: Create quiz object
    const quiz: GeneratedQuiz = {
      documentIds,
      title: customTitle || `Quiz: ${documentTitles}`,
      subject,
      questions
    };

    // Step 4: Store in database
    console.log('[AI Quiz] Step 3: Storing quiz in database');
    const quizId = await storeQuiz(quiz);
    console.log(`[AI Quiz] ✓ Quiz stored with ID: ${quizId}`);

    return {
      quizId,
      quiz: { ...quiz, id: quizId }
    };
  } catch (error) {
    console.error('[AI Quiz] ❌ Error:', error);
    throw error;
  }
}
