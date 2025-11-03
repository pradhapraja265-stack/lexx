import { Schema, model, Types } from 'mongoose';
import { IChatSession, IMessage, MessageMetadata } from '../types';

const messageMetadataSchema = new Schema<MessageMetadata>({
  model: {
    type: String,
    required: true,
  },
  tokensUsed: {
    type: Number,
    required: true,
    min: 0,
  },
  processingTime: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const messageSchema = new Schema<IMessage>({
  id: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  originalText: {
    type: String,
    trim: true,
  },
  refinedText: {
    type: String,
    trim: true,
  },
  tone: {
    type: String,
    enum: ['formal', 'casual', 'friendly', 'professional'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: messageMetadataSchema,
  },
}, { _id: true });

const chatSessionSchema = new Schema<IChatSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  messages: {
    type: [messageSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for better performance
chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ createdAt: -1 });
chatSessionSchema.index({ 'messages.timestamp': -1 });

// Pre-save middleware to update updatedAt timestamp
chatSessionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static methods
chatSessionSchema.statics.findByUserId = function(userId: string, limit = 50, skip = 0) {
  return this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'id email displayName');
};

chatSessionSchema.statics.findByIdAndUserId = function(sessionId: string, userId: string) {
  return this.findOne({ _id: sessionId, userId })
    .populate('userId', 'id email displayName');
};

// Instance methods
chatSessionSchema.methods.addMessage = function(message: Omit<IMessage, 'id'>) {
  const messageWithId = {
    ...message,
    id: new Types.ObjectId().toString(),
  };

  this.messages.push(messageWithId);

  // Update title if this is the first message
  if (this.messages.length === 1) {
    this.title = message.content.slice(0, 100) + (message.content.length > 100 ? '...' : '');
  }

  return this.save();
};

chatSessionSchema.methods.addUserMessage = function(content: string) {
  return this.addMessage({
    type: 'user',
    content,
    timestamp: new Date(),
  });
};

chatSessionSchema.methods.addAIMessage = function(
  content: string,
  originalText: string,
  tone: string,
  metadata: MessageMetadata
) {
  return this.addMessage({
    type: 'ai',
    content,
    originalText,
    refinedText: content,
    tone,
    timestamp: new Date(),
    metadata,
  });
};

chatSessionSchema.methods.updateTitle = function(title: string) {
  this.title = title;
  return this.save();
};

// Virtual for message count
chatSessionSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

chatSessionSchema.virtual('lastMessage').get(function() {
  return this.messages[this.messages.length - 1];
});

// Ensure virtuals are included in JSON output
chatSessionSchema.set('toJSON', { virtuals: true });
chatSessionSchema.set('toObject', { virtuals: true });

export const ChatSession = model<IChatSession>('ChatSession', chatSessionSchema);