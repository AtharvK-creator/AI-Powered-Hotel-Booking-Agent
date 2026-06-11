import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { cacheService } from '../services/ai/cacheService';
import { createError } from './errorHandler';

// Standard Redis client extraction or using the memory cache fallback
// We can use the redisClient from cacheService if it's connected
const getRedisClient = () => {
  // Access private client from cacheService via duck typing or direct access
  const service = cacheService as any;
  if (service.isRedisConnected && service.redisClient) {
    return service.redisClient;
  }
  return null;
};

// Memory fallback store
const memoryStore = new Map<string, number[]>();

export async function rateLimiter(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    // If not authenticated, skip or apply standard rate limit (optional)
    return next();
  }

  const limit = 20;
  const windowSeconds = 60;
  const key = `rate_limit:${userId}`;
  const redisClient = getRedisClient();

  if (redisClient) {
    try {
      // Redis rate limiting using MULTI/transaction
      const current = await redisClient.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= limit) {
        return next(createError('Too many requests. Please try again in a minute.', 429));
      }

      // Increment and set TTL if new
      if (count === 0) {
        await redisClient.set(key, '1', { EX: windowSeconds });
      } else {
        await redisClient.incr(key);
      }
      return next();
    } catch (err: any) {
      console.error('❌ Redis Rate Limiting error, falling back to memory:', err.message || err);
    }
  }

  // --- In-Memory Rate Limiting Fallback ---
  const now = Date.now();
  const userRequests = memoryStore.get(userId) || [];

  // Filter out requests older than 1 minute (60,000 ms)
  const recentRequests = userRequests.filter((timestamp) => now - timestamp < windowSeconds * 1000);

  if (recentRequests.length >= limit) {
    return next(createError('Too many requests. Please try again in a minute.', 429));
  }

  // Record the new request
  recentRequests.push(now);
  memoryStore.set(userId, recentRequests);

  // Periodic cleanup of memory store (optional)
  if (memoryStore.size > 1000) {
    const threshold = now - windowSeconds * 1000;
    for (const [uid, timestamps] of memoryStore.entries()) {
      const active = timestamps.filter((t) => t > threshold);
      if (active.length === 0) {
        memoryStore.delete(uid);
      } else {
        memoryStore.set(uid, active);
      }
    }
  }

  next();
}
