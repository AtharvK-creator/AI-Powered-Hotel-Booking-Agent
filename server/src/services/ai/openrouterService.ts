import OpenAI from 'openai';
import { env } from '../../config/env';

class OpenRouterService {
  private client: OpenAI | null = null;
  private readonly modelName = 'meta-llama/llama-3.1-8b-instruct:free';

  private getClient(): OpenAI {
    if (!this.client) {
      if (!env.openrouterApiKey) {
        throw new Error('OPENROUTER_API_KEY is not configured.');
      }
      this.client = new OpenAI({
        apiKey: env.openrouterApiKey,
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://localhost:5000', // Optional referer for OpenRouter
          'X-Title': 'AURA AI Hotel Concierge',     // Optional app title for OpenRouter rankings
        }
      });
    }
    return this.client;
  }

  public isConfigured(): boolean {
    return !!env.openrouterApiKey;
  }

  public async generateCompletion(params: {
    messages: any[];
    tools?: any[];
    tool_choice?: any;
    timeout?: number;
  }): Promise<any> {
    const openai = this.getClient();
    
    // Set up AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), params.timeout || 10000);

    try {
      const response = await openai.chat.completions.create({
        model: this.modelName,
        messages: params.messages,
        tools: params.tools,
        tool_choice: params.tool_choice,
        temperature: 0,
      }, { signal: controller.signal });
      
      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const openrouterService = new OpenRouterService();
