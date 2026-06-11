import { env } from '../config/env';
import { db } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

export const logger = {
  info(message: string, context?: any) {
    this.log('INFO', message, context);
  },

  warn(message: string, context?: any) {
    this.log('WARN', message, context);
  },

  error(message: string, error?: any, context?: any) {
    this.log('ERROR', message, {
      ...context,
      error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    });
  },

  audit(userId: string | null, action: string, details?: any) {
    this.log('AUDIT', `[AUDIT] User ${userId || 'SYSTEM'} performed ${action}`, { userId, action, details });
    try {
      const id = `aud-${uuidv4()}`;
      db.prepare(
        'INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)'
      ).run(id, userId, action, details ? JSON.stringify(details) : null);
    } catch (err: any) {
      console.error('❌ Logger Audit failed to write to database:', err.message || err);
    }
  },

  log(level: string, message: string, context?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context && { context }),
    };

    if (env.nodeEnv === 'production') {
      // JSON format for cloud logging aggregators
      console.log(JSON.stringify(logEntry));
    } else {
      // Colorized format for development console
      const colors: Record<string, string> = {
        INFO: '\x1b[36m',  // Cyan
        WARN: '\x1b[33m',  // Yellow
        ERROR: '\x1b[31m', // Red
        AUDIT: '\x1b[35m', // Magenta
      };
      const reset = '\x1b[0m';
      const color = colors[level] || reset;
      
      console.log(`${color}[${logEntry.timestamp}] ${level}:${reset} ${message}`);
      if (context) {
        console.log(JSON.stringify(context, null, 2));
      }
    }
  },
};
