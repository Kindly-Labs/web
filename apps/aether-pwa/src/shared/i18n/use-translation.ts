'use client';

import { useSession } from '@/scenes/Session/Session.context';
import { getLocaleFromLanguage, getNestedValue, Locale } from './index';
import en from './locales/en.json';
import zh from './locales/zh.json';

const translations: Record<Locale, typeof en> = { en, zh };

/**
 * Hook for accessing translated strings based on the user's language preference.
 *
 * Usage:
 * ```tsx
 * const { t } = useTranslation();
 * return <p>{t('footer.settings')}</p>;
 * ```
 */
export function useTranslation() {
  const { state } = useSession();
  const locale = getLocaleFromLanguage(state.language);

  /**
   * Get a translated string by key using dot notation.
   * Falls back to English if key is missing, then to the key itself.
   */
  const t = (key: string): string => {
    const value = getNestedValue(translations[locale], key);
    if (value !== key) return value;

    // Fallback to English
    const fallback = getNestedValue(translations.en, key);
    return fallback;
  };

  return { t, locale };
}

/**
 * Standalone translation function for use outside of React components.
 * Requires the language code to be passed explicitly.
 */
export function translate(key: string, language: string): string {
  const locale = getLocaleFromLanguage(language);
  const value = getNestedValue(translations[locale], key);
  if (value !== key) return value;

  // Fallback to English
  return getNestedValue(translations.en, key);
}
