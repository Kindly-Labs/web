import { useState, useCallback, useEffect, useRef } from 'react';
import { logger, ConversationEvents } from '@/shared/lib/logger';
import { ApiClient } from '@/shared/lib/api-client';
import { audioPlayer } from '@/shared/utils/voice/audio-player';
import { useSessionAccess } from './hooks/use-session-access';
import { useRealtimeSession } from './hooks/use-realtime-session';
import { saveConversation, loadConversation } from '@/shared/utils/conversation-storage';
// Permission Type
import { PermissionStatus } from '@/shared/utils/voice/permissions';

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

export type SessionStatus =
  | 'initializing'
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'unsupported'
  | 'insecure-context'
  | 'limit-reached'
  | 'offline';
export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';
export type TextSource = 'user' | 'ai' | 'system';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function useSessionManager() {
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('idle'); // Real permission state

  // Unified Text State
  const [activeText, setActiveText] = useState('');
  const [activeTextSource, setActiveTextSource] = useState<TextSource>('system');

  const [transcript, setTranscript] = useState(''); // Keep for logic/logging
  const [currentAssistantMessage, setCurrentAssistantMessage] = useState(''); // Keep for history/logic
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);
  const [currentMessageDuration, setCurrentMessageDuration] = useState(0);
  const [currentChunkDuration, setCurrentChunkDuration] = useState<number | undefined>(undefined); // Audio chunk duration for text sync
  const [turnCount, setTurnCount] = useState(0);
  const [isDebugOpen, setIsDebugOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [language, setLanguageState] = useState<string>('auto');
  const hasPlayedWelcome = useRef(false);

  // Audio Context Ref for Safari Autoplay Workaround
  // We need to create/resume this during a user gesture (handleStartSession)
  const audioContextRef = useRef<AudioContext | null>(null);

  // Access control (Keep for now as basic auth)
  const access = useSessionAccess();

  // Watch for unlock and reset status if limit was reached
  useEffect(() => {
    if (access.state.isUnlocked && status === 'limit-reached') {
      setStatus('idle');
    }
  }, [access.state.isUnlocked, status]);

  // Realtime Session Logic
  /* eslint-disable react-hooks/refs */
  useRealtimeSession({
    status,
    sessionId,
    language,
    setVoiceState,
    setTranscript,
    setCurrentAssistantMessage,
    setCurrentMessageDuration,
    setCurrentChunkDuration,
    setActiveText,
    setActiveTextSource,
    onLimitReached: () => {
      setStatus('limit-reached');
      // Play rate limit guidance
      audioPlayer.playFromUrl('/api/tts/preloaded/limit_reached', {
        onStart: (text, duration) => {
          if (text) {
            setActiveText(text);
            setActiveTextSource('system');
            if (duration) setCurrentMessageDuration(duration);
          }
        },
      });
    },
    providedAudioContext: audioContextRef.current,
    onPermissionError: (error) => {
      logger.error('APP', 'Permission Error detected', error);
      setPermissionStatus('denied');
      setStatus('idle'); // Reset checking
    },
  });
  /* eslint-enable react-hooks/refs */

  // Play welcome message on first connection
  // Note: Backend sends welcome message automatically via WebSocket.
  // We don't need to fetch it here to avoid double playback.
  useEffect(() => {
    if (status === 'connected' && !hasPlayedWelcome.current) {
      hasPlayedWelcome.current = true;
      // Backend handles welcome message
    }
  }, [status]);

  // Debug state persistence
  useEffect(() => {
    const storedDebug = localStorage.getItem('aether_debug') === 'true';
    setIsDebugOpen(storedDebug);
    logger.toggleDebug(storedDebug);

    // Load language preference from storage
    const storedLanguage = localStorage.getItem('aether_language');
    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }

    // Load conversation from storage
    const storedConversation = loadConversation();
    if (storedConversation) {
      setMessageHistory(storedConversation);
    }

    // Cleanup AudioContext on unmount
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  // Save conversation to storage
  useEffect(() => {
    if (messageHistory.length > 0) {
      saveConversation(messageHistory);
    }
  }, [messageHistory]);

  const handleStartSession = useCallback(async () => {
    logger.info('APP', 'Starting session');
    setPermissionStatus('idle'); // Reset permission state assuming optimistic start

    // ---------------------------------------------------------
    // SAFARI COMPATIBILITY FIX: Prime Mic & AudioContext
    // ---------------------------------------------------------
    // We must trigger these during the user gesture (click), BEFORE the async session start.
    try {
      // 1. Prime Permission: Request mic access to trigger prompt immediately
      // (If we wait for the async session fetch, Safari will block the delayed mic request)
      // This must be the VERY FIRST thing we do.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop()); // Release immediately, we just wanted permission

      // If we got here, permission is granted (or was already granted)
      setPermissionStatus('granted');

      // 2. Resume Global Audio Player Context (Output)
      // Now that mic is blessed, we can resume the output context.
      await audioPlayer.resume();

      // 3. Resume/Create Local Audio Context (Input Processing)
      // Ensure we have a resumed context ready to pass to useRealtimeSession
      if (!audioContextRef.current) {
        try {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext!)({
            sampleRate: 16000,
          });
        } catch {
          audioContextRef.current = new (window.AudioContext || window.webkitAudioContext!)();
        }
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      logger.info('APP', 'Microphone & AudioContext primed successfully');
    } catch (e: unknown) {
      const error = e as Error & { name?: string };
      // Handle blocked permission gracefully
      if (
        error.name === 'NotAllowedError' ||
        error.name === 'PermissionDeniedError' ||
        error.message?.includes('not allowed')
      ) {
        logger.warn('APP', 'Microphone permission denied by user');
        setPermissionStatus('denied');
        return; // Abort session start
      }

      // Handle other errors (e.g. OverconstrainedError)
      logger.error('APP', 'Failed to prime microphone or audio context (Non-Permission Error)', e);
      // We continue anyway, as it might just be a specific constraint failure that the main logic can handle differently
    }
    // ---------------------------------------------------------

    logger.logConversation(ConversationEvents.SESSION_STARTED);
    setStatus('connecting');

    try {
      // Include access code if available
      const headers: Record<string, string> = {};
      if (access.state.isUnlocked && access.state.accessCode) {
        headers['X-Access-Code'] = access.state.accessCode;
      }

      const response = await ApiClient.post(
        '/session',
        {
          timestamp: Date.now(),
          client: 'web-ui',
          language: language,
        },
        headers
      );

      if (response.status === 503) {
        setStatus('offline');
        return;
      }

      if (response.status === 429) {
        setStatus('limit-reached');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setStatus('connected');
        setSessionId(data.sessionId);
        logger.logConversation(ConversationEvents.SESSION_CONNECTED, data.sessionId);
      } else {
        // Log the error and update status without throwing
        logger.error('APP', 'Failed to start session', await response.text());
        setStatus('error');
      }
    } catch (e) {
      logger.error('APP', 'Failed to start session', e);
      setStatus('error');
    }
  }, [access.state, language]);

  const toggleListening = useCallback(async () => {
    if (status !== 'connected') return;

    // Manual override: If speaking or processing, stop.
    if (voiceState === 'speaking' || voiceState === 'processing') {
      setVoiceState('idle');
      return;
    }

    // Start listening
    if (voiceState === 'idle') {
      setVoiceState('listening');
      setTranscript('');
    } else {
      // If listening, stop -> processing
      setVoiceState('processing');
    }
  }, [status, voiceState]);

  const toggleDebug = useCallback(() => {
    setIsDebugOpen((prev) => {
      const newState = !prev;
      localStorage.setItem('aether_debug', String(newState));
      logger.toggleDebug(newState);
      return newState;
    });
  }, []);

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('aether_language', lang);
    logger.info('APP', `Language preference set to: ${lang}`);
  }, []);

  return {
    state: {
      status,
      voiceState,
      activeText,
      activeTextSource,
      transcript,
      permissionStatus, // Real permission state
      currentAssistantMessage,
      currentMessageDuration,
      currentChunkDuration,
      turnCount,
      tokenUsage: { totalTokens: 0 },
      isDebugOpen,
      isMobileFlow: false,
      // Access control state for Gear Menu
      accessState: access.state,
      // Language preference
      language,
    },
    actions: {
      handleStartSession,
      toggleListening,
      toggleDebug,
      verifyAccessCode: access.actions.verifyAccessCode,
      setLanguage,
    },
  };
}
