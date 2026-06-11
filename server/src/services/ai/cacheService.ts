import { createClient } from 'redis';
import { env } from '../../config/env';

class CacheService {
  private redisClient: any = null;
  private isRedisConnected = false;
  private memoryCache = new Map<string, { val: any; expiresAt: number }>();
  private readonly DEFAULT_TTL = 24 * 60 * 60; // 24 hours in seconds

  constructor() {
    this.initRedis();
  }

  private async initRedis() {
    try {
      this.redisClient = createClient({
        url: env.redisUrl,
      });

      this.redisClient.on('error', (err: any) => {
        if (this.isRedisConnected) {
          console.error('❌ Redis Connection Error:', err.message || err);
        }
        this.isRedisConnected = false;
      });

      this.redisClient.on('connect', () => {
        console.log('🔌 Connecting to Redis...');
      });

      this.redisClient.on('ready', () => {
        console.log('✅ Redis Cache connected and ready!');
        this.isRedisConnected = true;
      });

      await this.redisClient.connect();
    } catch (err: any) {
      console.warn('⚠️ Redis not available, using in-memory cache fallback. Error:', err.message || err);
      this.isRedisConnected = false;
      this.redisClient = null;
    }
  }

  /**
   * Normalize user query to optimize cache keys.
   */
  public normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .replace(/\s+/g, ' ')      // Collapse multiple spaces
      .trim();
  }

  /**
   * Determine if a query is personal (contains booking actions, user details)
   * which should NOT be cached for privacy and correctness.
   */
  public isPersonalQuery(query: string): boolean {
    const queryLower = query.toLowerCase();
    const personalKeywords = [
      'book', 'reserve', 'booking', 'cancel', 'modify', 'change', 'reschedule',
      'my name', 'my booking', 'my reservation', 'my history', 'my profile', 
      'user', 'password', 'login', 'register', 'auth', 'email'
    ];
    return personalKeywords.some((keyword) => queryLower.includes(keyword));
  }

  /**
   * Get value from cache.
   */
  public async get(query: string): Promise<any | null> {
    if (this.isPersonalQuery(query)) {
      return null;
    }

    const key = `ai_cache:${this.normalizeQuery(query)}`;

    if (this.isRedisConnected && this.redisClient) {
      try {
        const data = await this.redisClient.get(key);
        if (data) {
          return JSON.parse(data);
        }
      } catch (err: any) {
        console.error('❌ Error getting from Redis:', err.message || err);
      }
    }

    // Fallback to In-Memory Cache
    const entry = this.memoryCache.get(key);
    if (entry) {
      if (entry.expiresAt > Date.now()) {
        return entry.val;
      } else {
        this.memoryCache.delete(key); // Clean up expired entry
      }
    }

    return null;
  }

  /**
   * Store value in cache.
   */
  public async set(query: string, value: any, ttlSeconds: number = this.DEFAULT_TTL): Promise<void> {
    if (this.isPersonalQuery(query)) {
      return;
    }

    const key = `ai_cache:${this.normalizeQuery(query)}`;

    if (this.isRedisConnected && this.redisClient) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), {
          EX: ttlSeconds,
        });
        return;
      } catch (err: any) {
        console.error('❌ Error setting to Redis:', err.message || err);
      }
    }

    // Fallback to In-Memory Cache
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.memoryCache.set(key, { val: value, expiresAt });
  }

  /**
   * Health check for Redis cache.
   */
  public isHealthy(): boolean {
    return this.isRedisConnected;
  }
}

export const cacheService = new CacheService();
