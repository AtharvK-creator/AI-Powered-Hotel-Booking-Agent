import { geminiService } from './geminiService';
import { groqService } from './groqService';
import { openrouterService } from './openrouterService';
import { cacheService } from './cacheService';
import { costAnalyticsService } from './costAnalyticsService';

export interface RouterParams {
  messages: any[];
  tools?: any[];
  tool_choice?: any;
  userId: string;
}

class AIRouterService {
  private readonly TIMEOUT_MS = 8000; // 8 seconds timeout per provider
  private readonly MAX_RETRIES = 2;   // 2 retries per provider
  public geminiCoolDownUntil = 0; // track cooldown expiration for 429s

  /**
   * Helper to sleep for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Execute a service call with timeout and retries
   */
  private async executeWithRetryAndTimeout(
    serviceName: string,
    service: { generateCompletion: (params: any) => Promise<any> },
    params: any
  ): Promise<{ response: any; retryCount: number }> {
    let attempt = 0;
    let delay = 1500;

    while (true) {
      try {
        console.log(`%c📡 [AI Router] Calling ${serviceName} (Attempt ${attempt + 1}/${this.MAX_RETRIES + 1})...`, 'color: cyan');
        const response = await service.generateCompletion({
          messages: params.messages,
          tools: params.tools,
          tool_choice: params.tool_choice,
          timeout: this.TIMEOUT_MS,
        });
        return { response, retryCount: attempt };
      } catch (err: any) {
        attempt++;
        const timestamp = new Date().toISOString();
        const errMsg = err.message || '';
        console.error(`❌ [AI Router] ${serviceName} failed at ${timestamp}: ${errMsg || err}`);

        // Immediate failover for 429s (rate limits) and 400s (bad requests / schema mismatches)
        const is429 = errMsg.includes('429') || errMsg.toLowerCase().includes('rate limit');
        const is400 = errMsg.includes('400') || errMsg.toLowerCase().includes('bad request') || errMsg.toLowerCase().includes('failed to call a function') || errMsg.includes('404');
        if (is429 || is400) {
          console.warn(`⚠️ [AI Router] ${is429 ? '429 Rate Limit' : is400 ? '400 Bad Request' : '404 Not Found'} detected for ${serviceName}. Skipping retries for immediate failover.`);
          throw err;
        }

        if (attempt <= this.MAX_RETRIES) {
          console.warn(`⏳ [AI Router] Retrying ${serviceName} in ${delay}ms...`);
          await this.sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }
        throw err;
      }
    }
  }

  /**
   * Main completion router method
   */
  public async generateCompletion(params: RouterParams): Promise<any> {
    const messages = params.messages;
    const lastUserMsg = messages[messages.length - 1]?.content || '';
    const startTime = Date.now();

    // 1. Check Cache
    if (lastUserMsg && !cacheService.isPersonalQuery(lastUserMsg)) {
      try {
        const cachedResponse = await cacheService.get(lastUserMsg);
        if (cachedResponse) {
          console.log(`💾 [AI Router] Cache hit for query: "${lastUserMsg}"`);
          
          // Log Cache Observability Metric
          costAnalyticsService.logAiMetrics({
            userId: params.userId,
            provider: 'Cache',
            cacheHit: true,
            responseTimeMs: Date.now() - startTime,
            success: true,
            retryCount: 0,
            fallbackTriggered: false,
            inputTokens: 0,
            outputTokens: 0,
          });

          return cachedResponse;
        }
      } catch (err: any) {
        console.error('❌ [AI Router] Cache retrieval failed:', err.message || err);
      }
    }

    // 2. Define provider failover list
    const isGeminiCooledDown = Date.now() < this.geminiCoolDownUntil;
    if (isGeminiCooledDown) {
      console.log(`⏭️ [AI Router] Temporarily skipping Gemini (cooling down after 429 rate limit)`);
    }

    const providers = [
      { name: 'Gemini', service: geminiService, enabled: geminiService.isConfigured() && !isGeminiCooledDown },
      { name: 'Groq', service: groqService, enabled: groqService.isConfigured() },
      { name: 'OpenRouter', service: openrouterService, enabled: openrouterService.isConfigured() }
    ];

    let lastError: any = null;
    let fallbackCount = 0;

    // 3. Failover routing loop
    for (const provider of providers) {
      if (!provider.enabled) {
        if (provider.name !== 'Gemini' || !isGeminiCooledDown) {
          console.log(`⏭️ [AI Router] Skipping ${provider.name} (API Key not configured)`);
        }
        continue;
      }

      const providerStartTime = Date.now();
      const fallbackTriggered = fallbackCount > 0;
      fallbackCount++;

      try {
        const { response, retryCount } = await this.executeWithRetryAndTimeout(provider.name, provider.service, {
          messages,
          tools: params.tools,
          tool_choice: params.tool_choice
        });

        if (response) {
          console.log(`✅ [AI Router] Successful completion from ${provider.name}`);
          const duration = Date.now() - providerStartTime;

          // Estimate/parse tokens
          const choice = response.choices?.[0];
          const hasToolCalls = choice?.message?.tool_calls && choice.message.tool_calls.length > 0;
          const content = choice?.message?.content || '';
          
          const promptText = JSON.stringify(messages);
          const inputTokens = response.usage?.prompt_tokens || costAnalyticsService.estimateTokens(promptText, true);
          const outputTokens = response.usage?.completion_tokens || costAnalyticsService.estimateTokens(content, false);

          // Log Success Metric
          costAnalyticsService.logAiMetrics({
            userId: params.userId,
            provider: provider.name,
            cacheHit: false,
            responseTimeMs: duration,
            success: true,
            retryCount,
            fallbackTriggered,
            inputTokens,
            outputTokens,
          });

          // Caching criteria: non-personal response, and response has content, and no tool calls
          if (content && !hasToolCalls && lastUserMsg && !cacheService.isPersonalQuery(lastUserMsg)) {
            console.log(`💾 [AI Router] Caching successful response for query: "${lastUserMsg}"`);
            await cacheService.set(lastUserMsg, response);
          }

          return response;
        }
      } catch (err: any) {
        lastError = err;
        const duration = Date.now() - providerStartTime;
        console.warn(`⚠️ [AI Router] Failover: ${provider.name} failed. Attempting next provider...`);

        if (provider.name === 'Gemini') {
          const errMsg = err.message || '';
          const is429 = errMsg.includes('429') || errMsg.toLowerCase().includes('rate limit');
          if (is429) {
            this.geminiCoolDownUntil = Date.now() + 60 * 1000;
            console.warn(`🔒 [AI Router] Gemini hit 429 rate limit. Cooldown activated for 60s.`);
          }
        }

        // Log Failed Metric
        costAnalyticsService.logAiMetrics({
          userId: params.userId,
          provider: provider.name,
          cacheHit: false,
          responseTimeMs: duration,
          success: false,
          retryCount: this.MAX_RETRIES,
          fallbackTriggered,
          inputTokens: 0,
          outputTokens: 0,
        });
      }
    }

    // If all providers fail
    const errorMsg = lastError ? lastError.message || lastError : 'All configured AI providers failed';
    throw new Error(`AI Router Error: ${errorMsg}`);
  }
}

export const aiRouterService = new AIRouterService();
