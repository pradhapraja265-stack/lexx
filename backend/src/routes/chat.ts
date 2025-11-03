import { Router, Request, Response } from 'express';
import { ChatSession } from '../models/ChatSession';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, CreateChatSessionDto, CreateMessageDto } from '../types';

const router = Router();

// All chat routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/chat/sessions
 * @desc Get user's chat sessions
 * @access Private
 */
router.get('/sessions',
  validate(schemas.pagination, 'query'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const sessions = await ChatSession.findByUserId(req.user!.id, limit, skip);

      const total = await ChatSession.countDocuments({ userId: req.user!.id });

      const response = {
        sessions: sessions.map(session => ({
          id: session._id.toString(),
          title: session.title,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          messageCount: session.messages.length,
          lastMessage: session.messages[session.messages.length - 1]?.content || null,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: skip + limit < total,
          hasPrev: page > 1,
        },
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Get chat sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat sessions',
        code: 'GET_SESSIONS_FAILED',
      });
    }
  })
);

/**
 * @route POST /api/chat/sessions
 * @desc Create new chat session
 * @access Private
 */
router.post('/sessions',
  validate(schemas.createChatSession),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { title }: CreateChatSessionDto = req.body;

      const chatSession = new ChatSession({
        userId: req.user!.id,
        title: title || 'New Chat',
        messages: [],
      });

      await chatSession.save();

      const response = {
        id: chatSession._id.toString(),
        title: chatSession.title,
        createdAt: chatSession.createdAt,
        updatedAt: chatSession.updatedAt,
        messageCount: 0,
      };

      res.status(201).json({
        success: true,
        data: { session: response },
      });
    } catch (error) {
      console.error('Create chat session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create chat session',
        code: 'CREATE_SESSION_FAILED',
      });
    }
  })
);

/**
 * @route GET /api/chat/sessions/:sessionId
 * @desc Get specific chat session with messages
 * @access Private
 */
router.get('/sessions/:sessionId',
  validate(schemas.chatSessionId, 'params'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await ChatSession.findByIdAndUserId(sessionId, req.user!.id);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found',
          code: 'SESSION_NOT_FOUND',
        });
      }

      const response = {
        id: session._id.toString(),
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        messages: session.messages.map(message => ({
          id: message.id,
          type: message.type,
          content: message.content,
          originalText: message.originalText,
          refinedText: message.refinedText,
          tone: message.tone,
          timestamp: message.timestamp,
          metadata: message.metadata,
        })),
      };

      res.json({
        success: true,
        data: { session: response },
      });
    } catch (error) {
      console.error('Get chat session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get chat session',
        code: 'GET_SESSION_FAILED',
      });
    }
  })
);

/**
 * @route PUT /api/chat/sessions/:sessionId
 * @desc Update chat session title
 * @access Private
 */
router.put('/sessions/:sessionId',
  validate(schemas.chatSessionId, 'params'),
  validate({ title: schemas.createChatSession.extract('title') }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { title } = req.body;

      const session = await ChatSession.findByIdAndUserId(sessionId, req.user!.id);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found',
          code: 'SESSION_NOT_FOUND',
        });
      }

      await session.updateTitle(title);

      const response = {
        id: session._id.toString(),
        title: session.title,
        updatedAt: session.updatedAt,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Update chat session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update chat session',
        code: 'UPDATE_SESSION_FAILED',
      });
    }
  })
);

/**
 * @route DELETE /api/chat/sessions/:sessionId
 * @desc Delete chat session
 * @access Private
 */
router.delete('/sessions/:sessionId',
  validate(schemas.chatSessionId, 'params'),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;

      const session = await ChatSession.findOneAndDelete({
        _id: sessionId,
        userId: req.user!.id,
      });

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found',
          code: 'SESSION_NOT_FOUND',
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete chat session error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete chat session',
        code: 'DELETE_SESSION_FAILED',
      });
    }
  })
);

/**
 * @route POST /api/chat/sessions/:sessionId/messages
 * @desc Add message to chat session (internal use)
 * @access Private
 */
router.post('/sessions/:sessionId/messages',
  validate(schemas.chatSessionId, 'params'),
  validate({
    type: schemas.createMessageDto.extract('type'),
    content: schemas.createMessageDto.extract('content'),
    originalText: schemas.createMessageDto.extract('originalText'),
    refinedText: schemas.createMessageDto.extract('refinedText'),
    tone: schemas.createMessageDto.extract('tone'),
    metadata: schemas.createMessageDto.extract('metadata'),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sessionId } = req.params;
      const messageData: Omit<CreateMessageDto, 'sessionId'> = req.body;

      const session = await ChatSession.findByIdAndUserId(sessionId, req.user!.id);

      if (!session) {
        return res.status(404).json({
          success: false,
          error: 'Chat session not found',
          code: 'SESSION_NOT_FOUND',
        });
      }

      await session.addMessage(messageData);

      const response = {
        id: session._id.toString(),
        updatedAt: session.updatedAt,
        messageCount: session.messages.length,
      };

      res.status(201).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Add message error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add message',
        code: 'ADD_MESSAGE_FAILED',
      });
    }
  })
);

export default router;