import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/userModel';
import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  isRefreshTokenValid,
  invalidateRefreshToken,
} from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, role } = req.body;

      if (userModel.findByEmail(email)) {
        throw createError('Email already registered', 409);
      }

      const user = userModel.create({ email, password, name, role });
      const payload = { userId: user.id, email: user.email, role: user.role };

      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      storeRefreshToken(user.id, refreshToken);

      res.status(201).json({
        success: true,
        data: {
          user: userModel.toPublic(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const user = userModel.findByEmail(email);
      if (!user || !userModel.verifyPassword(user, password)) {
        throw createError('Invalid email or password', 401);
      }

      const payload = { userId: user.id, email: user.email, role: user.role };
      const accessToken = signAccessToken(payload);
      const refreshToken = signRefreshToken(payload);
      storeRefreshToken(user.id, refreshToken);

      res.json({
        success: true,
        data: {
          user: userModel.toPublic(user),
          accessToken,
          refreshToken,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw createError('Refresh token required', 400);
      if (!isRefreshTokenValid(refreshToken)) throw createError('Invalid refresh token', 401);

      const payload = verifyRefreshToken(refreshToken);
      const user = userModel.findById(payload.userId);
      if (!user) throw createError('User not found', 404);

      invalidateRefreshToken(refreshToken);

      const newPayload = { userId: user.id, email: user.email, role: user.role };
      const newAccess = signAccessToken(newPayload);
      const newRefresh = signRefreshToken(newPayload);
      storeRefreshToken(user.id, newRefresh);

      res.json({ success: true, data: { accessToken: newAccess, refreshToken: newRefresh } });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) invalidateRefreshToken(refreshToken);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = userModel.findById(req.user!.userId);
      if (!user) throw createError('User not found', 404);
      res.json({ success: true, data: userModel.toPublic(user) });
    } catch (err) {
      next(err);
    }
  },

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, phone } = req.body;
      const user = userModel.update(req.user!.userId, { name, phone });
      if (!user) throw createError('User not found', 404);
      res.json({ success: true, data: userModel.toPublic(user) });
    } catch (err) {
      next(err);
    }
  },
};
