import { Router, Request, Response } from 'express';
import {
  chatWithContext,
  getFullConversation,
  getConversationHistory,
  getConversationMetadata,
  listConversations,
  deleteConversation,
  createConversation
} from '../utils/aiChatService.js';

const router = Router();

/**
 * POST /api/ai-chat/message
 * Send a message in a conversation (creates conversation if needed)
 *
 * Request body:
 * {
 *   "message": "Explain photosynthesis",
 *   "conversationId": 1 (optional - if null, creates new conversation),
 *   "systemPrompt": "Custom system prompt" (optional)
 * }
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, conversationId, systemPrompt } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'message is required and must be a non-empty string'
      });
    }

    if (conversationId && typeof conversationId !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'conversationId must be a number'
      });
    }

    console.log(`[Chat Route] Processing message in conversation: ${conversationId || 'new'}`);

    // Process chat with context
    const result = await chatWithContext(
      message.trim(),
      conversationId,
      systemPrompt
    );

    return res.status(201).json({
      success: true,
      data: {
        conversationId: result.conversationId,
        messageId: result.messageId,
        message: result.response,
        isNewConversation: result.isNewConversation,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

/**
 * GET /api/ai-chat/:conversationId
 * Get full conversation with all messages
 */
router.get('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversationId'
      });
    }

    console.log(`[Chat Route] Fetching conversation: ${conversationId}`);

    const result = await getFullConversation(parseInt(conversationId));

    if (!result) {
      return res.status(404).json({
        success: false,
        error: `Conversation ${conversationId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        conversation: {
          id: result.conversation.id,
          title: result.conversation.title,
          messageCount: result.messages.length,
          createdAt: result.conversation.createdAt,
          updatedAt: result.conversation.updatedAt
        },
        messages: result.messages.map((msg, idx) => ({
          id: msg.id,
          sequenceNumber: idx + 1,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/ai-chat/:conversationId/history
 * Get last N messages from conversation (for pagination)
 */
router.get('/:conversationId/history', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { limit = 20 } = req.query;

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversationId'
      });
    }

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);

    console.log(`[Chat Route] Fetching last ${limitNum} messages from conversation ${conversationId}`);

    const messages = await getConversationHistory(parseInt(conversationId), limitNum);

    if (!messages) {
      return res.status(404).json({
        success: false,
        error: `Conversation ${conversationId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        conversationId: parseInt(conversationId),
        messageCount: messages.length,
        messages: messages.map((msg, idx) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          createdAt: msg.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/ai-chat/:conversationId/metadata
 * Get conversation metadata without messages
 */
router.get('/:conversationId/metadata', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversationId'
      });
    }

    const metadata = await getConversationMetadata(parseInt(conversationId));

    if (!metadata) {
      return res.status(404).json({
        success: false,
        error: `Conversation ${conversationId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * GET /api/ai-chat/conversations/list
 * List all conversations (paginated)
 */
router.get('/conversations/list', async (req: Request, res: Response) => {
  try {
    const { limit = 20, offset = 0 } = req.query;

    const limitNum = Math.min(parseInt(limit as string) || 20, 100);
    const offsetNum = Math.max(parseInt(offset as string) || 0, 0);

    console.log(`[Chat Route] Listing conversations (limit: ${limitNum}, offset: ${offsetNum})`);

    const result = await listConversations(limitNum, offsetNum);

    return res.status(200).json({
      success: true,
      data: {
        total: result.total,
        limit: limitNum,
        offset: offsetNum,
        conversations: result.conversations.map(conv => ({
          id: conv.id,
          title: conv.title,
          messageCount: conv.messageCount || 0,
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * POST /api/ai-chat/new
 * Create a new conversation without sending a message
 */
router.post('/new', async (req: Request, res: Response) => {
  try {
    const { title = 'New Conversation' } = req.body;

    console.log('[Chat Route] Creating new conversation');

    const conversationId = await createConversation(title);

    return res.status(201).json({
      success: true,
      data: {
        conversationId,
        title,
        messageCount: 0,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

/**
 * DELETE /api/ai-chat/:conversationId
 * Delete a conversation and all its messages
 */
router.delete('/:conversationId', async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    if (!conversationId || isNaN(parseInt(conversationId))) {
      return res.status(400).json({
        success: false,
        error: 'Invalid conversationId'
      });
    }

    console.log(`[Chat Route] Deleting conversation: ${conversationId}`);

    const deleted = await deleteConversation(parseInt(conversationId));

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: `Conversation ${conversationId} not found`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Conversation ${conversationId} deleted successfully`
    });
  } catch (error) {
    console.error('[Chat Route] Error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;
