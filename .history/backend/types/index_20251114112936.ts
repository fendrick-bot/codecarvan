import { Request, Response, NextFunction } from 'express';

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

// User types
export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  created_at?: Date;
}

// Question types
export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  correctAnswer?: number; // For API responses
  category: string;
  created_at?: Date;
}

// Quiz types
export interface QuizAnswer {
  questionId: number;
  selectedAnswer: number;
}

export interface QuizSubmission {
  answers: QuizAnswer[];
}

export interface QuizResultItem {
  questionId: number;
  question: string;
  options: string[];
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  results: QuizResultItem[];
}

// Express middleware types
export type Middleware = (
  req: Request | AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Database types
export interface DatabaseConfig {
  connectionString?: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}

