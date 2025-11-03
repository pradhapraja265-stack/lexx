import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticateToken, verifyFirebaseToken, generateToken } from '../middleware/auth';
import { validate, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest, AuthResponse, AuthenticatedRequest } from '../types';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc Authenticate user with Firebase token
 * @access Public
 */
router.post('/login', validate(schemas.login), asyncHandler(async (req: Request, res: Response) => {
  const { firebaseToken }: AuthRequest = req.body;

  try {
    // Verify Firebase token
    const firebaseUser = await verifyFirebaseToken(firebaseToken);

    if (!firebaseUser.email || !firebaseUser.uid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Firebase token',
        code: 'INVALID_FIREBASE_TOKEN',
      });
    }

    // Find or create user
    let user = await User.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please sign up first.',
        code: 'USER_NOT_FOUND',
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
    });

    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
      },
      token,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED',
    });
  }
}));

/**
 * @route POST /api/auth/register
 * @desc Register new user from Firebase auth
 * @access Public
 */
router.post('/register', validate(schemas.register), asyncHandler(async (req: Request, res: Response) => {
  const { firebaseToken, displayName }: AuthRequest = req.body;

  try {
    // Verify Firebase token
    const firebaseUser = await verifyFirebaseToken(firebaseToken);

    if (!firebaseUser.email || !firebaseUser.uid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Firebase token',
        code: 'INVALID_FIREBASE_TOKEN',
      });
    }

    // Check if user already exists
    const existingUser = await User.findByFirebaseUid(firebaseUser.uid);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists',
        code: 'USER_ALREADY_EXISTS',
      });
    }

    // Also check by email
    const existingEmailUser = await User.findByEmail(firebaseUser.email);
    if (existingEmailUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
        code: 'EMAIL_ALREADY_EXISTS',
      });
    }

    // Create new user
    const user = new User({
      firebaseUid: firebaseUser.uid,
      email: firebaseUser.email.toLowerCase(),
      displayName: displayName.trim(),
      preferences: {
        theme: 'light',
        defaultTone: 'professional',
      },
    });

    await user.save();

    // Generate JWT token
    const token = generateToken({
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
    });

    const response: AuthResponse = {
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
      },
      token,
    };

    res.status(201).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      code: 'REGISTRATION_FAILED',
    });
  }
}));

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    const response = {
      id: user._id.toString(),
      email: user.email,
      displayName: user.displayName,
      preferences: user.preferences,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info',
      code: 'GET_USER_FAILED',
    });
  }
}));

/**
 * @route POST /api/auth/logout
 * @desc Logout user (client-side token removal)
 * @access Private
 */
router.post('/logout', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  // In a stateless JWT system, logout is primarily client-side
  // The client simply removes the token
  // We could implement a token blacklist if needed

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}));

/**
 * @route PUT /api/auth/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences',
  authenticateToken,
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

      // Update preferences
      await user.updatePreferences(req.body);

      const response = {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        preferences: user.preferences,
      };

      res.json({
        success: true,
        data: response,
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

export default router;