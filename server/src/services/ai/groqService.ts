import OpenAI from 'openai';
import { env } from '../../config/env';

class GroqService {
  private client: OpenAI | null = null;
  private readonly modelName = 'llama-3.3-70b-versatile';

  private getClient(): OpenAI {
    if (!this.client) {
      if (!env.groqApiKey) {
        throw new Error('GROQ_API_KEY is not configured.');
      }
      this.client = new OpenAI({
        apiKey: env.groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
    }
    return this.client;
  }

  public isConfigured(): boolean {
    return !!env.groqApiKey;
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

export const groqService = new GroqService();
