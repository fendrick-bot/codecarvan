# AI Model API Documentation

## Setup

### 1. Add API Keys to `.env`

```env
# Choose one or both:

# Option 1: Groq (Recommended - faster and free)
GROQ_API_KEY=your_groq_api_key_here

# Option 2: Hugging Face
HUGGINGFACE_API_KEY=your_huggingface_token_here
```

Get free API keys:
- **Groq:** https://console.groq.com
- **Hugging Face:** https://huggingface.co/settings/tokens

## Endpoints

### 1. POST `/api/ai/summarize` - Summarize a PDF Document

**Description:** Generates a concise summary of a PDF document using LLM.

**Request Body:**
```json
{
  "documentId": 1,
  "maxTokens": 1000,
  "useLLM": "groq"
}
```

**Parameters:**
- `documentId` (required): ID of the document to summarize
- `maxTokens` (optional, default: 1000): Maximum tokens in the summary
- `useLLM` (optional, default: "groq"): LLM provider ("groq" or "huggingface")

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "documentId": 1,
    "title": "Machine Learning Basics",
    "subject": "AI",
    "description": "Introduction to ML concepts",
    "chunksCount": 15,
    "originalTextLength": 45230,
    "summary": "Machine learning is a subset of artificial intelligence... [full summary]",
    "llmProvider": "groq"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Document with ID 1 not found"
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "maxTokens": 1000,
    "useLLM": "groq"
  }'
```

**Example PowerShell:**
```powershell
$body = @{
    documentId = 1
    maxTokens = 1000
    useLLM = "groq"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/ai/summarize" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

---

### 2. POST `/api/ai/explain` - Get Explanation for a Topic

**Description:** Gets detailed explanation for a specific topic based on document content using LLM.

**Request Body:**
```json
{
  "documentId": 1,
  "topic": "What is supervised learning?",
  "maxTokens": 1500,
  "useLLM": "groq"
}
```

**Parameters:**
- `documentId` (required): ID of the document
- `topic` (required): Topic or question to explain
- `maxTokens` (optional, default: 1500): Maximum tokens in the explanation
- `useLLM` (optional, default: "groq"): LLM provider

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "documentId": 1,
    "title": "Machine Learning Basics",
    "topic": "What is supervised learning?",
    "explanation": "Supervised learning is a type of machine learning where... [full explanation]",
    "llmProvider": "groq"
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/ai/explain \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": 1,
    "topic": "What is supervised learning?",
    "maxTokens": 1500,
    "useLLM": "groq"
  }'
```

---

## Flow Diagram

```
User Request (POST /api/ai/summarize)
       ↓
[Validate documentId]
       ↓
[Fetch Document Metadata]
  - title, subject, description
       ↓
[Fetch All Chunks from vectors table]
  - Ordered by chunk_index
       ↓
[Combine Chunk Text]
  - Create full document text
       ↓
[Prepare LLM Prompt]
  - Add system prompt + document text
       ↓
[Call LLM API]
  - Groq or Hugging Face
       ↓
[Return Summary]
  - With metadata and original stats
```

---

## Database Schema Used

### documents table
```sql
id, title, description, subject, file_path, chunk_count, uploaded_at
```

### vectors table
```sql
id, document_id, chunk_text, embedding, chunk_index, start_char, end_char, page_number, section_title, created_at
```

---

## Error Handling

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | `documentId is required` | Missing documentId in request | Provide valid documentId |
| 404 | `Document with ID X not found` | Document doesn't exist | Check documentId is correct |
| 404 | `No chunks found for document` | Document has no vectors | Ensure PDF was uploaded and processed |
| 500 | `GROQ_API_KEY not configured` | Missing environment variable | Set GROQ_API_KEY in .env |
| 500 | `Failed to generate summary: ...` | LLM API error | Check API key validity and rate limits |

---

## Integration Examples

### Node.js/Fetch
```typescript
async function summarizePDF(documentId: number) {
  const response = await fetch('http://localhost:3000/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      documentId,
      maxTokens: 1000,
      useLLM: 'groq'
    })
  });

  const result = await response.json();
  if (result.success) {
    console.log('Summary:', result.data.summary);
  } else {
    console.error('Error:', result.error);
  }
}
```

### React
```typescript
import { useState } from 'react';

function SummarizeButton({ documentId }: { documentId: number }) {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');

  const handleSummarize = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, useLLM: 'groq' })
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSummarize} disabled={loading}>
        {loading ? 'Generating...' : 'Summarize'}
      </button>
      {summary && <p>{summary}</p>}
    </div>
  );
}
```

---

## Performance Notes

- **First request:** 1-3 seconds (model loading)
- **Subsequent requests:** 0.5-2 seconds (depending on document size)
- **Max recommended document length:** ~50KB of text (≈13,000 words)
- **Rate limits:** Check your LLM provider's documentation

---

## Next Steps

1. Ensure `.env` has `GROQ_API_KEY` or `HUGGINGFACE_API_KEY` set
2. Upload a PDF via `/api/uploads` endpoint
3. Get the `documentId` from the response
4. Call `/api/ai/summarize` with that documentId
5. Receive the AI-generated summary
