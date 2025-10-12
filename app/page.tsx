'use client';

import { useState, useRef, useEffect } from 'react';
import { DynamicUIRenderer } from '../src/react/Renderer';
import type { AgentResponse } from '../src/agent/schema';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ui?: AgentResponse;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const text = await response.text();
      
      // Parse the streamed response
      const lines = text.split('\n').filter(Boolean);
      for (const line of lines) {
        if (line.startsWith('0:')) {
          const jsonStr = line.slice(2);
          const parsed = JSON.parse(JSON.parse(jsonStr));
          
          if (parsed.type === 'ui') {
            const assistantMessage: Message = {
              role: 'assistant',
              content: parsed.data.description || 'Generated UI component',
              ui: parsed.data,
            };
            setMessages((prev) => [...prev, assistantMessage]);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error generating the UI.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionId: string, payload?: any) => {
    console.log('Action triggered:', actionId, payload);
    // You can add custom action handling here
  };

  const suggestions = [
    'Create a login form with email and password',
    'Build a pricing table with 3 tiers',
    'Make a dashboard card with stats',
    'Design a user profile form',
  ];

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Dynamic UI Agent
              </h1>
              <p className="text-sm text-gray-600">
                Chat with AI to generate UI components
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
              <div className="rounded-full bg-blue-100 p-6">
                <Sparkles className="h-12 w-12 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  Welcome to Dynamic UI Agent
                </h2>
                <p className="mt-2 text-gray-600">
                  Describe the UI component you want to create and I'll generate
                  it for you
                </p>
              </div>
              <div className="w-full max-w-2xl">
                <p className="mb-4 text-sm font-medium text-gray-700">
                  Try these examples:
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-blue-300 hover:bg-blue-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] ${
                      message.role === 'user'
                        ? 'rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-3 text-white'
                        : 'space-y-3'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <>
                        {message.ui && (
                          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                            {message.ui.title && (
                              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                                {message.ui.title}
                              </h3>
                            )}
                            {message.ui.description && (
                              <p className="mb-4 text-sm text-gray-600">
                                {message.ui.description}
                              </p>
                            )}
                            <DynamicUIRenderer
                              response={message.ui}
                              onAction={handleAction}
                            />
                            {message.ui.suggestions &&
                              message.ui.suggestions.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                  <p className="mb-3 text-xs font-medium text-gray-500">
                                    Suggestions:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {message.ui.suggestions.map((suggestion) => (
                                      <button
                                        key={suggestion}
                                        onClick={() => setInput(suggestion)}
                                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-200"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            {message.ui.followUpQuestion && (
                              <p className="mt-4 text-sm italic text-gray-600">
                                {message.ui.followUpQuestion}
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.2s]"></div>
                      <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-6 py-4 shadow-lg">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the UI component you want to create..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
