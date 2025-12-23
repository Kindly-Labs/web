// Cockpit dashboard type definitions

export interface CockpitMetrics {
  timestamp: string;
  health: CockpitHealth;
  pipeline: PipelineHealth;
  system: CockpitSystem;
  sessions: CockpitSessions;
  users: UserAnalytics;
  aiPerformance: CockpitAI;
  tools: CockpitTools;
  turns: TurnMetrics;
  rateLimits: CockpitRateLimits;
  // Optional: Review queue for audio uploads
  reviewQueue?: ReviewQueue;
  // Optional: User growth metrics (legacy)
  userGrowth?: UserGrowth;
}

export interface CockpitHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  dependencies: Record<string, DependencyHealth>;
}

export interface DependencyHealth {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  latencyMs: number;
  message?: string;
}

export interface CockpitSystem {
  uptimeSeconds: number;
  memoryAllocMB: number;
  memorySysMB: number;
  numGC: number;
  goVersion: string;
  environment: string;
  ttsProvider: string;
  sttProvider: string;
}

export interface CockpitSessions {
  active: number;
  todayTotal: number;
  recentSessions: SessionBrief[];
}

export interface SessionBrief {
  id: string;
  startTime: string;
  messageCount: number;
  language?: string;
  status: string;
}

export interface CockpitAI {
  avgLatencyMs: number;
  p95LatencyMs: number;
  avgTTFAMs: number;
  p95TTFAMs: number;
  requestsPerMin: number;
  errorRate: number;
  tokensInput: number;
  tokensOutput: number;
  estimatedCostUSD: number;
  // New: Tool call monitoring
  toolCalls?: ToolCallMetrics;
  // New: Pipeline health
  pipeline?: PipelineHealth;
}

// Tool statistics - per-tool metrics from backend
export interface ToolStat {
  name: string;
  callCount: number;
  successCount: number;
  errorCount: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  lastCalled: number; // Unix timestamp in ms
}

// Aggregated tool metrics for cockpit
export interface CockpitTools {
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  topTools: ToolStat[];
}

// Stage health within pipeline
export interface StageHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  avgLatencyMs: number;
  p95LatencyMs: number;
  errorRate: number;
  callCount: number;
}

// Pipeline health - tracks AI processing stages
export interface PipelineHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  score: number; // 0.0-1.0
  stages: Record<string, StageHealth>; // "stt", "llm", "tts", "tool", "language_detect"
  lastFullSuccess: string;
  successRate1h: number;
  avgE2ELatencyMs: number;
  p95E2ELatencyMs: number;
}

// User summary for top users list
export interface UserSummary {
  email?: string;
  clientId: string;
  sessionCount: number;
  totalTimeSeconds: number;
  avgSessionTimeSec: number;
  turnCount: number;
  lastActive: string;
}

// User analytics
export interface UserAnalytics {
  totalUsers: number;
  activeToday: number;
  activeThisWeek: number;
  avgSessionTimeSec: number;
  p50SessionTimeSec: number;
  p95SessionTimeSec: number;
  totalTurns: number;
  avgTurnsPerSession: number;
  topUsers: UserSummary[];
}

// Turn/task metrics
export interface TurnMetrics {
  totalTurns: number;
  avgTurnTimeMs: number;
  p50TurnTimeMs: number;
  p95TurnTimeMs: number;
  turnsWithTools: number;
  toolCallRate: number; // 0.0-1.0
}

// Legacy: User growth tracking with delta comparison
export interface UserGrowth {
  newUsersToday: number;
  newUsersYesterday: number;
  newUsersDelta: number; // percentage change
  newSessionsToday: number;
  newSessionsYesterday: number;
  newSessionsDelta: number; // percentage change
}

// Legacy: Tool call monitoring (kept for backward compatibility)
export interface ToolCallMetrics {
  total: number;
  byTool: Record<string, ToolUsage>;
}

export interface ToolUsage {
  count: number;
  avgLatencyMs: number;
  errorCount: number;
  lastUsed?: string;
}

// Review queue for audio uploads
export interface ReviewQueue {
  pending: number;
  verified: number;
  flagged: number;
  items: ReviewItem[];
}

export interface ReviewItem {
  id: string;
  sessionId: string;
  uploadedAt: string;
  durationMs: number;
  fileSize: number;
  // AI-generated labels
  aiLabels: AILabel[];
  // Admin review status
  status: 'pending' | 'verified' | 'flagged';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AILabel {
  type: 'language' | 'dialect' | 'quality' | 'content' | 'speaker';
  value: string;
  confidence: number; // 0-1
}

export interface CockpitRateLimits {
  exceededToday: number;
  activeUsers: number;
}

// Live pipeline stage health check result
export interface PipelineStageHealthCheck {
  timestamp: string;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  stages: Record<string, StageHealthProbe>;
}

// Single stage health probe result
export interface StageHealthProbe {
  status: 'online' | 'degraded' | 'offline' | 'unknown';
  latencyMs: number;
  message?: string;
  lastChecked: string;
  endpoint?: string;
}

// UI state types
export interface CockpitState {
  metrics: CockpitMetrics | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
