import { useState, useEffect, useRef } from 'react';
import { chatApi } from '../api/chat';
import { ChatMessage } from '../types';
import './ChatPage.css';

const SUGGESTIONS = [
  'Find hotels in Paris under $400',
  'Show me luxury hotels in Dubai',
  'What are my current bookings?',
  'Book a hotel in Tokyo for 2 guests next week',
  'Cancel my latest booking',
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatApi.getHistory()
      .then((res) => {
        setMessages(res.data.data.messages || []);
        setSessionId(res.data.data.sessionId);
      })
      .finally(() => setIsInitializing(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await chatApi.sendMessage(text, sessionId);
      const { reply, sessionId: newSessionId } = res.data.data;
      setSessionId(newSessionId);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${msg || 'Something went wrong. Please check your GROK_API_KEY in the .env file.'}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Clear chat history?')) return;
    await chatApi.clearHistory();
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="chat-page page-content">
      <div className="chat-layout">
        {/* Sidebar */}
        <aside className="chat-sidebar glass-panel">
          <div className="sidebar-header">
            <h2 className="sidebar-title">🤖 AI Assistant</h2>
            <p className="sidebar-subtitle">Powered by Grok</p>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Try asking</h4>
            <div className="suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  className="suggestion-btn"
                  onClick={() => sendMessage(s)}
                  disabled={isLoading}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-capabilities">
            <h4 className="sidebar-section-title">Capabilities</h4>
            <ul className="capability-list">
              <li>🔍 Search hotels</li>
              <li>📋 View hotel details</li>
              <li>🏨 Create bookings</li>
              <li>✏️ Modify bookings</li>
              <li>❌ Cancel bookings</li>
              <li>📖 View your bookings</li>
              <li>📧 Send email notifications</li>
            </ul>
          </div>

          {messages.length > 0 && (
            <button onClick={handleClear} className="btn btn-ghost btn-sm clear-btn">
              🗑️ Clear Chat
            </button>
          )}
        </aside>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="chat-messages">
            {isInitializing ? (
              <div className="loading-center">
                <div className="spinner" />
                <p>Loading conversation...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="chat-welcome">
                <div className="welcome-icon">🤖</div>
                <h3 className="welcome-title">Hello! I'm your Hotel AI Assistant</h3>
                <p className="welcome-subtitle">
                  I can search hotels, create bookings, and manage your reservations.
                  Try one of the suggestions on the left, or just ask me anything!
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${msg.role === 'user' ? 'message-user' : 'message-ai'} animate-fade`}
                >
                  {msg.role === 'assistant' && (
                    <div className="message-avatar">🤖</div>
                  )}
                  <div className="message-bubble">
                    <p className="message-text">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="message-avatar user-avatar-sm">
                      👤
                    </div>
                  )}
                </div>
              ))
            )}

            {isLoading && (
              <div className="chat-message message-ai animate-fade">
                <div className="message-avatar">🤖</div>
                <div className="message-bubble typing-indicator">
                  <span /><span /><span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area glass-panel">
            <textarea
              id="chat-input"
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me to find hotels, make bookings, or manage your reservations..."
              rows={1}
              disabled={isLoading}
            />
            <button
              id="chat-send"
              className="btn btn-primary send-btn"
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? <span className="spinner spinner-sm" /> : '➤'}
            </button>
          </div>
          <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
