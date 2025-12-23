/**
 * Unified log parser for all services
 * Supports the unified JSON schema: { ts, level, service, category, msg }
 */

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type LogCategory = 'http' | 'lifecycle' | 'business' | 'system' | 'raw';

export interface ParsedLog {
  level: LogLevel;
  message: string;
  category: LogCategory;
  service?: string;
  raw: string;
}

// Log presets for smart filtering
export interface LogPreset {
  id: string;
  name: string;
  levels: LogLevel[];
  categories: LogCategory[];
  description: string;
}

export const LOG_PRESETS: LogPreset[] = [
  {
    id: 'smart',
    name: 'Smart',
    levels: ['info', 'warn', 'error'],
    categories: ['business', 'lifecycle'],
    description: 'Balanced view - business events and lifecycle',
  },
  {
    id: 'errors',
    name: 'Errors Only',
    levels: ['error'],
    categories: ['http', 'lifecycle', 'business', 'system', 'raw'],
    description: 'Just the problems',
  },
  {
    id: 'http',
    name: 'HTTP Traffic',
    levels: ['info', 'warn', 'error'],
    categories: ['http'],
    description: 'All API requests',
  },
  {
    id: 'business',
    name: 'Business Events',
    levels: ['info', 'warn', 'error'],
    categories: ['business'],
    description: 'User/session activity',
  },
  {
    id: 'debug',
    name: 'Debug (All)',
    levels: ['debug', 'info', 'warn', 'error'],
    categories: ['http', 'lifecycle', 'business', 'system', 'raw'],
    description: 'Everything (noisy)',
  },
];

/**
 * Normalize various level formats to standard levels
 */
function normalizeLevel(level: string | undefined): LogLevel {
  if (!level) return 'info';
  const l = level.toLowerCase();
  if (l === 'error' || l === 'fatal' || l === 'panic') return 'error';
  if (l === 'warn' || l === 'warning') return 'warn';
  if (l === 'debug' || l === 'trace') return 'debug';
  return 'info';
}

/**
 * Detect category from log content
 */
function detectCategory(msg: string, data?: Record<string, unknown>): ParsedLog['category'] {
  // HTTP requests
  if (
    data?.method ||
    data?.status ||
    data?.path ||
    msg.includes('HTTP') ||
    msg.includes('request')
  ) {
    return 'http';
  }
  // Lifecycle events
  if (
    msg.includes('start') ||
    msg.includes('stop') ||
    msg.includes('init') ||
    msg.includes('shutdown') ||
    msg.includes('loaded') ||
    msg.includes('ready')
  ) {
    return 'lifecycle';
  }
  // Business logic
  if (
    msg.includes('session') ||
    msg.includes('user') ||
    msg.includes('consent') ||
    msg.includes('audio') ||
    msg.includes('message')
  ) {
    return 'business';
  }
  return 'system';
}

/**
 * Parse JSON log - handles unified schema and legacy formats
 */
function parseJsonLog(text: string): ParsedLog | null {
  try {
    const data = JSON.parse(text);

    // Unified schema: { ts, level, service, category, msg }
    if (data.service && data.category && data.msg !== undefined) {
      const msg = data.msg || '';

      // Format HTTP requests nicely
      if (
        data.category === 'http' &&
        (msg === 'HTTP Request' || msg === 'request' || data.method)
      ) {
        const method = data.method || '';
        const path = data.path || data.uri || '';
        const status = data.status || 0;
        const duration = data.duration_ms || data.latency || '';
        return {
          level: status >= 400 ? 'error' : status >= 300 ? 'warn' : normalizeLevel(data.level),
          message: `${method} ${path} ${status}${duration ? ` (${duration}ms)` : ''}`,
          category: 'http',
          service: data.service,
          raw: text,
        };
      }

      return {
        level: normalizeLevel(data.level),
        message: msg,
        category: data.category as LogCategory,
        service: data.service,
        raw: text,
      };
    }

    // Handle legacy Loguru nested JSON format (TTS fallback)
    if (data.record) {
      const msg = data.record.message || '';
      return {
        level: normalizeLevel(data.record.level?.name),
        message: msg,
        category: detectCategory(msg, data.record.extra),
        raw: text,
      };
    }

    // Legacy format without unified fields
    const level = data.level || data.Level || 'info';
    const msg = data.msg || data.message || data.MESSAGE || '';

    // Format HTTP requests nicely
    if (msg === 'HTTP Request' || msg === 'request') {
      const method = data.method || '';
      const path = data.path || data.uri || '';
      const status = data.status || 0;
      const duration = data.duration_ms || data.latency || '';
      return {
        level: status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info',
        message: `${method} ${path} ${status}${duration ? ` (${duration}ms)` : ''}`,
        category: 'http',
        raw: text,
      };
    }

    return {
      level: normalizeLevel(level),
      message: msg,
      category: detectCategory(msg, data),
      raw: text,
    };
  } catch {
    return null;
  }
}

/**
 * Parse structured text log (level=INFO msg="...")
 */
function parseStructuredTextLog(text: string): ParsedLog | null {
  if (!text.includes('level=') || !text.includes('msg=')) {
    return null;
  }

  const levelMatch = text.match(/level=(\w+)/);
  const msgMatch = text.match(/msg="([^"]*)"/) || text.match(/msg=(\S+)/);

  if (!msgMatch) return null;

  const level = normalizeLevel(levelMatch?.[1]);
  const msg = msgMatch[1];

  return {
    level,
    message: msg,
    category: detectCategory(msg),
    raw: text,
  };
}

/**
 * Main parser - tries JSON first, then structured text, then raw
 */
export function parseLog(text: string): ParsedLog {
  const trimmed = text.trim();

  // Try JSON first (should be most logs after standardization)
  if (trimmed.startsWith('{')) {
    const jsonLog = parseJsonLog(trimmed);
    if (jsonLog) return jsonLog;
  }

  // Try structured text (level=INFO msg="...")
  const structuredLog = parseStructuredTextLog(trimmed);
  if (structuredLog) return structuredLog;

  // Fallback: raw text with basic level detection
  return {
    level: 'info',
    message: trimmed.slice(0, 500), // Truncate very long lines
    category: 'raw',
    raw: text,
  };
}

/**
 * Strip ANSI color codes from text
 */
export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

/**
 * Essential noise patterns - only truly useless logs
 * Keep this list minimal (~10 patterns)
 */
const NOISE_PATTERNS = [
  // ASCII art / banners
  /^[─│┌┐└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬\s_\/\\|]+$/,
  /^\s*[>\/\\|_]+\s*$/,
  // Empty or whitespace-only
  /^\s*$/,
  // Next.js dev noise
  /^○\s+Compiling/,
  /environments:\s*\.env/,
  // Python warnings (not errors)
  /UserWarning:|DeprecationWarning:/,
  // Health check spam (successful ones only)
  /^GET \/health.*200/,
  /^GET \/ 200/,
];

/**
 * Check if log is pure noise (should be filtered out)
 */
export function isNoise(text: string): boolean {
  return NOISE_PATTERNS.some((pattern) => pattern.test(text));
}

/**
 * Simple hash for deduplication
 */
export function hashLog(service: string, message: string): string {
  const key = `${service}:${message}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash = hash & hash;
  }
  return hash.toString(36);
}
