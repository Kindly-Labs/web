import { useMemo } from 'react';
import { SessionStatus, VoiceState, TextSource } from '../Session.logic';
import { PermissionStatus } from '@/shared/utils/voice/permissions';
import { translate } from '@/shared/i18n/use-translation';

export type EmotionalTone = 'calm' | 'warm' | 'contemplative' | 'engaged';
export type UIVoiceState = 'idle' | 'listening' | 'speaking' | 'processing' | 'error';

interface UseAetherVisualsProps {
  sessionStatus: SessionStatus;
  voiceState: VoiceState;
  permissionStatus: PermissionStatus;
  activeText: string;
  activeTextSource: TextSource;
  currentMessageDuration?: number;
  currentChunkDuration?: number;
  isOnline?: boolean;
  language?: string;
}

export function useAetherVisuals({
  sessionStatus,
  voiceState,
  permissionStatus,
  activeText,
  activeTextSource,
  currentMessageDuration,
  currentChunkDuration,
  isOnline = true,
  language = 'en-US',
}: UseAetherVisualsProps) {
  // Helper to translate status keys
  const t = (key: string) => translate(key, language);

  // 1. Map actual voiceState to UI state
  const uiVoiceState: UIVoiceState = useMemo(() => {
    if (sessionStatus === 'initializing' || sessionStatus === 'connecting') return 'processing';
    if (sessionStatus === 'offline') return 'error';
    return voiceState as UIVoiceState;
  }, [sessionStatus, voiceState]);

  // 2. Derive emotional tone
  const emotionalTone: EmotionalTone = useMemo(() => {
    switch (voiceState) {
      case 'idle':
        return 'calm';
      case 'listening':
        return 'engaged';
      case 'processing':
        return 'contemplative';
      case 'speaking':
        return 'warm';
      default:
        return 'calm';
    }
  }, [voiceState]);

  // 3. Breathing animation intensity
  const breatheIntensity = useMemo(() => {
    const intensity: Record<string, number> = {
      idle: 1,
      listening: 1.3,
      speaking: 1.5,
      processing: 1.1,
      muted: 1,
      'permission-denied': 1,
    };
    return intensity[voiceState] || 1;
  }, [voiceState]);

  // 4. Visual Status Text Logic
  const visualStatus = useMemo(() => {
    // A. Critical Errors/States
    if (!isOnline) {
      return { text: t('status.noConnection'), subtext: t('status.noConnectionSubtext') };
    }
    if (sessionStatus === 'insecure-context') {
      return {
        text: t('status.connectionNotSecure'),
        subtext: t('status.connectionNotSecureSubtext'),
      };
    }
    if (sessionStatus === 'unsupported') {
      return {
        text: t('status.browserNotSupported'),
        subtext: t('status.browserNotSupportedSubtext'),
      };
    }
    if (sessionStatus === 'error') {
      return { text: t('status.connectionError'), subtext: t('status.connectionErrorSubtext') };
    }
    if (sessionStatus === 'offline') {
      return { text: t('status.serviceOffline'), subtext: t('status.serviceOfflineSubtext') };
    }
    if (permissionStatus === 'denied') {
      return { text: t('status.microphoneDenied'), subtext: t('status.microphoneDeniedSubtext') };
    }

    // B. Initialization
    if (sessionStatus === 'initializing' || sessionStatus === 'connecting') {
      return {
        text: t('status.connecting'),
        subtext: t('status.connectingSubtext'),
      };
    }

    if (permissionStatus === 'pending') {
      return { text: t('status.requestingAccess'), subtext: t('status.requestingAccessSubtext') };
    }

    if (sessionStatus === 'limit-reached') {
      return { text: t('status.sessionLimit'), subtext: t('status.sessionLimitSubtext') };
    }

    if (sessionStatus === 'idle') {
      return {
        text: t('status.tapToBegin'),
        subtext: t('status.sessionReady'),
      };
    }

    // C. Dynamic Conversation States
    const messages: Record<string, { text: string; subtext: string }> = {
      idle: { text: t('status.readyToListen'), subtext: t('status.tapToStart') },
      listening: { text: t('status.listening'), subtext: t('status.listeningSubtext') },
      processing: { text: t('status.thinking'), subtext: t('status.thinkingSubtext') },
      speaking: { text: '', subtext: '' },
      muted: { text: t('status.paused'), subtext: t('status.pausedSubtext') },
      error: { text: t('status.connectionIssue'), subtext: t('status.tapToRetry') },
    };

    // 1. If we have active text, show it (Unified Display)
    if (activeText) {
      let subtext = t('status.aether');
      let speed = 30; // Default speed
      let audioDuration = undefined;

      if (activeTextSource === 'user') {
        subtext = uiVoiceState === 'processing' ? t('status.thinking') : t('status.listening');
        speed = 15; // Fast typing for live transcription
      } else if (activeTextSource === 'system') {
        subtext = t('status.system');
      } else if (activeTextSource === 'ai') {
        // For AI text, pass audio duration to enable dynamic sync
        audioDuration = currentChunkDuration;
      }

      return {
        text: activeText,
        subtext,
        speed,
        audioDuration,
      };
    }

    // 2. Fallback to State Messages
    return messages[uiVoiceState] || messages.idle;
  }, [
    sessionStatus,
    permissionStatus,
    uiVoiceState,
    activeTextSource,
    activeText, // Included for robustness
    currentChunkDuration,
    isOnline,
    language,
  ]);

  return {
    uiVoiceState,
    emotionalTone,
    breatheIntensity,
    visualStatus,
  };
}
