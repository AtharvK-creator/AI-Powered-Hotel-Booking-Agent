import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bookingService } from '../services/booking/bookingService';
import { createError } from '../middleware/errorHandler';

export const bookingController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { hotelId, roomType, checkIn, checkOut, guests, specialRequests } = req.body;
      const booking = await bookingService.createBooking({
        userId: req.user!.userId,
        hotelId,
        roomType,
        checkIn,
        checkOut,
        guests,
        specialRequests,
      });
      res.status(201).json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  },

  getMyBookings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const bookings = bookingService.getUserBookings(req.user!.userId);
      res.json({ success: true, data: bookings, count: bookings.length });
    } catch (err) {
      next(err);
    }
  },

  getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = bookingService.getBookingById(req.params.id as string);
      if (!booking) throw createError('Booking not found', 404);
      if (booking.user_id !== req.user!.userId && req.user!.role !== 'admin') {
        throw createError('Unauthorized', 403);
      }
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  },

  async modify(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.modifyBooking({
        bookingId: req.params.id as string,
        userId: req.user!.userId,
        ...req.body,
      });
      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const booking = await bookingService.cancelBooking(req.params.id as string, req.user!.userId);
      res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
    } catch (err) {
      next(err);
    }
  },
};
