import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { OpenAIService } from './services/openaiService';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory storage
const chatSessions = new Map<string, any>();
const users = new Map<string, any>();

// Initialize OpenAI service
const openaiService = OpenAIService.getInstance();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:3000',
    ];

    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = await openaiService.healthCheck();

    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        openai: healthCheck.status,
      },
      storage: 'in-memory',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Simple text refinement endpoint
app.post('/api/refine', async (req, res) => {
  try {
    const { text, tone, sessionId } = req.body;

    if (!text || !tone) {
      return res.status(400).json({
        success: false,
        error: 'Text and tone are required',
        code: 'INVALID_INPUT',
      });
    }

    // Validate input
    const validation = openaiService.validateInput(text);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error || 'Invalid input text',
        code: 'INVALID_INPUT',
      });
    }

    // Get or create session
    let session;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId);
    } else {
      const newSessionId = Date.now().toString();
      session = {
        id: newSessionId,
        title: text.slice(0, 50) + (text.length > 50 ? '...' : ''),
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      chatSessions.set(newSessionId, session);
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date(),
    };
    session.messages.push(userMessage);

    try {
      // Process with AI
      const aiResponse = await openaiService.refineText(text, tone as any);

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse.refinedText,
        originalText: text,
        refinedText: aiResponse.refinedText,
        tone: tone,
        timestamp: new Date(),
        metadata: aiResponse.metadata,
      };
      session.messages.push(aiMessage);
      session.updatedAt = new Date();

      const response = {
        refinedText: aiResponse.refinedText,
        originalText: text,
        tone: tone,
        metadata: aiResponse.metadata,
        sessionId: session.id,
      };

      return res.json({
        success: true,
        data: response,
      });

    } catch (aiError) {
      console.error('OpenAI API error:', aiError);

      // Remove user message if AI processing failed
      session.messages.pop();

      const errorMessage = aiError instanceof Error ? aiError.message : 'AI service unavailable';
      const statusCode = errorMessage.includes('quota') ? 429 : 503;

      return res.status(statusCode).json({
        success: false,
        error: errorMessage,
        code: 'AI_SERVICE_ERROR',
      });
    }

  } catch (error) {
    console.error('Text refinement error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refine text',
      code: 'REFINE_FAILED',
    });
  }
});

// Get sessions endpoint
app.get('/api/sessions', (req, res) => {
  const sessions = Array.from(chatSessions.values()).map(session => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    messageCount: session.messages.length,
    lastMessage: session.messages[session.messages.length - 1]?.content || null,
  }));

  res.json({
    success: true,
    data: { sessions },
  });
});

// Get specific session
app.get('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = chatSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      code: 'SESSION_NOT_FOUND',
    });
  }

  return res.json({
    success: true,
    data: { session },
  });
});

// Delete session
app.delete('/api/sessions/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const deleted = chatSessions.delete(sessionId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      code: 'SESSION_NOT_FOUND',
    });
  }

  return res.status(204).send();
});

// Create new session
app.post('/api/sessions', (req, res) => {
  const { title } = req.body;
  const sessionId = Date.now().toString();

  const session = {
    id: sessionId,
    title: title || 'New Chat',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  chatSessions.set(sessionId, session);

  res.status(201).json({
    success: true,
    data: { session },
  });
});

// Get supported tones
app.get('/api/tones', (req, res) => {
  const supportedTones = openaiService.getSupportedTones();

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
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'LexiFix Simple API Server',
    version: '1.0.0',
    status: 'running',
    storage: 'in-memory',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
});

// Start server
const startServer = () => {
  app.listen(PORT, () => {
    console.log(`🚀 LexiFix Simple API server running on port ${PORT}`);
    console.log(`📖 API endpoints: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💾 Storage: In-memory (no database required)`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

// Start the server
if (require.main === module) {
  startServer();
}

export default app;