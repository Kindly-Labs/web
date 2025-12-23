/**
 * chatLogic.ts
 * Core logic for The Digital Concierge.
 * Implements a 4-Layer Logic Stack for robust, zero-latency intent detection.
 */

import Fuse from 'fuse.js';
import { knowledgeBase, type KnowledgeEntry } from './knowledgeBase';

// --- Configuration ---

// Layer 1: Contextual Flow (Memory)
// Maps a Topic ID -> Next Logical Topic ID
const TOPIC_FLOW: Record<string, string> = {
  mission: 'services', // After Mission -> Show Services
  who: 'mission', // After Team -> Show Mission
  services: 'how_it_works', // After Services -> Explain Process
  how_it_works: 'contact', // After Process -> Call to Action
  website: 'digitize', // After Website -> General Digitization
  volunteer: 'handbook', // After Volunteer -> Handbook
};

// Layer 3: Heuristic Match (Translator)
// Normalizes 3rd person to 2nd person
const HEURISTIC_REPLACEMENTS: [RegExp, string][] = [
  [/\bhe\b/gi, 'you'],
  [/\bshe\b/gi, 'you'],
  [/\bthey\b/gi, 'you'],
  [/\badrian\b/gi, 'you'], // Founder specific
  [/\bkindly\b/gi, 'you'],
  [/\bdoes\b/gi, 'do'],
  [/\bis\b/gi, 'are'],
];

// Fuse.js Options (Layer 4)
const fuseOptions = {
  keys: [
    { name: 'triggers', weight: 1.0 }, // High priority: Natural language phrases
    { name: 'keywords', weight: 0.6 }, // Medium priority: Core keywords
    { name: 'text', weight: 0.1 }, // Low priority: Contextual search within answer
  ],
  threshold: 0.4, // Stricter threshold for better accuracy
  ignoreLocation: true,
  includeScore: true,
  minMatchCharLength: 3,
};

const fuse = new Fuse(knowledgeBase, fuseOptions);

// --- System Responses ---

const FALLBACK_RESPONSE: KnowledgeEntry = {
  id: 'system_fallback',
  keywords: [],
  text: "I'm still learning the ecosystem. Try asking about our 'Mission', 'Services', 'Transparency', or 'Open Registry'. If you need immediate help, type 'contact'.",
  suggestions: ['Our Mission', 'Services', 'Contact'],
};

// --- Core Logic ---

/**
 * Generates a response based on the 4-Layer Logic Stack.
 * @param message The user's raw input.
 * @param lastTopicId The ID of the previous topic (for context).
 */
export function generateChatResponse(message: string, lastTopicId?: string): KnowledgeEntry {
  const rawLower = message.toLowerCase().trim();

  // LAYER 1: Contextual Flow (The "Memory")
  // Checks if user is asking for a follow-up (e.g., "tell me more", "continue")
  const isFollowUp = /tell me more|continue|what else|next/i.test(rawLower);

  if (isFollowUp && lastTopicId && TOPIC_FLOW[lastTopicId]) {
    const nextTopicId = TOPIC_FLOW[lastTopicId];
    const nextTopic = knowledgeBase.find((k) => k.id === nextTopicId);
    if (nextTopic) {
      // console.log(`[Layer 1] Flow: ${lastTopicId} -> ${nextTopicId}`);
      return nextTopic;
    }
  }

  // LAYER 2: Priority Match (The "Reflex")
  // exact string matching against 'triggers' for 100% precision on known commands
  // This is O(n*m) but n (entries) and m (triggers) are small enough for <1ms
  for (const entry of knowledgeBase) {
    if (entry.triggers?.some((t) => t.toLowerCase() === rawLower)) {
      // console.log(`[Layer 2] Priority Match: "${rawLower}" -> ${entry.id}`);
      return entry;
    }
  }

  // LAYER 3: Heuristic Match (The "Translator")
  // Pre-process 3rd person input to 2nd person to catch variations
  // e.g. "What does he do?" -> "What do you do?"
  let normalizedMessage = rawLower;
  for (const [pattern, replacement] of HEURISTIC_REPLACEMENTS) {
    normalizedMessage = normalizedMessage.replace(pattern, replacement);
  }

  // Re-run Layer 2 check with normalized message if it changed
  if (normalizedMessage !== rawLower) {
    for (const entry of knowledgeBase) {
      if (entry.triggers?.some((t) => t.toLowerCase() === normalizedMessage)) {
        // console.log(`[Layer 3] Heuristic Match: "${rawLower}" -> "${normalizedMessage}" -> ${entry.id}`);
        return entry;
      }
    }
  }

  // LAYER 4: Fuzzy Fallback (The "Intuition")
  // Use Fuse.js to find the best semantic match
  const results = fuse.search(normalizedMessage);
  if (results.length > 0) {
    // console.log(`[Layer 4] Fuzzy Match: "${normalizedMessage}" -> ${results[0].item.id} (Score: ${results[0].score})`);
    return results[0].item;
  }

  // Fallback
  return FALLBACK_RESPONSE;
}
