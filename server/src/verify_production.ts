import { securityMiddleware } from './middleware/security';
import { costAnalyticsService } from './services/ai/costAnalyticsService';
import { systemMonitor } from './services/monitoring/systemMonitor';
import { db, initializeDatabase } from './config/database';

async function runProductionTests() {
  console.log('🏁 Starting Production Verification Suite...\n');

  // Initialize database first to make sure tables exist
  initializeDatabase();

  // Test 1: SQLite connection & schema check
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='ai_metrics'").get();
    if (tableCheck) {
      console.log('✅ Test 1: SQLite schema checked. Table ai_metrics is present.');
    } else {
      throw new Error('ai_metrics table is missing!');
    }
  } catch (err: any) {
    console.error('❌ Test 1: SQLite check failed:', err.message || err);
    process.exit(1);
  }

  // Test 2: Input Sanitization regex
  try {
    const mockReq = {
      body: { input: '<script>alert("hack")</script>' },
      query: {},
      params: {}
    } as any;
    
    let isBlocked = false;
    const next = (err?: any) => {
      if (err && err.statusCode === 400) {
        isBlocked = true;
      }
    };
    
    securityMiddleware.sanitizeInput(mockReq, {} as any, next);
    
    if (isBlocked) {
      console.log('✅ Test 2: Input sanitization verified. Script injection attempt blocked.');
    } else {
      throw new Error('Failed to block script tag input!');
    }
  } catch (err: any) {
    console.error('❌ Test 2: Input sanitization check failed:', err.message || err);
    process.exit(1);
  }

  // Test 3: Cost & Token estimations
  try {
    const sampleText = 'Looking for luxury suites in Jaipur under $500 for next weekend.';
    const promptTokens = costAnalyticsService.estimateTokens(sampleText, true);
    const cost = costAnalyticsService.calculateCost('Gemini', promptTokens, 200);
    
    if (promptTokens > 0 && cost >= 0) {
      console.log(`✅ Test 3: Token cost calculator verified. Estimated ${promptTokens} tokens, cost: $${cost.toFixed(6)}`);
    } else {
      throw new Error('Calculator returned invalid numbers.');
    }
  } catch (err: any) {
    console.error('❌ Test 3: Token cost check failed:', err.message || err);
    process.exit(1);
  }

  // Test 4: Live Health Diagnostics
  try {
    const health = await systemMonitor.getHealthMetrics();
    if (health && typeof health.cpuUsage === 'number' && health.sqliteHealth.status === 'online') {
      console.log(`✅ Test 4: Live health monitor verified. System CPU: ${health.cpuUsage}%, SQLite Status: ${health.sqliteHealth.status}`);
    } else {
      throw new Error('Invalid health metrics returned.');
    }
  } catch (err: any) {
    console.error('❌ Test 4: Live health monitor check failed:', err.message || err);
    process.exit(1);
  }

  console.log('\n🎉 Production verification checks completed successfully!');
}

runProductionTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
