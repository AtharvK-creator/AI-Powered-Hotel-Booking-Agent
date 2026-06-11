import { Request, Response, NextFunction } from 'express';
import { hotelService } from '../services/hotel/hotelService';
import { createError } from '../middleware/errorHandler';
import { journeyAnalyticsService } from '../services/ai/journeyAnalyticsService';

export const hotelController = {
  getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const hotels = hotelService.getAllHotels();
      res.json({ success: true, data: hotels, count: hotels.length });
    } catch (err) {
      next(err);
    }
  },

  getById(req: Request, res: Response, next: NextFunction) {
    try {
      const hotel = hotelService.getHotelById(req.params.id as string);
      if (!hotel) throw createError('Hotel not found', 404);

      const userId = (req as any).user?.userId || null;
      journeyAnalyticsService.logEvent(userId, 'HOTEL_VIEWED', {
        hotelId: hotel.id,
        hotelName: hotel.name,
        city: hotel.city,
      });

      res.json({ success: true, data: hotel });
    } catch (err) {
      next(err);
    }
  },

  search(req: Request, res: Response, next: NextFunction) {
    try {
      const { city, minPrice, maxPrice, minRating, guests, checkIn, checkOut } = req.query;
      const results = hotelService.searchHotels({
        city: city as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minRating: minRating ? parseFloat(minRating as string) : undefined,
        guests: guests ? parseInt(guests as string, 10) : undefined,
        checkIn: checkIn as string | undefined,
        checkOut: checkOut as string | undefined,
      });

      const userId = (req as any).user?.userId || null;
      journeyAnalyticsService.logEvent(userId, 'SEARCH', {
        city: city as string | undefined,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        guests: guests ? parseInt(guests as string, 10) : undefined,
      });

      res.json({ success: true, data: results, count: results.length });
    } catch (err) {
      next(err);
    }
  },
};
