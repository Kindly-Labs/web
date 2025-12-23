/**
 * API Schema Validation Tests
 *
 * Verifies that API responses match expected TypeScript types
 * using runtime type guards.
 */

import type { CockpitMetrics, PipelineHealth, CockpitAI } from '@/lib/cockpit-types';
import type { ServiceStatus } from '@/lib/types';

// Type guard for ServiceStatus
function isValidServiceStatus(data: unknown): data is ServiceStatus {
  if (!data || typeof data !== 'object') return false;
  const status = data as Record<string, unknown>;

  return (
    typeof status.name === 'string' &&
    typeof status.running === 'boolean' &&
    (status.pid === undefined || typeof status.pid === 'number') &&
    (status.startTime === undefined || typeof status.startTime === 'string') &&
    (status.url === undefined || typeof status.url === 'string') &&
    (status._detectionMethod === undefined ||
      ['port', 'pid', 'memory', 'none'].includes(status._detectionMethod as string))
  );
}

// Type guard for PipelineHealth
function isValidPipelineHealth(data: unknown): data is PipelineHealth {
  if (!data || typeof data !== 'object') return false;
  const pipeline = data as Record<string, unknown>;

  return (
    ['healthy', 'degraded', 'unhealthy', 'unknown'].includes(pipeline.overall as string) &&
    typeof pipeline.score === 'number' &&
    pipeline.stages !== undefined &&
    typeof pipeline.stages === 'object' &&
    typeof pipeline.successRate1h === 'number' &&
    typeof pipeline.avgE2ELatencyMs === 'number' &&
    typeof pipeline.p95E2ELatencyMs === 'number'
  );
}

// Type guard for CockpitAI
function isValidCockpitAI(data: unknown): data is CockpitAI {
  if (!data || typeof data !== 'object') return false;
  const ai = data as Record<string, unknown>;

  return (
    typeof ai.avgLatencyMs === 'number' &&
    typeof ai.p95LatencyMs === 'number' &&
    typeof ai.avgTTFAMs === 'number' &&
    typeof ai.p95TTFAMs === 'number' &&
    typeof ai.requestsPerMin === 'number' &&
    typeof ai.errorRate === 'number' &&
    typeof ai.tokensInput === 'number' &&
    typeof ai.tokensOutput === 'number' &&
    typeof ai.estimatedCostUSD === 'number'
  );
}

// Partial type guard for CockpitMetrics (checks key required fields)
function hasRequiredMetricsFields(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;
  const metrics = data as Record<string, unknown>;

  return (
    typeof metrics.timestamp === 'string' &&
    metrics.health !== undefined &&
    metrics.system !== undefined
  );
}

describe('API Schema Validation', () => {
  describe('ServiceStatus Schema', () => {
    it('validates minimal service status', () => {
      const minimal: ServiceStatus = {
        name: 'backend',
        running: true,
      };

      expect(isValidServiceStatus(minimal)).toBe(true);
    });

    it('validates complete service status', () => {
      const complete: ServiceStatus = {
        name: 'backend',
        description: 'Core API',
        running: true,
        pid: 12345,
        startTime: new Date().toISOString(),
        url: 'http://localhost:3002',
        _detectionMethod: 'port',
      };

      expect(isValidServiceStatus(complete)).toBe(true);
    });

    it('rejects invalid service status', () => {
      expect(isValidServiceStatus(null)).toBe(false);
      expect(isValidServiceStatus(undefined)).toBe(false);
      expect(isValidServiceStatus({})).toBe(false);
      expect(isValidServiceStatus({ name: 'test' })).toBe(false); // missing running
      expect(isValidServiceStatus({ running: true })).toBe(false); // missing name
    });

    it('validates all detection methods', () => {
      const methods = ['port', 'pid', 'memory', 'none'] as const;

      methods.forEach((method) => {
        const status: ServiceStatus = {
          name: 'test',
          running: true,
          _detectionMethod: method,
        };
        expect(isValidServiceStatus(status)).toBe(true);
      });
    });
  });

  describe('PipelineHealth Schema', () => {
    it('validates pipeline health object', () => {
      const pipeline: PipelineHealth = {
        overall: 'healthy',
        score: 0.95,
        stages: {
          stt: { status: 'healthy', avgLatencyMs: 100, p95LatencyMs: 200, errorRate: 0.01, callCount: 100 },
        },
        lastFullSuccess: new Date().toISOString(),
        successRate1h: 0.98,
        avgE2ELatencyMs: 1500,
        p95E2ELatencyMs: 3000,
      };

      expect(isValidPipelineHealth(pipeline)).toBe(true);
    });

    it('validates all health statuses', () => {
      const statuses = ['healthy', 'degraded', 'unhealthy', 'unknown'] as const;

      statuses.forEach((status) => {
        const pipeline: PipelineHealth = {
          overall: status,
          score: 0.5,
          stages: {},
          lastFullSuccess: new Date().toISOString(),
          successRate1h: 0.5,
          avgE2ELatencyMs: 1000,
          p95E2ELatencyMs: 2000,
        };
        expect(isValidPipelineHealth(pipeline)).toBe(true);
      });
    });

    it('rejects invalid pipeline health', () => {
      expect(isValidPipelineHealth(null)).toBe(false);
      expect(isValidPipelineHealth({})).toBe(false);
      expect(isValidPipelineHealth({ overall: 'invalid' })).toBe(false);
    });
  });

  describe('CockpitAI Schema', () => {
    it('validates AI metrics object', () => {
      const ai: CockpitAI = {
        avgLatencyMs: 500,
        p95LatencyMs: 1500,
        avgTTFAMs: 200,
        p95TTFAMs: 600,
        requestsPerMin: 30,
        errorRate: 0.02,
        tokensInput: 100000,
        tokensOutput: 50000,
        estimatedCostUSD: 1.5,
        toolCalls: {
          total: 100,
          byTool: {},
        },
        pipeline: {
          overall: 'healthy',
          score: 0.95,
          stages: {},
          lastFullSuccess: new Date().toISOString(),
          successRate1h: 0.98,
          avgE2ELatencyMs: 1500,
          p95E2ELatencyMs: 3000,
        },
      };

      expect(isValidCockpitAI(ai)).toBe(true);
    });

    it('rejects invalid AI metrics', () => {
      expect(isValidCockpitAI(null)).toBe(false);
      expect(isValidCockpitAI({})).toBe(false);
      expect(isValidCockpitAI({ avgLatencyMs: 'string' })).toBe(false);
    });
  });

  describe('CockpitMetrics Schema', () => {
    it('checks required fields exist', () => {
      const metrics = {
        timestamp: new Date().toISOString(),
        health: { overall: 'healthy', dependencies: {} },
        system: { uptimeSeconds: 3600 },
      };

      expect(hasRequiredMetricsFields(metrics)).toBe(true);
    });

    it('rejects metrics without required fields', () => {
      expect(hasRequiredMetricsFields(null)).toBe(false);
      expect(hasRequiredMetricsFields({})).toBe(false);
      expect(hasRequiredMetricsFields({ timestamp: 'test' })).toBe(false);
    });
  });
});
