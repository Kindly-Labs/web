import type {
  CockpitSessions,
  SessionBrief,
  ReviewQueue,
  ReviewItem,
  AILabel,
  CockpitAI,
  ToolCallMetrics,
  ToolUsage,
  PipelineHealth,
  StageHealth,
  UserGrowth,
} from '@/lib/cockpit-types';
import type { LogLevel, LogCategory } from '@/lib/log-parser';

// ============ UTILITIES ============

/** Generate random string of specified length */
const randomString = (length = 8): string =>
  Math.random()
    .toString(36)
    .substring(2, 2 + length);

/** Generate random integer between min and max (inclusive) */
const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Random element from array */
const randomPick = <T>(arr: readonly T[]): T => arr[randomInt(0, arr.length - 1)];

// ============ SESSION MOCKS ============

export function createMockSession(): SessionBrief {
  // Generate ID with unique prefix (first 8 chars are unique for truncation display)
  const id = `${randomString(8)}-${randomString(12)}`;
  return {
    id,
    startTime: new Date(Date.now() - randomInt(0, 86400000)).toISOString(),
    messageCount: randomInt(1, 50),
    language: randomPick(['toi', 'eng', 'cmn', undefined] as const),
    status: randomPick(['active', 'inactive'] as const),
  };
}

export function createMockSessions(count = 3): CockpitSessions {
  return {
    active: randomInt(0, 10),
    todayTotal: randomInt(10, 100),
    recentSessions: Array.from({ length: count }, createMockSession),
  };
}

// ============ REVIEW QUEUE MOCKS ============

export function createMockAILabel(): AILabel {
  return {
    type: randomPick(['language', 'dialect', 'quality', 'content', 'speaker'] as const),
    value: randomString(6),
    confidence: Math.random(),
  };
}

export function createMockReviewItem(
  status: 'pending' | 'verified' | 'flagged' = 'pending'
): ReviewItem {
  return {
    id: `review-${randomString(12)}`,
    sessionId: `session-${randomString(8)}`,
    uploadedAt: new Date(Date.now() - randomInt(0, 86400000)).toISOString(),
    durationMs: randomInt(1000, 60000),
    fileSize: randomInt(1024, 1024 * 1024 * 5),
    aiLabels: Array.from({ length: randomInt(1, 4) }, createMockAILabel),
    status,
    reviewedBy: status !== 'pending' ? `user-${randomString(4)}` : undefined,
    reviewedAt: status !== 'pending' ? new Date().toISOString() : undefined,
  };
}

export function createMockReviewQueue(
  pendingCount = 3,
  verifiedCount = 2,
  flaggedCount = 1
): ReviewQueue {
  const pendingItems = Array.from({ length: pendingCount }, () => createMockReviewItem('pending'));
  const verifiedItems = Array.from({ length: verifiedCount }, () =>
    createMockReviewItem('verified')
  );
  const flaggedItems = Array.from({ length: flaggedCount }, () => createMockReviewItem('flagged'));

  return {
    pending: pendingCount,
    verified: verifiedCount,
    flagged: flaggedCount,
    items: [...pendingItems, ...verifiedItems, ...flaggedItems],
  };
}

// ============ AI PERFORMANCE MOCKS ============

export function createMockToolUsage(): ToolUsage {
  return {
    count: randomInt(1, 1000),
    avgLatencyMs: randomInt(50, 2000),
    errorCount: randomInt(0, 10),
    lastUsed: new Date().toISOString(),
  };
}

export function createMockToolCallMetrics(): ToolCallMetrics {
  return {
    total: randomInt(100, 5000),
    byTool: {
      muni: createMockToolUsage(),
      translate: createMockToolUsage(),
      search: createMockToolUsage(),
    },
  };
}

export function createMockStageHealth(): StageHealth {
  return {
    status: randomPick(['healthy', 'degraded', 'unhealthy'] as const),
    avgLatencyMs: randomInt(10, 500),
    p95LatencyMs: randomInt(100, 1000),
    errorRate: Math.random() * 0.1,
    callCount: randomInt(1, 1000),
  };
}

export function createMockPipelineHealth(): PipelineHealth {
  return {
    overall: randomPick(['healthy', 'degraded', 'unhealthy', 'unknown'] as const),
    score: Math.random(),
    stages: {
      stt: createMockStageHealth(),
      language_detect: createMockStageHealth(),
      llm: createMockStageHealth(),
      tool: createMockStageHealth(),
      tts: createMockStageHealth(),
    },
    lastFullSuccess: new Date().toISOString(),
    successRate1h: 0.9 + Math.random() * 0.1,
    avgE2ELatencyMs: randomInt(500, 3000),
    p95E2ELatencyMs: randomInt(1000, 5000),
  };
}

