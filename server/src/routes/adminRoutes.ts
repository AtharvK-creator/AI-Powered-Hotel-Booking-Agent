import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/bookings', adminController.getBookings);
router.get('/cost-analytics', adminController.getCostAnalytics);
router.get('/journey-analytics', adminController.getJourneyAnalytics);
router.get('/system-health-live', adminController.getSystemHealthLive);
router.get('/bi-insights', adminController.getBiInsights);
router.get('/security-audit-logs', adminController.getSecurityAuditLogs);
router.get('/export-metrics', adminController.exportMetrics);

export default router;
