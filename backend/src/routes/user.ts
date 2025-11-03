import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest, UpdateUserPreferencesDto } from '../types';

const router = Router();

// All user routes require authentication
router.use(authenticateToken);

/**
 * @route GET /api/user/profile
 * @desc Get user profile and preferences
 * @access Private
 */
router.get('/profile', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Get chat session statistics
    const ChatSession = (await import('../models/ChatSession')).ChatSession;
    const totalSessions = await ChatSession.countDocuments({ userId: user._id });
    const totalMessages = await ChatSession.aggregate([
      { $match: { userId: user._id } },
      { $project: { messageCount: { $size: '$messages' } } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } },
    ]);

    const response = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      statistics: {
        totalSessions,
        totalMessages: totalMessages[0]?.total || 0,
      },
    };

    res.json({
      success: true,
      data: { user: response },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile',
      code: 'GET_PROFILE_FAILED',
    });
  }
}));

/**
 * @route PUT /api/user/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences',
  validate(schemas.updatePreferences),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      const preferences: UpdateUserPreferencesDto = req.body;

      // Update preferences
      await user.updatePreferences(preferences);

      const response = {
        theme: user.preferences.theme,
        defaultTone: user.preferences.defaultTone,
      };

      res.json({
        success: true,
        data: { preferences: response },
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
        code: 'UPDATE_PREFERENCES_FAILED',
      });
    }
  })
);

/**
 * @route PUT /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  validate({
    displayName: schemas.register.extract('displayName'),
  }),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = await User.findById(req.user!.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      const { displayName } = req.body;

      // Update display name
      user.displayName = displayName.trim();
      await user.save();

      const response = {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
        updatedAt: user.updatedAt,
      };

      res.json({
        success: true,
        data: { user: response },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile',
        code: 'UPDATE_PROFILE_FAILED',
      });
    }
  })
);

/**
 * @route DELETE /api/user/account
 * @desc Delete user account and all data
 * @access Private
 */
router.delete('/account', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Delete all chat sessions
    const ChatSession = (await import('../models/ChatSession')).ChatSession;
    await ChatSession.deleteMany({ userId: user._id });

    // Delete user
    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete account',
      code: 'DELETE_ACCOUNT_FAILED',
    });
  }
}));

/**
 * @route GET /api/user/statistics
 * @desc Get user usage statistics
 * @access Private
 */
router.get('/statistics', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const ChatSession = (await import('../models/ChatSession')).ChatSession;

    // Get session statistics
    const sessionStats = await ChatSession.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          totalMessages: { $sum: { $size: '$messages' } },
          totalTokens: { $sum: '$messages.metadata.tokensUsed' },
          averageSessionLength: { $avg: { $size: '$messages' } },
        },
      },
    ]);

    // Get tone usage statistics
    const toneStats = await ChatSession.aggregate([
      { $match: { userId: user._id } },
      { $unwind: '$messages' },
      { $match: { 'messages.type': 'ai', 'messages.tone': { $exists: true } } },
      {
        $group: {
          _id: '$messages.tone',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Get activity over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activityStats = await ChatSession.aggregate([
      {
        $match: {
          userId: user._id,
          updatedAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$updatedAt' },
            month: { $month: '$updatedAt' },
            day: { $dayOfMonth: '$updatedAt' },
          },
          sessions: { $sum: 1 },
          messages: { $sum: { $size: '$messages' } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    ]);

    const stats = sessionStats[0] || {
      totalSessions: 0,
      totalMessages: 0,
      totalTokens: 0,
      averageSessionLength: 0,
    };

    const response = {
      overview: {
        totalSessions: stats.totalSessions,
        totalMessages: stats.totalMessages,
        totalTokensUsed: stats.totalTokens,
        averageSessionLength: Math.round(stats.averageSessionLength * 10) / 10,
        memberSince: user.createdAt,
        lastActive: user.lastLoginAt,
      },
      toneUsage: toneStats.map(stat => ({
        tone: stat._id,
        count: stat.count,
        percentage: Math.round((stat.count / stats.totalMessages) * 100),
      })),
      activity: activityStats.map(stat => ({
        date: `${stat._id.year}-${String(stat._id.month).padStart(2, '0')}-${String(stat._id.day).padStart(2, '0')}`,
        sessions: stat.sessions,
        messages: stat.messages,
      })),
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics',
      code: 'GET_STATISTICS_FAILED',
    });
  }
}));

export default router;