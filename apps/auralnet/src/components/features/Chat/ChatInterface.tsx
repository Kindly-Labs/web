import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateChatResponse } from './chatLogic';
import { useMockLLM } from './useMockLLM';
import { MessageSquare, X, Send, ArrowRight } from 'lucide-react';

// Static "Category Buttons" for main navigation
const CATEGORY_CHIPS = [
  { icon: '🚀', label: 'Digitize Biz', text: 'How can I get help digitizing my business?' },
  { icon: '💡', label: 'Services', text: 'What services do you offer?' },
  { icon: '🤝', label: 'Volunteer', text: 'How can I volunteer?' },
  { icon: '📘', label: 'Handbook', text: 'Show me the handbook' },
];

const STORAGE_KEY_OPEN = 'kindly_chat_open';
const STORAGE_KEY_HEIGHT = 'kindly_chat_height';

const ChatInterface: React.FC = () => {
  const { chatHistory, sendMessage, isLLMLoading } = useMockLLM(generateChatResponse);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpenState] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [height, setHeight] = useState(750);
  const [isResizing, setIsResizing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load open state and height from LocalStorage
  useEffect(() => {
    const savedOpen = localStorage.getItem(STORAGE_KEY_OPEN);
    const savedHeight = localStorage.getItem(STORAGE_KEY_HEIGHT);

    if (savedOpen === 'true') setIsOpenState(true);
    if (savedHeight) setHeight(parseInt(savedHeight, 10));

    setIsInitialized(true);
  }, []);

  const setIsOpen = (value: boolean) => {
    setIsOpenState(value);
    localStorage.setItem(STORAGE_KEY_OPEN, String(value));
  };

  // Resize handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    localStorage.setItem(STORAGE_KEY_HEIGHT, String(height));
  }, [height]);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY - 80; // 80px buffer from bottom
        if (newHeight > 400 && newHeight < window.innerHeight - 100) {
          setHeight(newHeight);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isLLMLoading, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLLMLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleChipClick = (chipText: string) => {
    if (isLLMLoading) return;
    sendMessage(chipText);
  };

  if (!isInitialized) return null;

  return (
    <div className="fixed right-6 bottom-24 z-[150] flex flex-col items-end font-sans md:bottom-6">
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{ height: `${height}px` }}
          className="bg-glass-surface/95 border-glass-stroke animate-in fade-in slide-in-from-bottom-4 relative mb-6 flex max-h-[85vh] w-[90vw] max-w-[450px] flex-col overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300"
        >
          {/* Resize Handle */}
          <div
            onMouseDown={startResizing}
            className="group absolute top-0 right-0 left-0 z-50 flex h-2 cursor-ns-resize items-start justify-center bg-transparent transition-colors hover:bg-white/10"
          >
            <div className="group-hover:bg-neon-400/50 mt-1 h-1 w-12 rounded-full bg-white/20 transition-colors" />
          </div>

          {/* Header */}
          <div className="border-glass-stroke/50 from-forest-900/80 to-forest-800/80 flex items-center justify-between border-b bg-gradient-to-r p-5 pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-neon-400/20 border-neon-400/50 text-neon-400 flex h-10 w-10 items-center justify-center rounded-full border shadow-[0_0_15px_rgba(0,255,148,0.3)]">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-wide text-white">Digital Concierge</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-neon-400 h-2 w-2 animate-pulse rounded-full"></span>
                  <span className="text-sm text-gray-300">Online & Ready</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close chat"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages */}
          <div className="scrollbar-thin scrollbar-thumb-glass-stroke scrollbar-track-transparent flex-1 space-y-6 overflow-y-auto p-5">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-base leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-neon-400/20 border-neon-400/30 rounded-tr-sm border text-white'
                      : 'rounded-tl-sm border border-white/10 bg-white/10 text-gray-100'
                  } `}
                  dangerouslySetInnerHTML={{ __html: msg.text }}
                />

                {/* Contextual Suggestions */}
                {msg.sender === 'bot' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 flex max-w-[90%] flex-wrap gap-2">
                    {msg.suggestions.map((suggestion, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleChipClick(suggestion)}
                        disabled={isLLMLoading}
                        className="hover:bg-neon-400/10 hover:border-neon-400/50 text-neon-400 flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm transition-colors disabled:opacity-50"
                      >
                        {suggestion} <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLLMLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm border border-white/10 bg-white/10 p-4">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Main Category Buttons */}
          <div className="scrollbar-none border-glass-stroke/30 bg-glass-surface/50 flex gap-3 overflow-x-auto border-t px-4 pt-2 pb-3 backdrop-blur-sm">
            {CATEGORY_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.text)}
                disabled={isLLMLoading}
                className="hover:bg-neon-400/10 hover:border-neon-400/50 group flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                <span className="mb-1 text-xl transition-transform group-hover:scale-110">
                  {chip.icon}
                </span>
                <span className="group-hover:text-neon-400 text-center text-[10px] leading-tight font-medium text-gray-300">
                  {chip.label}
                </span>
              </button>
            ))}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="border-glass-stroke/50 bg-forest-950/80 border-t p-5"
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your question..."
                disabled={isLLMLoading}
                className="border-glass-stroke/50 focus:border-neon-400/50 focus:ring-neon-400/20 h-12 w-full rounded-xl border bg-black/30 px-5 pr-14 text-base text-white shadow-inner transition-all placeholder:text-gray-500 focus:ring-1 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLLMLoading}
                className="text-neon-400 hover:bg-neon-400/10 absolute right-2 rounded-lg p-2 transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group bg-glass-surface/90 border-neon-400/30 hover:border-neon-400/80 relative flex h-16 w-16 items-center justify-center rounded-full border-2 shadow-2xl backdrop-blur-md transition-all duration-300 hover:scale-110"
          aria-label="Open chat"
        >
          <div className="bg-neon-400/10 group-hover:bg-neon-400/20 absolute inset-0 rounded-full transition-colors"></div>
          <MessageSquare className="text-neon-400" size={28} />

          {/* Status Dot */}
          <span className="bg-neon-400 border-forest-900 absolute top-1 right-1 h-3.5 w-3.5 animate-pulse rounded-full border-2"></span>
        </button>
      )}
    </div>
  );
};

export default ChatInterface;