export function createMockCockpitAI(): CockpitAI {
  return {
    avgLatencyMs: randomInt(100, 1000),
    p95LatencyMs: randomInt(500, 3000),
    avgTTFAMs: randomInt(50, 500),
    p95TTFAMs: randomInt(200, 1000),
    requestsPerMin: randomInt(1, 100),
    errorRate: Math.random() * 0.1,
    tokensInput: randomInt(1000, 1000000),
    tokensOutput: randomInt(1000, 500000),
    estimatedCostUSD: Math.random() * 10,
    toolCalls: createMockToolCallMetrics(),
    pipeline: createMockPipelineHealth(),
  };
}

export function createMockUserGrowth(): UserGrowth {
  const newUsersToday = randomInt(10, 100);
  const newUsersYesterday = randomInt(5, 80);
  const newSessionsToday = randomInt(50, 500);
  const newSessionsYesterday = randomInt(30, 400);

  return {
    newUsersToday,
    newUsersYesterday,
    newUsersDelta:
      newUsersYesterday > 0 ? ((newUsersToday - newUsersYesterday) / newUsersYesterday) * 100 : 0,
    newSessionsToday,
    newSessionsYesterday,
    newSessionsDelta:
      newSessionsYesterday > 0
        ? ((newSessionsToday - newSessionsYesterday) / newSessionsYesterday) * 100
        : 0,
  };
}

// ============ LOG ENTRY MOCKS ============

export interface MockLogEntry {
  timestamp: Date;
  service: string;
  level: LogLevel;
  message: string;
  category: LogCategory;
  raw: string;
}

export function createMockLogEntry(): MockLogEntry {
  return {
    timestamp: new Date(),
    service: randomPick(['backend', 'frontend', 'mlx', 'tts'] as const),
    level: randomPick(['error', 'warn', 'info', 'debug'] as const),
    message: `Log message ${randomString(20)}`,
    category: randomPick(['http', 'lifecycle', 'business', 'system', 'raw'] as const),
    raw: `Raw log line ${randomString(30)}`,
  };
}

export function createMockLogEntries(count = 10): MockLogEntry[] {
  return Array.from({ length: count }, createMockLogEntry);
}

// ============ PRODUCTION CONTROL PLANE MOCKS ============

export interface MockProductionAuth {
  token: string;
  email: string;
  expiresAt: number;
}

export function createMockProductionAuth(): MockProductionAuth {
  return {
    token: `eyJ${randomString(20)}.${randomString(30)}.${randomString(20)}`,
    email: `admin-${randomString(4)}@kindly-labs.org`,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
  };
}

export interface MockSiteHealth {
  status: 'online' | 'degraded' | 'offline';
  latencyMs: number;
  statusCode?: number;
}

export function createMockSiteHealth(status?: 'online' | 'degraded' | 'offline'): MockSiteHealth {
  const actualStatus = status ?? randomPick(['online', 'degraded', 'offline'] as const);
  return {
    status: actualStatus,
    latencyMs: actualStatus === 'offline' ? 0 : randomInt(50, 2500),
    statusCode: actualStatus === 'offline' ? undefined : 200,
  };
}

export interface MockProductionSession {
  id: string;
  startTime: string;
  messageCount: number;
  language?: string;
  status: 'active' | 'ended';
  clientId?: string;
}

export function createMockProductionSession(
  status?: 'active' | 'ended'
): MockProductionSession {
  const id = `${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`;
  return {
    id,
    startTime: new Date(Date.now() - randomInt(0, 3600000)).toISOString(),
    messageCount: randomInt(1, 50),
    language: randomPick(['toi-HK', 'yue-HK', 'en-US', undefined] as const),
    status: status ?? randomPick(['active', 'ended'] as const),
    clientId: `client-${randomString(8)}`,
  };
}

export function createMockProductionSessions(activeCount = 3, endedCount = 2): MockProductionSession[] {
  const active = Array.from({ length: activeCount }, () => createMockProductionSession('active'));
  const ended = Array.from({ length: endedCount }, () => createMockProductionSession('ended'));
  return [...active, ...ended];
}

// ============ ASSERTION HELPERS ============

/** Assert that a value is a non-empty, non-placeholder string */
export function assertNonEmptyString(value: unknown, fieldName: string): void {
  expect(value).toBeDefined();
  expect(typeof value).toBe('string');
  expect((value as string).length).toBeGreaterThan(0);
  expect(value).not.toBe('--');
  expect(value).not.toBe('N/A');
  expect(value).not.toBe('');
}

/** Assert that a value is a truthy number (not NaN, not undefined) */
export function assertTruthyNumber(value: unknown, fieldName: string): void {
  expect(value).toBeDefined();
  const numVal = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  expect(typeof numVal).toBe('number');
  expect(isNaN(numVal as number)).toBe(false);
}
