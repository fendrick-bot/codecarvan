# AI Quiz Generation API Documentation

## Overview

The AI Quiz API automatically generates educational quizzes from PDF documents using Groq's LLM. It fetches document content from the database, uses AI to create 10 multiple-choice questions with 4 options each, and stores them for later retrieval.

## Setup

Ensure `GROQ_API_KEY` is set in `.env`:
```env
GROQ_API_KEY=your_groq_api_key_here
```

Get a free API key: https://console.groq.com

## Endpoints

### 1. POST `/api/ai-quiz/generate` - Generate Quiz from Documents

**Description:** Generate a quiz from one or more PDF documents.

**Request:**
```json
{
  "documentIds": [1, 2, 3],
  "customTitle": "Optional: Custom Quiz Title"
}
```

**Parameters:**
- `documentIds` (required): Array of document IDs from the database
- `customTitle` (optional): Custom title for the quiz (default: auto-generated from document titles)

**Response (Success - 201):**
```json
{
  "success": true,
  "data": {
    "quizId": 1,
    "title": "Quiz: Machine Learning Basics, Advanced ML",
    "subject": "AI",
    "documentIds": [1, 2, 3],
    "questionsCount": 10,
    "questions": [
      {
        "id": 1,
        "question": "What is machine learning?",
        "options": [
          "A subset of artificial intelligence",
          "A type of programming language",
          "A database system",
          "A web framework"
        ],
        "correctAnswer": 0,
        "explanation": "Machine learning is a subset of AI that enables systems to learn from data without being explicitly programmed."
      },
      ...
    ],
    "createdAt": "2025-11-15T10:30:00Z"
  }
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "documentIds must be a non-empty array of numbers"
}
```

**Response (Error - 404):**
```json
{
  "success": false,
  "error": "No documents found for IDs: 1, 2, 3"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/ai-quiz/generate \
  -H "Content-Type: application/json" \
  -d '{
    "documentIds": [1, 2],
    "customTitle": "Machine Learning Fundamentals"
  }'
```

**PowerShell Example:**
```powershell
$body = @{
    documentIds = @(1, 2)
    customTitle = "Machine Learning Fundamentals"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ai-quiz/generate" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

### 2. GET `/api/ai-quiz/:quizId` - Retrieve Quiz

**Description:** Fetch a previously generated quiz by ID.

**Parameters:**
- `quizId` (path, required): ID of the quiz to retrieve

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "quizId": 1,
    "title": "Quiz: Machine Learning Basics",
    "subject": "AI",
    "documentIds": [1, 2],
    "questionsCount": 10,
    "questions": [
      {
        "id": 1,
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": 0,
        "explanation": "..."
      }
    ],
    "createdAt": "2025-11-15T10:30:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/ai-quiz/1
```

---

### 3. GET `/api/ai-quiz/document/:documentId` - List Quizzes for Document

**Description:** Get all quizzes generated from a specific document.

