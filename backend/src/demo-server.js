const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory storage
const chatSessions = new Map();
const users = new Map();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
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
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      openai: 'demo-mode',
    },
    storage: 'in-memory',
  });
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
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Text cannot be empty',
        code: 'INVALID_INPUT',
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Text is too long. Maximum 5000 characters allowed.',
        code: 'INVALID_INPUT',
      });
    }

    if (text.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Text is too short. Minimum 10 characters required.',
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

    // Demo responses
    const demoResponses = {
      formal: `I would like to formally request your consideration of the following matter: ${text}`,
      casual: `Hey, just wanted to chat about this: ${text}`,
      friendly: `That's a great point! I think ${text.toLowerCase()} is really interesting!`,
      professional: `This communication regards: ${text}`,
    };

    const refinedText = demoResponses[tone] || text;
    const startTime = Date.now();
    const processingTime = (Date.now() - startTime) / 1000;

    // Add AI response
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: refinedText,
      originalText: text,
      refinedText: refinedText,
      tone: tone,
      timestamp: new Date(),
      metadata: {
        model: 'demo-mode',
        tokensUsed: 100,
        processingTime: processingTime,
      },
    };
    session.messages.push(aiMessage);
    session.updatedAt = new Date();

    const response = {
      refinedText: refinedText,
      originalText: text,
      tone: tone,
      metadata: {
        model: 'demo-mode',
        tokensUsed: 100,
        processingTime: processingTime,
      },
      sessionId: session.id,
    };

    return res.json({
      success: true,
      data: response,
    });

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

  return res.json({
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

  return res.status(201).json({
    success: true,
    data: { session },
  });
});

// Get supported tones
app.get('/api/tones', (req, res) => {
  const supportedTones = ['formal', 'casual', 'friendly', 'professional'];

  const toneDescriptions = {
    formal: 'Professional and respectful tone suitable for business communications',
    casual: 'Relaxed and conversational tone for informal interactions',
    friendly: 'Warm and approachable tone with positive language',
    professional: 'Business-appropriate tone that is clear and concise',
  };

  const response = supportedTones.map((tone) => ({
    value: tone,
    label: tone.charAt(0).toUpperCase() + tone.slice(1),
    description: toneDescriptions[tone],
  }));

  return res.json({
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
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
    code: 'NOT_FOUND',
  });
});

// Global error handler
app.use((error, req, res, next) => {
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
    console.log(`🤖 AI Mode: Demo Mode (add OpenAI API key for real AI)`);
  });
};

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = app;