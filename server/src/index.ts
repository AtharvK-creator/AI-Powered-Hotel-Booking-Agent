import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { env } from './config/env';
import { initializeDatabase } from './config/database';
import { hotelService } from './services/hotel/hotelService';
import { errorHandler } from './middleware/errorHandler';
import { emailService } from './services/email/emailService';
import { correlationId } from './middleware/correlation';
import { securityMiddleware } from './middleware/security';
import { systemMonitor } from './services/monitoring/systemMonitor';
import { userModel } from './models/userModel';

import authRoutes from './routes/authRoutes';
import hotelRoutes from './routes/hotelRoutes';
import bookingRoutes from './routes/bookingRoutes';
import chatRoutes from './routes/chatRoutes';
import adminRoutes from './routes/adminRoutes';

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(correlationId);
app.use(securityMiddleware.sanitizeInput);

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test email endpoint
app.get('/api/email-test', async (req, res, next) => {
  try {
    const to = (req.query.to as string) || 'test@example.com';
    const name = (req.query.name as string) || 'Honored Guest';
    const type = (req.query.type as 'confirmation' | 'modification' | 'cancellation') || 'confirmation';

    const payload = {
      to,
      name,
      type,
      bookingId: 'BK-TEST-777',
      hotelName: 'The Taj Mahal Palace, Mumbai',
      checkIn: '2026-10-15',
      checkOut: '2026-10-20',
      roomType: 'Luxury Suite',
      totalPrice: 2450.00,
      guests: 2,
    };

    await emailService.sendEmail(payload);

    res.json({
      success: true,
      message: `Test ${type} email request processed for ${to}. Check server console for delivery or simulation log.`,
      payload,
    });
  } catch (err) {
    next(err);
  }
});

// Serve static frontend in production
if (env.nodeEnv === 'production') {
  const clientBuildPath = path.resolve(process.cwd(), '../client/dist');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────
async function bootstrap() {
  initializeDatabase();
  hotelService.seedHotels();

  // Seed admin user if it does not exist
  try {
    const existingAdmin = userModel.findByEmail('admin@aura.com');
    if (!existingAdmin) {
      userModel.create({
        email: 'admin@aura.com',
        password: 'admin123',
        name: 'Aura Admin',
        role: 'admin'
      });
      console.log('✅ Seeded admin user (admin@aura.com / admin123)');
    }
  } catch (err) {
    console.error('Failed to seed admin user:', err);
  }

  // Run startup diagnostics check
  await systemMonitor.runStartupDiagnostics();

  // Verify SMTP connection on startup
  await emailService.verifySmtpConnection();

  app.listen(env.port, () => {
    console.log(`🚀 Server running on http://localhost:${env.port}`);
    console.log(`📊 Environment: ${env.nodeEnv}`);
    console.log(`🤖 Gemini AI: ${env.geminiApiKey ? 'configured' : 'not configured (add GEMINI_API_KEY to .env)'}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
