import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/userModel';
import { bookingModel } from '../models/bookingModel';
import { hotelModel } from '../models/hotelModel';

export const adminController = {
  getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = {
        totalUsers: userModel.count(),
        totalHotels: hotelModel.count(),
        totalBookings: bookingModel.count(),
        totalRevenue: bookingModel.revenue(),
      };
      res.json({ success: true, data: stats });
    } catch (err) {
      next(err);
    }
  },

  getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '50', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      const users = userModel.findAll(limit, offset);
      res.json({ success: true, data: users, count: users.length });
    } catch (err) {
      next(err);
    }
  },

  getBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      const bookings = bookingModel.findAll(limit, offset);
      res.json({ success: true, data: bookings, count: bookings.length });
    } catch (err) {
      next(err);
    }
  },
};
