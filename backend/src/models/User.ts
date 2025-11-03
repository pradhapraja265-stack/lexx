import { Schema, model } from 'mongoose';
import { IUser, UserPreferences } from '../types';

const userPreferencesSchema = new Schema<UserPreferences>({
  theme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
  },
  defaultTone: {
    type: String,
    enum: ['formal', 'casual', 'friendly', 'professional'],
    default: 'professional',
  },
}, { _id: false });

const userSchema = new Schema<IUser>({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  displayName: {
    type: String,
    required: true,
    trim: true,
  },
  preferences: {
    type: userPreferencesSchema,
    default: () => ({}),
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
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
userSchema.index({ firebaseUid: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to update lastLoginAt
userSchema.pre('save', function(next) {
  if (this.isNew) {
    this.lastLoginAt = new Date();
  }
  next();
});

// Static methods
userSchema.statics.findByFirebaseUid = function(firebaseUid: string) {
  return this.findOne({ firebaseUid });
};

userSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Instance methods
userSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.updatePreferences = function(preferences: Partial<UserPreferences>) {
  if (preferences.theme !== undefined) {
    this.preferences.theme = preferences.theme;
  }
  if (preferences.defaultTone !== undefined) {
    this.preferences.defaultTone = preferences.defaultTone;
  }
  return this.save();
};

export const User = model<IUser>('User', userSchema);