import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { bookingService } from '../services/booking/bookingService';
import { userModel } from '../models/userModel';
import { hotelModel } from '../models/hotelModel';
import { emailService } from '../services/email/emailService';
import { createError } from '../middleware/errorHandler';
import { journeyAnalyticsService } from '../services/ai/journeyAnalyticsService';

export const bookingController = {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { hotelId, roomType, checkIn, checkOut, guests, specialRequests } = req.body;
      const userId = req.user!.userId;

      // Log booking start event
      journeyAnalyticsService.logEvent(userId, 'BOOKING_STARTED', { hotelId, roomType, checkIn, checkOut, guests });

      const booking = await bookingService.createBooking({
        userId,
        hotelId,
        roomType,
        checkIn,
        checkOut,
        guests,
        specialRequests,
      });

      // Log booking complete event
      journeyAnalyticsService.logEvent(userId, 'BOOKING_COMPLETED', {
        bookingId: booking.id,
        hotelId: booking.hotel_id,
        totalPrice: booking.total_price,
      });

      // Auto-send confirmation email
      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'confirmation',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

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

      // Auto-send modification email
      const user = userModel.findById(req.user!.userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'modification',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

      res.json({ success: true, data: booking });
    } catch (err) {
      next(err);
    }
  },

  async cancel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const booking = await bookingService.cancelBooking(req.params.id as string, userId);

      // Log booking cancellation event
      journeyAnalyticsService.logEvent(userId, 'BOOKING_CANCELLED', {
        bookingId: booking.id,
        hotelId: booking.hotel_id,
      });

      // Auto-send cancellation email
      const user = userModel.findById(userId);
      const hotel = hotelModel.findById(booking.hotel_id);
      if (user && hotel) {
        await emailService.sendEmail({
          to: user.email,
          name: user.name,
          type: 'cancellation',
          bookingId: booking.id,
          hotelName: hotel.name,
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          roomType: booking.room_type,
          totalPrice: booking.total_price,
          guests: booking.guests,
        });
      }

      res.json({ success: true, data: booking, message: 'Booking cancelled successfully' });
    } catch (err) {
      next(err);
    }
  },
};
