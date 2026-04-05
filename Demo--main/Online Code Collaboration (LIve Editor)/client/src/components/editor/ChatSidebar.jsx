import React, { useState, useRef, useEffect } from 'react';
import { Send, Trash2, X, MessageCircle, Loader } from 'lucide-react';
import { chatAPI } from '../../utils/api';
import '../../styles/chat.css';

export default function ChatSidebar({ code, language, isOpen, onClose, roomId, width }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'system',
      content: 'Welcome to Nexus AI Assistant! Ask me anything about your code or programming concepts.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputValue.trim()) {
      return;
    }

    // Add user message to UI
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError('');

    try {
      // Send to API
      const response = await chatAPI.sendMessage({
        message: inputValue,
        roomId,
        codeContext: {
          code,
          language,
        },
      });

      // Add AI response
      if (response.data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setError(response.data.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to send message';

      setError(errorMessage);

      // Add error message to chat
      const errorMsg = {
        id: Date.now() + 1,
        type: 'error',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([
        {
          id: Date.now(),
          type: 'system',
          content:
            'Chat cleared. Welcome back! Ask me anything about your code or programming concepts.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="chat-sidebar" style={{ width: width || 400 }}>
      <div className="chat-header">
        <div className="chat-title">
          <MessageCircle size={20} />
          <span>AI Assistant</span>
        </div>
        <div className="chat-controls">
          <button
            className="btn-chat btn-clear-chat"
            onClick={handleClearChat}
            title="Clear Chat"
          >
            <Trash2 size={16} />
          </button>
          <button
            className="btn-chat btn-close-chat"
            onClick={onClose}
            title="Close Chat"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`chat-message message-${message.type}`}>
            <div className="message-avatar">
              {message.type === 'user' && '👤'}
              {message.type === 'ai' && '🤖'}
              {message.type === 'system' && 'ℹ️'}
              {message.type === 'error' && '⚠️'}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message message-loading">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="chat-error-banner">
          <span>{error}</span>
          <button
            onClick={() => setError('')}
            className="btn-dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="chat-input-area">
        <div className="chat-input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything..."
            disabled={loading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="btn-send"
            title="Send Message"
          >
            {loading ? <Loader size={18} className="spinner" /> : <Send size={18} />}
          </button>
        </div>
        <div className="chat-hint">
          💡 Context: Current code is shared with AI for better assistance
        </div>
      </form>
    </div>
  );
}
