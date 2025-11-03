import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest, AppError, JWTPayload } from '../types';
import { User } from '../models/User';

// Verify JWT token middleware
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new AppError('Access token required', 401, 'MISSING_TOKEN');
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new AppError('JWT secret not configured', 500, 'INTERNAL_ERROR');
    }

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Find user in database
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }

    // Attach user to request object
    req.user = {
      id: user._id.toString(),
      firebaseUid: user.firebaseUid,
      email: user.email,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    } else {
      next(error);
    }
  }
};

// Optional authentication - doesn't throw error if no token
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
        const user = await User.findById(decoded.id);

        if (user) {
          req.user = {
            id: user._id.toString(),
            firebaseUid: user.firebaseUid,
            email: user.email,
          };
        }
      }
    }

    next();
  } catch (error) {
    // Silently continue for optional auth
    next();
  }
};

// Check if user owns the resource
export const checkResourceOwnership = (resourceIdParam: string = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'AUTH_REQUIRED');
      }

      const resourceId = req.params[resourceIdParam];
      if (!resourceId) {
        throw new AppError('Resource ID required', 400, 'MISSING_RESOURCE_ID');
      }

      // This is a generic check - specific routes should implement their own ownership logic
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Generate JWT token
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new AppError('JWT secret not configured', 500, 'INTERNAL_ERROR');
  }

  return jwt.sign(payload, jwtSecret, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

// Verify Firebase token (for initial authentication)
export const verifyFirebaseToken = async (token: string): Promise<any> => {
  try {
    // In a real implementation, you would use Firebase Admin SDK
    // For now, we'll decode the token without verification (development only)
    const decoded = jwt.decode(token);
    if (!decoded || typeof decoded !== 'object') {
      throw new AppError('Invalid Firebase token', 401, 'INVALID_FIREBASE_TOKEN');
    }

    // In production, verify with Firebase Admin SDK:
    // const decodedToken = await admin.auth().verifyIdToken(token);

    return decoded;
  } catch (error) {
    throw new AppError('Failed to verify Firebase token', 401, 'FIREBASE_TOKEN_VERIFICATION_FAILED');
  }
};