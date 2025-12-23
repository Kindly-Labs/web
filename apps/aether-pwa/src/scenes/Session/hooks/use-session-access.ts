import { useState, useEffect } from 'react';
import { logger } from '@/shared/lib/logger';
import { ApiClient } from '@/shared/lib/api-client';

export interface SessionAccessState {
  isUnlocked: boolean;
  accessCode: string;
  isReady: boolean;
}

export interface SessionAccessActions {
  verifyAccessCode: (code: string) => Promise<boolean>;
}

// Helper functions for cookies
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Strict`;
}

export function useSessionAccess() {
  const [isReady, setIsReady] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [accessCode, setAccessCode] = useState<string>('');

  // Load access code from cookie after mount
  useEffect(() => {
    try {
      const storedCode = getCookie('aether_access_code');
      if (storedCode) {
        setAccessCode(storedCode);
        setIsUnlocked(true);
      }
    } catch (e) {
      logger.error('SESSION', 'Failed to read access code from cookie', e);
    } finally {
      setIsReady(true);
    }
  }, []);

  const verifyAccessCode = async (code: string): Promise<boolean> => {
    try {
      const cleanCode = code.trim();
      const response = await ApiClient.post('/access/validate', { code: cleanCode });
      if (response.ok) {
        const data = await response.json();
        if (data.valid) {
          setIsUnlocked(true);
          setAccessCode(cleanCode);
          setCookie('aether_access_code', cleanCode, 30);
          logger.info('SESSION', 'Access code verified successfully');
          return true;
        }
      }
      return false;
    } catch (error) {
      logger.error('SESSION', 'Failed to verify access code', error);
      return false;
    }
  };

  return {
    state: {
      isUnlocked,
      accessCode,
      isReady,
    },
    actions: {
      verifyAccessCode,
    },
  };
}
