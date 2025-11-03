import { Router, Request, Response } from 'express';
import { ChatSession } from '../models/ChatSession';
import { openAIService } from '../services/openaiService';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, RefineRequest, RefineResponse } from '../types';

const router = Router();

// All refinement routes require authentication
router.use(authenticateToken);

/**
 * @route POST /api/refine
 * @desc Refine text using AI
 * @access Private
 */
router.post('/',
  validate(schemas.refineText),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text, tone, sessionId }: RefineRequest = req.body;

      // Validate input with OpenAI service
      const validation = openAIService.validateInput(text);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: validation.error || 'Invalid input text',
          code: 'INVALID_INPUT',
        });
      }

      // Get or create chat session
      let chatSession;
      if (sessionId) {
        chatSession = await ChatSession.findByIdAndUserId(sessionId, req.user!.id);
        if (!chatSession) {
          return res.status(404).json({
            success: false,
            error: 'Chat session not found',
            code: 'SESSION_NOT_FOUND',
          });
        }
      } else {
        // Create new session
        chatSession = new ChatSession({
          userId: req.user!.id,
          title: text.slice(0, 100) + (text.length > 100 ? '...' : ''),
          messages: [],
        });
        await chatSession.save();
      }

      // Add user message to session
      await chatSession.addUserMessage(text);

      try {
        // Call OpenAI service
        const aiResponse = await openAIService.refineText(text, tone);

        // Add AI message to session
        await chatSession.addAIMessage(
          aiResponse.refinedText,
          text,
          tone,
          aiResponse.metadata
        );

        // Prepare response
        const response: RefineResponse = {
          refinedText: aiResponse.refinedText,
          originalText: text,
          tone: tone,
          metadata: aiResponse.metadata,
        };

        res.json({
          success: true,
          data: response,
        });

      } catch (aiError) {
        console.error('OpenAI API error:', aiError);

        // Remove the user message since AI processing failed
        chatSession.messages.pop();
        await chatSession.save();

        // Return appropriate error response
        const errorMessage = aiError instanceof Error ? aiError.message : 'AI service unavailable';
        const statusCode = errorMessage.includes('quota') ? 429 : 503;

        res.status(statusCode).json({
          success: false,
          error: errorMessage,
          code: 'AI_SERVICE_ERROR',
        });
      }

    } catch (error) {
      console.error('Text refinement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refine text',
        code: 'REFINE_FAILED',
      });
    }
  })
);

/**
 * @route GET /api/refine/tones
 * @desc Get supported tones
 * @access Private
 */
router.get('/tones', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const supportedTones = openAIService.getSupportedTones();

    const toneDescriptions = {
      formal: 'Professional and respectful tone suitable for business communications',
      casual: 'Relaxed and conversational tone for informal interactions',
      friendly: 'Warm and approachable tone with positive language',
      professional: 'Business-appropriate tone that is clear and concise',
    };

    const response = supportedTones.map(tone => ({
      value: tone,
      label: tone.charAt(0).toUpperCase() + tone.slice(1),
      description: toneDescriptions[tone as keyof typeof toneDescriptions],
    }));

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get tones error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported tones',
      code: 'GET_TONES_FAILED',
    });
  }
}));

/**
 * @route GET /api/refine/validate
 * @desc Validate text for refinement
 * @access Private
 */
router.post('/validate',
  validate({ text: schemas.refineText.extract('text') }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { text } = req.body;

      const validation = openAIService.validateInput(text);
      const estimatedTokens = openAIService.estimateTokens(text);

      const response = {
        isValid: validation.isValid,
        error: validation.error,
        estimatedTokens,
        estimatedCost: estimatedTokens * 0.00002, // Rough cost estimation
        characterCount: text.length,
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Validate text error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to validate text',
        code: 'VALIDATE_FAILED',
      });
    }
  })
);

/**
 * @route GET /api/refine/health
 * @desc Check AI service health
 * @access Private
 */
router.get('/health', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const healthCheck = await openAIService.healthCheck();
    const modelInfo = openAIService.getModelInfo();

    const response = {
      status: healthCheck.status,
      model: modelInfo.model,
      available: healthCheck.status === 'available',
      maxTokens: modelInfo.maxTokens,
      temperature: modelInfo.temperature,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(503).json({
      success: false,
      error: 'AI service health check failed',
      code: 'HEALTH_CHECK_FAILED',
    });
  }
}));

export default router;