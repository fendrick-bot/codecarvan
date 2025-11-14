import { Request, Response, NextFunction } from 'express';
import { QuizSubmission } from '../types/index.js';

// Validation middleware for quiz submission
export const validateQuizSubmission = (
  req: Request<{}, {}, QuizSubmission>,
  res: Response,
  next: NextFunction
): void => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    res.status(400).json({ error: 'Answers must be an array' });
    return;
  }

  if (answers.length === 0) {
    res.status(400).json({ error: 'Answers array cannot be empty' });
    return;
  }

  for (const answer of answers) {
    if (!answer.questionId || typeof answer.questionId !== 'number') {
      res.status(400).json({ 
        error: 'Each answer must have a valid questionId (number)' 
      });
      return;
    }

    if (answer.selectedAnswer === undefined || answer.selectedAnswer === null) {
      res.status(400).json({ 
        error: 'Each answer must have a selectedAnswer' 
      });
      return;
    }

    if (typeof answer.selectedAnswer !== 'number') {
      res.status(400).json({ 
        error: 'selectedAnswer must be a number' 
      });
      return;
    }
  }

  next();
};

// Email validation helper
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation helper
export const isValidPassword = (password: string): boolean => {
  // At least 6 characters
  return password && password.length >= 6;
};

