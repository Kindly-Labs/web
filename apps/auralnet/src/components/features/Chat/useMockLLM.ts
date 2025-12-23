/**
 * useMockLLM.ts
 * Custom hook to simulate LLM network latency and state management.
 * Now with LocalStorage persistence and Contextual Memory.
 */

import { useState, useCallback, useEffect } from 'react';
import type { KnowledgeEntry } from './knowledgeBase';

export interface ChatMessage {
  text: string;
  suggestions?: string[];
  sender: 'user' | 'bot';
}

// Generator now accepts an optional context ID
type GeneratorFunction = (message: string, lastTopicId?: string) => KnowledgeEntry;

const STORAGE_KEY_HISTORY = 'kindly_chat_history';
const STORAGE_KEY_TOPIC = 'kindly_chat_topic';

export const useMockLLM = (generator: GeneratorFunction) => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      text: "Hello! I'm the Digital Concierge. How can I help you today?",
      sender: 'bot',
      suggestions: ['What do you do?', 'Digitize my business', 'I want to volunteer'],
    },
  ]);
  const [lastTopicId, setLastTopicId] = useState<string | undefined>(undefined);
  const [isLLMLoading, setIsLLMLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from LocalStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY_HISTORY);
    const savedTopic = localStorage.getItem(STORAGE_KEY_TOPIC);

    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChatHistory(parsed);
        }
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    if (savedTopic) {
      setLastTopicId(savedTopic);
    }

    setIsInitialized(true);
  }, []);

  // Save to LocalStorage on change (only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(chatHistory));
      if (lastTopicId) {
        localStorage.setItem(STORAGE_KEY_TOPIC, lastTopicId);
      }
    }
  }, [chatHistory, lastTopicId, isInitialized]);

  const sendMessage = useCallback(
    (userMessage: string) => {
      const userMsg: ChatMessage = { text: userMessage, sender: 'user' };
      setChatHistory((prev) => [...prev, userMsg]);
      setIsLLMLoading(true);

      // Simulate API call and latency (1.0 - 1.5 seconds)
      setTimeout(() => {
        // Pass current topic context to the generator
        const response = generator(userMessage, lastTopicId);

        // Handle response text variations (if array, pick random)
        const responseText = Array.isArray(response.text)
          ? response.text[Math.floor(Math.random() * response.text.length)]
          : response.text;

        const botMsg: ChatMessage = {
          text: responseText,
          suggestions: response.suggestions,
          sender: 'bot',
        };

        setChatHistory((prev) => [...prev, botMsg]);
        setLastTopicId(response.id); // Update context
        setIsLLMLoading(false);
      }, 1200); // Slightly faster than before for snappier feel
    },
    [generator, lastTopicId]
  );

  // Helper to clear history (optional, good for debugging)
  const clearHistory = useCallback(() => {
    setChatHistory([
      {
        text: "Hello! I'm the Digital Concierge. How can I help you today?",
        sender: 'bot',
        suggestions: ['What do you do?', 'Digitize my business', 'I want to volunteer'],
      },
    ]);
    setLastTopicId(undefined);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_TOPIC);
  }, []);

  return { chatHistory, sendMessage, isLLMLoading, clearHistory };
};
