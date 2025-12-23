export type Locale = 'en' | 'zh';

/**
 * Maps the user's language selection to a UI locale.
 * Chinese languages (Toishanese, Cantonese, Mandarin) all use Simplified Chinese UI.
 */
export function getLocaleFromLanguage(language: string): Locale {
  if (['toi-HK', 'yue-HK', 'cmn-CN'].includes(language)) {
    return 'zh';
  }
  return 'en';
}

/**
 * Get nested value from translation object using dot notation.
 * e.g., getNestedValue(obj, 'footer.settings') returns obj.footer.settings
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Return the key itself as fallback
    }
  }

  return typeof current === 'string' ? current : path;
}
