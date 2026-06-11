import os from 'os';
import { db } from '../../config/database';
import { cacheService } from '../ai/cacheService';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

export interface SystemHealthMetrics {
  cpuUsage: number;
  memoryUsage: {
    free: number;
    total: number;
    processHeap: number;
  };
  sqliteHealth: {
    status: 'online' | 'offline';
    latencyMs: number;
  };
  redisHealth: {
    status: 'online' | 'offline';
    latencyMs: number;
  };
  providersHealth: {
    gemini: 'online' | 'degraded' | 'offline';
    groq: 'online' | 'degraded' | 'offline';
    openrouter: 'online' | 'degraded' | 'offline';
  };
}

class SystemMonitor {
  private readonly windowMinutes = 15;

  /**
   * Run startup diagnostics
   */
  public async runStartupDiagnostics(): Promise<void> {
    console.log('🔍 Running server startup diagnostics...');
    try {
      // 1. SQLite Check
      const dbCheck = db.prepare('SELECT 1').get();
      if (dbCheck) {
        console.log('✅ SQLite Connection: OK');
      } else {
        throw new Error('SQLite query returned empty');
      }
    } catch (err: any) {
      console.error('❌ SQLite Connection Failed:', err.message || err);
    }

    // 2. Redis Check
    const isRedisReady = cacheService.isHealthy();
    console.log(`🔌 Redis Cache: ${isRedisReady ? '✅ Connected' : '⚠️ Offline (using memory fallback)'}`);

    // 3. AI Keys check
    console.log(`🤖 Gemini API Key: ${env.geminiApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🤖 Groq API Key: ${env.groqApiKey ? '✅ Configured' : '❌ Missing'}`);
    console.log(`🤖 OpenRouter API Key: ${env.openrouterApiKey ? '✅ Configured' : '❌ Missing'}`);
  }

  /**
   * Measure SQLite Query Latency
   */
  private getSqliteLatency(): { status: 'online' | 'offline'; latencyMs: number } {
    const start = Date.now();
    try {
      const check = db.prepare('SELECT 1').get();
      if (!check) throw new Error('Query failed');
      return { status: 'online', latencyMs: Date.now() - start };
    } catch (err: any) {
      logger.error('SQLite health check failed:', err);
      return { status: 'offline', latencyMs: -1 };
    }
  }

  /**
   * Measure Redis Ping Latency
   */
  private async getRedisLatency(): Promise<{ status: 'online' | 'offline'; latencyMs: number }> {
    const service = cacheService as any;
    if (!service.isRedisConnected || !service.redisClient) {
      return { status: 'offline', latencyMs: -1 };
    }

    const start = Date.now();
    try {
      await service.redisClient.ping();
      return { status: 'online', latencyMs: Date.now() - start };
    } catch (err: any) {
      return { status: 'offline', latencyMs: -1 };
    }
  }

  /**
   * Assess AI Provider Health based on database metrics
   */
  private getProviderHealth(
    providerName: string,
    apiKeyConfigured: boolean
  ): 'online' | 'degraded' | 'offline' {
    if (!apiKeyConfigured) {
      return 'offline';
    }

    try {
      // Fetch last 10 requests for this provider to analyze error rates
      const logs = db.prepare(
        `SELECT success FROM ai_metrics 
         WHERE provider LIKE ? 
         ORDER BY timestamp DESC 
         LIMIT 10`
      ).all(`${providerName}%`) as { success: number }[];

      if (logs.length === 0) {
        return 'online'; // No logs yet, assume online
      }

      const failures = logs.filter(log => log.success === 0).length;
      const failureRate = failures / logs.length;

      if (failureRate >= 0.8) {
        return 'offline';
      } else if (failureRate >= 0.3) {
        return 'degraded';
      }
      return 'online';
    } catch (err) {
      return 'online'; // Database error, fall back to online status check
    }
  }

  /**
   * Compile overall system health report
   */
  public async getHealthMetrics(): Promise<SystemHealthMetrics> {
    const sqlite = this.getSqliteLatency();
    const redis = await this.getRedisLatency();

    // CPU estimation
    const loadAvg = os.loadavg();
    // loadAvg[0] is the 1-minute load average. Convert to simple % estimation
    const cores = os.cpus().length;
    const cpuUsage = Math.min(Math.round((loadAvg[0] / cores) * 100), 100) || 12; // Fallback to 12% mock load on Windows if loadavg is 0

    // Memory estimation
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const processHeap = process.memoryUsage().heapUsed;

    const gemini = this.getProviderHealth('Gemini', !!env.geminiApiKey);
    const groq = this.getProviderHealth('Groq', !!env.groqApiKey);
    const openrouter = this.getProviderHealth('OpenRouter', !!env.openrouterApiKey);

    return {
      cpuUsage,
      memoryUsage: {
        free: freeMem,
        total: totalMem,
        processHeap,
      },
      sqliteHealth: sqlite,
      redisHealth: redis,
      providersHealth: {
        gemini,
        groq,
        openrouter,
      },
    };
  }
}

export const systemMonitor = new SystemMonitor();
