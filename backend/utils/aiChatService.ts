import pool from '../db.js';
import { callLLMGroq, type LLMRequest } from './llmService.js';

/**
 * AI Chat Service - Multi-turn conversation with context management
 */

export interface ChatMessage {
  id?: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export interface Conversation {
  id?: number;
  userId?: string;
  title: string;
  messageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Create new conversation
 */
export async function createConversation(title: string = 'New Conversation'): Promise<number> {
  const result = await pool.query(
    `INSERT INTO ai_conversations (title, created_at, updated_at)
     VALUES ($1, NOW(), NOW())
     RETURNING id`,
    [title]
  );

  return result.rows[0].id;
}

/**
 * Get conversation history (last N messages)
 */
export async function getConversationHistory(conversationId: number, limit: number = 20): Promise<ChatMessage[]> {
  const result = await pool.query(
    `SELECT id, conversation_id, role, content, created_at
     FROM ai_chat_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC
     LIMIT $2`,
    [conversationId, limit]
  );

  return result.rows.map((row: any) => ({
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    createdAt: row.created_at
  }));
}

/**
 * Save message to database
 */
export async function saveMessage(
  conversationId: number,
  role: 'user' | 'assistant',
  content: string
): Promise<number> {
  const result = await pool.query(
    `INSERT INTO ai_chat_messages (conversation_id, role, content, created_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id`,
    [conversationId, role, content]
  );

  return result.rows[0].id;
}

/**
 * Update conversation timestamp and title
 */
export async function updateConversation(conversationId: number, updates: { title?: string }): Promise<void> {
  const setClauses = [];
  const values: any[] = [];
  let paramCount = 1;

  if (updates.title !== undefined) {
    setClauses.push(`title = $${paramCount++}`);
    values.push(updates.title);
  }

  if (setClauses.length > 0) {
    setClauses.push(`updated_at = NOW()`);
    values.push(conversationId);

    await pool.query(
      `UPDATE ai_conversations SET ${setClauses.join(', ')} WHERE id = $${paramCount}`,
      values
    );
  }
}

/**
 * Get conversation metadata
 */
export async function getConversationMetadata(conversationId: number): Promise<Conversation | null> {
  const result = await pool.query(
    `SELECT id, title, created_at, updated_at, 
            (SELECT COUNT(*) FROM ai_chat_messages WHERE conversation_id = $1) as message_count
     FROM ai_conversations
     WHERE id = $1`,
    [conversationId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    title: row.title,
    messageCount: parseInt(row.message_count),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Generate conversation title from first message
 */
function generateConversationTitle(firstMessage: string): string {
  // Take first sentence or up to 50 characters
  const title = firstMessage
    .split(/[.!?]/)[0]
    .substring(0, 60)
    .trim();

  return title || 'New Conversation';
}

/**
 * Main chat function - handles multi-turn conversation with context
 */
export async function chatWithContext(
  message: string,
  conversationId?: number,
  systemPrompt?: string
): Promise<{
  conversationId: number;
  messageId: number;
  response: string;
  isNewConversation: boolean;
}> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let convId = conversationId;
    let isNewConversation = false;

    // Create new conversation if needed
    if (!convId) {
      const title = generateConversationTitle(message);
      const result = await client.query(
        `INSERT INTO ai_conversations (title, created_at, updated_at)
         VALUES ($1, NOW(), NOW())
         RETURNING id`,
        [title]
      );
      convId = result.rows[0].id;
      isNewConversation = true;
      console.log(`[AI Chat] Created new conversation: ${convId}`);
    }

    // Fetch conversation history
    const historyResult = await client.query(
      `SELECT role, content FROM ai_chat_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT 20`,
      [convId]
    );

    const history = historyResult.rows;
    console.log(`[AI Chat] Retrieved ${history.length} messages from history`);

    // Save user message
    const userMessageResult = await client.query(
      `INSERT INTO ai_chat_messages (conversation_id, role, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [convId, 'user', message]
    );

    const userMessageId = userMessageResult.rows[0].id;

    // Prepare messages for LLM (with conversation context)
    const llmMessages = history.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Add current user message
    llmMessages.push({
      role: 'user',
      content: message
    });

    // Default system prompt for educational chat
    const finalSystemPrompt = systemPrompt || `You are an expert AI tutor assistant helping students learn. Your responsibilities:

- Provide clear, accurate, and comprehensive explanations
- Break down complex concepts into simpler parts
- Answer questions directly and thoroughly
- Use examples and analogies when helpful
- Encourage deeper understanding through follow-up suggestions
- Be patient, supportive, and encouraging
- Maintain context from previous messages in this conversation
- Adapt your explanations to the student's apparent level of understanding

Remember: You're helping a student learn. Make sure your responses are educational and promote understanding.`;

    console.log('[AI Chat] Calling LLM with conversation context');

    // Call Groq LLM with conversation history
    const llmResponse = await callLLMGroq(
      {
        prompt: message,
        systemPrompt: finalSystemPrompt,
        maxTokens: 2048,
        temperature: 0.7
      } as unknown as LLMRequest,
      process.env.GROQ_API_KEY || ''
    );

    if (!llmResponse.success) {
      throw new Error(`LLM failed: ${llmResponse.error}`);
    }

    // Save assistant response
    const assistantMessageResult = await client.query(
      `INSERT INTO ai_chat_messages (conversation_id, role, content, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id`,
      [convId, 'assistant', llmResponse.content]
    );

    const assistantMessageId = assistantMessageResult.rows[0].id;

    // Update conversation timestamp
    await client.query(
      `UPDATE ai_conversations SET updated_at = NOW() WHERE id = $1`,
      [convId]
    );

    await client.query('COMMIT');

    console.log(`[AI Chat] Response generated successfully (${llmResponse.content.length} chars)`);

    return {
      conversationId: convId || 0,
      messageId: assistantMessageId,
      response: llmResponse.content,
      isNewConversation
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[AI Chat] Error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Get full conversation with all messages
 */
export async function getFullConversation(conversationId: number): Promise<{
  conversation: Conversation;
  messages: ChatMessage[];
} | null> {
  const convResult = await pool.query(
    `SELECT id, title, created_at, updated_at FROM ai_conversations WHERE id = $1`,
    [conversationId]
  );

  if (convResult.rows.length === 0) {
    return null;
  }

  const messagesResult = await pool.query(
    `SELECT id, conversation_id, role, content, created_at
     FROM ai_chat_messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );

  const row = convResult.rows[0];
  return {
    conversation: {
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    },
    messages: messagesResult.rows.map((msg: any) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      role: msg.role,
      content: msg.content,
      createdAt: msg.created_at
    }))
  };
}

/**
 * List all conversations (paginated)
 */
export async function listConversations(limit: number = 20, offset: number = 0): Promise<{
  conversations: Conversation[];
  total: number;
}> {
  const totalResult = await pool.query(
    `SELECT COUNT(*) as count FROM ai_conversations`
  );

  const conversationsResult = await pool.query(
    `SELECT id, title, created_at, updated_at,
            (SELECT COUNT(*) FROM ai_chat_messages WHERE conversation_id = ai_conversations.id) as message_count
     FROM ai_conversations
     ORDER BY updated_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    conversations: conversationsResult.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      messageCount: parseInt(row.message_count),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })),
    total: parseInt(totalResult.rows[0].count)
  };
}

/**
 * Delete conversation and all messages
 */
export async function deleteConversation(conversationId: number): Promise<boolean> {
  const result = await pool.query(
    `DELETE FROM ai_conversations WHERE id = $1`,
    [conversationId]
  );

  return result.rowCount! > 0;
}