**Parameters:**
- `documentId` (path, required): ID of the document

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "documentId": 1,
    "quizzesCount": 3,
    "quizzes": [
      {
        "quizId": 1,
        "title": "Quiz: Machine Learning Basics",
        "subject": "AI",
        "documentIds": [1, 2],
        "createdAt": "2025-11-15T10:30:00Z"
      },
      {
        "quizId": 2,
        "title": "Custom ML Quiz",
        "subject": "AI",
        "documentIds": [1, 3],
        "createdAt": "2025-11-15T11:00:00Z"
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:3000/api/ai-quiz/document/1
```

---

### 4. DELETE `/api/ai-quiz/:quizId` - Delete Quiz

**Description:** Delete a quiz and all its questions from the database.

**Parameters:**
- `quizId` (path, required): ID of the quiz to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Quiz 1 deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:3000/api/ai-quiz/1
```

---

## Flow Diagram

```
User Request (POST /api/ai-quiz/generate with documentIds)
       ↓
[Validate documentIds]
       ↓
[Fetch all document chunks from vectors table]
       ↓
[Combine chunk text into full document content]
       ↓
[Prepare LLM prompt with combined content]
       ↓
[Call Groq LLM to generate 10 questions]
       ↓
[Validate LLM response (10 questions, 4 options each)]
       ↓
[Store quiz metadata in ai_quizzes table]
       ↓
[Store all 10 questions in ai_quiz_questions table]
       ↓
[Return quizId and questions to client]
```

## Database Schema

### ai_quizzes table
```sql
CREATE TABLE ai_quizzes (
  id SERIAL PRIMARY KEY,
  document_ids TEXT NOT NULL,           -- JSON array of document IDs
  title VARCHAR(500) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ai_quiz_questions table
```sql
CREATE TABLE ai_quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES ai_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,                -- Array of 4 option strings
  correct_answer INTEGER NOT NULL,       -- Index 0-3
  explanation TEXT,                      -- Why this answer is correct
  question_order INTEGER NOT NULL,       -- Question number (1-10)
  UNIQUE(quiz_id, question_order)
);
```

## Integration Examples

### React Component
```typescript
import { useState } from 'react';

function QuizGenerator() {
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);

  const generateQuiz = async (documentIds: number[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentIds,
          customTitle: 'My Quiz'
        })
      });

      const data = await res.json();
      if (data.success) {
        setQuiz(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => generateQuiz([1, 2])}>
        {loading ? 'Generating...' : 'Generate Quiz'}
      </button>
      {quiz && (
        <div>
          <h2>{quiz.title}</h2>
          {quiz.questions.map((q, idx) => (
            <div key={idx}>
              <p>{q.question}</p>
              {q.options.map((opt, i) => (
                <label key={i}>
                  <input type="radio" name={`q${idx}`} value={i} />
                  {opt}
                </label>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Node.js/Fetch
```typescript
async function generateQuizFromDocuments(documentIds: number[]) {
  const response = await fetch('http://localhost:3000/api/ai-quiz/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentIds,
      customTitle: 'Advanced Topics Quiz'
    })
  });

  const result = await response.json();
  if (result.success) {
    const { quizId, questions, title } = result.data;
    console.log(`Created quiz "${title}" with ${questions.length} questions`);
    return quizId;
  } else {
    throw new Error(result.error);
  }
}
```

## Error Handling

| HTTP Status | Error | Cause | Solution |
|-------------|-------|-------|----------|
| 400 | `documentIds must be a non-empty array` | Missing/invalid documentIds | Provide valid array of IDs |
| 400 | `Invalid quizId` | Non-numeric quizId | Use numeric quiz ID |
| 404 | `No documents found for IDs: X` | Documents don't exist | Check document IDs are correct |
| 404 | `Quiz with ID X not found` | Quiz doesn't exist | Verify quiz ID |
| 500 | `LLM failed to generate questions` | Groq API error | Check GROQ_API_KEY and rate limits |
| 500 | `Failed to parse quiz questions` | LLM returned invalid JSON | Retry request |

## Performance & Limits

- **Generation time:** 3-8 seconds per quiz (depends on document size)
- **Max document size:** ~50,000 characters (~12,500 words)
- **Recommended documents per quiz:** 1-3 documents
- **Rate limit:** Depends on Groq API (free tier: ~30 requests/minute)
- **Questions per quiz:** Always 10
- **Options per question:** Always 4

## Key Features

✅ **AI-Generated:** Uses Groq's Llama 3.1 for high-quality questions
✅ **Educational Focus:** Tests understanding, not just memorization
✅ **Persistent Storage:** All quizzes stored in database
✅ **Multi-Document Support:** Generate quizzes from multiple PDFs
✅ **Validation:** Ensures proper question format before storing
✅ **Explanations:** Each question includes why the answer is correct

## Next Steps

1. Upload PDFs via `/api/uploads` endpoint
2. Get document IDs from upload response
3. Call `/api/ai-quiz/generate` with those IDs
4. Receive 10 AI-generated questions
5. Display quiz in your frontend
6. Submit answers and grade (implement separately)

## Testing the API

### Step 1: Generate Quiz
```bash
curl -X POST http://localhost:3000/api/ai-quiz/generate \
  -H "Content-Type: application/json" \
  -d '{"documentIds": [1], "customTitle": "Test Quiz"}'
```

### Step 2: Get Quiz Details
```bash
curl http://localhost:3000/api/ai-quiz/1
```

### Step 3: List All Quizzes for Document
```bash
curl http://localhost:3000/api/ai-quiz/document/1
```

### Step 4: Delete Quiz
```bash
curl -X DELETE http://localhost:3000/api/ai-quiz/1
```
