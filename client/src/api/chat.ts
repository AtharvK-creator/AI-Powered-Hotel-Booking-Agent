import api from './axios';

export const chatApi = {
  sendMessage: (message: string, sessionId?: string) =>
    api.post('/chat/message', { message, sessionId }),

  getHistory: () =>
    api.get('/chat/history'),

  clearHistory: () =>
    api.delete('/chat/history'),
};
