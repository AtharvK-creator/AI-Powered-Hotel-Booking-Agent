import { Request, Response, NextFunction } from 'express';
import { userModel } from '../models/userModel';
import { bookingModel } from '../models/bookingModel';
import { hotelModel } from '../models/hotelModel';
import { costAnalyticsService } from '../services/ai/costAnalyticsService';
import { journeyAnalyticsService } from '../services/ai/journeyAnalyticsService';
import { systemMonitor } from '../services/monitoring/systemMonitor';
import { db } from '../config/database';

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

  getCostAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = costAnalyticsService.getSummaryMetrics();
      const providers = costAnalyticsService.getProviderBreakdown();
      res.json({ success: true, data: { summary, providers } });
    } catch (err) {
      next(err);
    }
  },

  getJourneyAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const funnel = journeyAnalyticsService.getFunnelMetrics();
      const popularDestinations = journeyAnalyticsService.getPopularDestinations();
      const mostViewedHotels = journeyAnalyticsService.getMostViewedHotels();
      const conversionStats = journeyAnalyticsService.getConversionStats();
      res.json({
        success: true,
        data: { funnel, popularDestinations, mostViewedHotels, conversionStats }
      });
    } catch (err) {
      next(err);
    }
  },

  async getSystemHealthLive(_req: Request, res: Response, next: NextFunction) {
    try {
      const health = await systemMonitor.getHealthMetrics();
      res.json({ success: true, data: health });
    } catch (err) {
      next(err);
    }
  },

  getBiInsights(_req: Request, res: Response, next: NextFunction) {
    try {
      const insights = costAnalyticsService.getProductionInsights();
      res.json({ success: true, data: { insights } });
    } catch (err) {
      next(err);
    }
  },

  getSecurityAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt((req.query.limit as string) || '100', 10);
      const offset = parseInt((req.query.offset as string) || '0', 10);
      const logs = db.prepare(
        'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?'
      ).all(limit, offset);
      res.json({ success: true, data: logs });
    } catch (err) {
      next(err);
    }
  },

  exportMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const csv = costAnalyticsService.exportMetricsToCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=ai_metrics.csv');
      res.status(200).send(csv);
    } catch (err) {
      next(err);
    }
  }
};
