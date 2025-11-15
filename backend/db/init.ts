import pool from "../db.js";

// Initialize database tables
export const initDatabase = async (): Promise<void> => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question TEXT NOT NULL,
        options TEXT[] NOT NULL,
        correct_answer INTEGER NOT NULL,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create quiz_results table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      subject VARCHAR(100) NOT NULL,
      file_path VARCHAR(500),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    // Create resources table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        subject VARCHAR(100) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        file_size INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Ensure the pgvector extension is available before creating vector-typed columns
    await pool.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await pool.query(`
    CREATE TABLE IF NOT EXISTS vectors (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
      chunk_text TEXT NOT NULL,
      embedding vector(384),
      chunk_index INTEGER
    )
  `);

    // Create AI quizzes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_quizzes (
        id SERIAL PRIMARY KEY,
        document_ids TEXT NOT NULL,
        title VARCHAR(500) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create AI quiz questions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_quiz_questions (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER NOT NULL REFERENCES ai_quizzes(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer INTEGER NOT NULL CHECK (correct_answer >= 0 AND correct_answer <= 3),
        explanation TEXT,
        question_order INTEGER NOT NULL,
        UNIQUE(quiz_id, question_order)
      )
    `);

    // Create indexes
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_quizzes_created_at ON ai_quizzes(created_at DESC)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ai_quiz_questions_quiz_id ON ai_quiz_questions(quiz_id)
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
