import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { db } from '../config/database';
import { runAgentLoop, ChatMessage } from '../services/ai/agent';
import { generateId } from '../utils/idGenerator';
import { createError } from '../middleware/errorHandler';
import { env } from '../config/env';

interface ChatSession {
  id: string;
  user_id: string;
  messages: string;
  created_at: string;
  updated_at: string;
}

function getOrCreateSession(userId: string): { id: string; messages: ChatMessage[] } {
  const existing = db
    .prepare('SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(userId) as ChatSession | undefined;

  if (existing) {
    return { id: existing.id, messages: JSON.parse(existing.messages) };
  }

  const id = generateId();
  const now = new Date().toISOString();
  db.prepare(
    'INSERT INTO chat_sessions (id, user_id, messages, created_at, updated_at) VALUES (?, ?, ?, ?, ?)'
  ).run(id, userId, '[]', now, now);

  return { id, messages: [] };
}

function saveMessages(sessionId: string, messages: ChatMessage[]): void {
  db.prepare('UPDATE chat_sessions SET messages = ?, updated_at = ? WHERE id = ?').run(
    JSON.stringify(messages),
    new Date().toISOString(),
    sessionId
  );
}

const userQueues = new Map<string, Promise<any>>();

export const chatController = {
  async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!env.geminiApiKey) {
        throw createError(
          'AI assistant is not configured. Please add GEMINI_API_KEY to your .env file.',
          503
        );
      }

      const { message, sessionId: clientSessionId } = req.body;
      if (!message?.trim()) throw createError('Message is required', 400);

      const userId = req.user!.userId;

      // Throttle and queue requests per user to prevent rapid repeated calls
      const executeChatTask = async () => {
        // Load or create session
        let session: { id: string; messages: ChatMessage[] };
        if (clientSessionId) {
          const existing = db.prepare('SELECT * FROM chat_sessions WHERE id = ? AND user_id = ?').get(
            clientSessionId, userId
          ) as ChatSession | undefined;
          session = existing
            ? { id: existing.id, messages: JSON.parse(existing.messages) }
            : getOrCreateSession(userId);
        } else {
          session = getOrCreateSession(userId);
        }

        // Append user message
        session.messages.push({ role: 'user', content: message });

        // Keep last 20 messages to avoid token bloat
        const recentMessages = session.messages.slice(-20);

        // Run agent
        const assistantReply = await runAgentLoop(recentMessages, userId);

        // Append assistant reply
        session.messages.push({ role: 'assistant', content: assistantReply });

        // Persist session
        saveMessages(session.id, session.messages);

        return {
          success: true,
          data: {
            sessionId: session.id,
            reply: assistantReply,
            messages: session.messages,
          },
        };
      };

      const currentPromise = userQueues.get(userId) || Promise.resolve();
      const nextPromise = currentPromise.then(async () => {
        // Enforce 1000ms delay between consecutive message processing to throttle request rate
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return executeChatTask();
      });
      // Safety catch to keep the queue sequence moving even if a request fails
      userQueues.set(userId, nextPromise.catch(() => {}));

      const responseData = await nextPromise;
      res.json(responseData);
    } catch (err) {
      next(err);
    }
  },

  getHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const session = getOrCreateSession(req.user!.userId);
      res.json({ success: true, data: { sessionId: session.id, messages: session.messages } });
    } catch (err) {
      next(err);
    }
  },

  clearHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      db.prepare('UPDATE chat_sessions SET messages = ?, updated_at = ? WHERE user_id = ?').run(
        '[]', new Date().toISOString(), req.user!.userId
      );
      res.json({ success: true, message: 'Chat history cleared' });
    } catch (err) {
      next(err);
    }
  },
};
