import OpenAI from 'openai';
import { env } from '../../config/env';

class GeminiService {
  private client: OpenAI | null = null;
  private readonly modelName = 'gemini-2.5-flash';

  private getClient(): OpenAI {
    if (!this.client) {
      if (!env.geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured.');
      }
      this.client = new OpenAI({
        apiKey: env.geminiApiKey,
        baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      });
    }
    return this.client;
  }

  public isConfigured(): boolean {
    return !!env.geminiApiKey;
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

export const geminiService = new GeminiService();
