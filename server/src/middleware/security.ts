import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { createError } from './errorHandler';

// Map to track login failures by IP address
const failedLogins = new Map<string, { count: number; lastFailure: number }>();
const SUSPICIOUS_LIMIT = 5;
const COOLDOWN_MS = 15 * 60 * 1000; // 15 minutes cooldown

export const securityMiddleware = {
  /**
   * Monitor failed login attempts
   */
  trackFailedLogin(ip: string) {
    const record = failedLogins.get(ip) || { count: 0, lastFailure: 0 };
    record.count++;
    record.lastFailure = Date.now();
    failedLogins.set(ip, record);

    logger.warn(`⚠️ Failed login attempt from IP: ${ip}. Count: ${record.count}`);
    
    if (record.count >= SUSPICIOUS_LIMIT) {
      logger.audit(null, 'SUSPICIOUS_ACTIVITY', {
        ip,
        detail: `IP exceeded ${SUSPICIOUS_LIMIT} failed login attempts.`,
      });
    }
  },

  /**
   * Clear failed logins upon successful login
   */
  clearFailedLogin(ip: string) {
    failedLogins.delete(ip);
  },

  /**
   * Middleware to check if an IP is blocked temporarily due to suspicious activity
   */
  rateLimitFailedLogins(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const record = failedLogins.get(ip);

    if (record && record.count >= SUSPICIOUS_LIMIT) {
      if (Date.now() - record.lastFailure < COOLDOWN_MS) {
        logger.audit(null, 'BLOCKED_ACCESS_ATTEMPT', { ip });
        return next(createError('Too many failed login attempts. Please try again after 15 minutes.', 429));
      } else {
        // Cooldown period expired, reset count
        failedLogins.delete(ip);
      }
    }
    next();
  },

  /**
   * Simple Input Sanitization middleware to safeguard against basic XSS payloads
   */
  sanitizeInput(req: Request, res: Response, next: NextFunction): void {
    const hasXssPayload = (val: any): boolean => {
      if (typeof val === 'string') {
        // Check for script tags, javascript: protocols, or onload handlers
        const xssRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>|javascript:|on\w+\s*=/i;
        return xssRegex.test(val);
      }
      if (typeof val === 'object' && val !== null) {
        return Object.values(val).some(hasXssPayload);
      }
      return false;
    };

    if (hasXssPayload(req.body) || hasXssPayload(req.query) || hasXssPayload(req.params)) {
      logger.audit(null, 'XSS_ATTEMPT_BLOCKED', {
        ip: req.ip,
        path: req.path,
        body: req.body,
      });
      return next(createError('Potential XSS input detected.', 400));
    }
    next();
  }
};
