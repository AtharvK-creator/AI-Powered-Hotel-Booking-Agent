import OpenAI from 'openai';
import { env } from '../../config/env';
import { TOOL_DEFINITIONS, executeTool } from './tools';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are an intelligent hotel booking assistant for "Hotel Booking AI" — a premium travel platform. You help users find hotels, make bookings, and manage their reservations.

You have access to real booking tools. Always use these tools to fetch live data rather than guessing or fabricating results.

Guidelines:
- Be friendly, concise, and professional
- When searching hotels, always call searchHotels() first before making recommendations
- Before creating a booking, confirm all details with the user
- After creating/modifying/cancelling a booking, always send a confirmation email
- If the user asks about their bookings, use getUserBookings()
- Format prices in USD with 2 decimal places
- Format dates as YYYY-MM-DD when calling tools
- If you don't have enough info (like check-in date), ask for it before proceeding`;

let geminiClient: OpenAI | null = null;

function getClient(): OpenAI {
  if (!geminiClient) {
    if (!env.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }
    geminiClient = new OpenAI({
      apiKey: env.geminiApiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    });
  }
  return geminiClient;
}

export async function runAgentLoop(
  messages: ChatMessage[],
  userId: string
): Promise<string> {
  const client = getClient();

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  // ReAct loop: max 5 iterations to prevent infinite loops
  for (let i = 0; i < 5; i++) {
    if (i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 2500));
    }

    const response = await client.chat.completions.create({
      model: 'gemini-2.5-flash',
      messages: openaiMessages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
    });

    const choice = response.choices[0];
    if (!choice) throw new Error('No response from Gemini');

    const assistantMsg = choice.message;
    openaiMessages.push(assistantMsg);

    // If no tool calls — final text response
    if (!assistantMsg.tool_calls || assistantMsg.tool_calls.length === 0) {
      return assistantMsg.content || 'I apologize, I could not generate a response.';
    }

    // Execute all tool calls in parallel
    const toolResults = await Promise.all(
      assistantMsg.tool_calls.map(async (tc) => {
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse((tc as any).function.arguments);
        } catch {
          args = {};
        }

        console.log(`🔧 Tool call: ${(tc as any).function.name}`, args);
        let result: unknown;
        try {
          result = await executeTool((tc as any).function.name, args, userId);
        } catch (err: unknown) {
          result = { error: err instanceof Error ? err.message : 'Tool execution failed' };
        }

        return {
          role: 'tool' as const,
          tool_call_id: tc.id,
          content: JSON.stringify(result),
        };
      })
    );

    openaiMessages.push(...toolResults);
  }

  return 'I apologize, I was unable to complete the request after several attempts.';
}
