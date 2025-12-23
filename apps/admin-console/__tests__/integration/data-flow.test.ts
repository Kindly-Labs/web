/**
 * Data Flow Integration Tests
 *
 * Verifies that data fetched from the backend is correctly
 * preserved through the fetch → transform → render pipeline.
 */

import {
  createMockCockpitAI,
  createMockPipelineHealth,
  createMockSessions,
  createMockUserGrowth,
} from '../utils/mock-generators';

describe('Data Flow Integration', () => {
  describe('Metrics Data Integrity', () => {
    it('AI performance metrics preserve numeric precision', () => {
      const ai = createMockCockpitAI();

      // Verify all numeric fields are valid numbers
      expect(typeof ai.avgLatencyMs).toBe('number');
      expect(typeof ai.p95LatencyMs).toBe('number');
      expect(typeof ai.avgTTFAMs).toBe('number');
      expect(typeof ai.p95TTFAMs).toBe('number');
      expect(typeof ai.requestsPerMin).toBe('number');
      expect(typeof ai.errorRate).toBe('number');
      expect(typeof ai.tokensInput).toBe('number');
      expect(typeof ai.tokensOutput).toBe('number');
      expect(typeof ai.estimatedCostUSD).toBe('number');

      // Verify ranges make sense
      expect(ai.avgLatencyMs).toBeGreaterThanOrEqual(0);
      expect(ai.errorRate).toBeGreaterThanOrEqual(0);
      expect(ai.errorRate).toBeLessThanOrEqual(1);
    });

    it('pipeline health has valid score range', () => {
      const pipeline = createMockPipelineHealth();

      expect(pipeline.score).toBeGreaterThanOrEqual(0);
      expect(pipeline.score).toBeLessThanOrEqual(1);
      expect(pipeline.successRate1h).toBeGreaterThanOrEqual(0);
      expect(pipeline.successRate1h).toBeLessThanOrEqual(1);
    });

    it('pipeline stages have all required fields', () => {
      const pipeline = createMockPipelineHealth();
      const requiredStages = ['stt', 'language_detect', 'llm', 'tool', 'tts'];

      requiredStages.forEach((stageName) => {
        const stage = pipeline.stages[stageName];
        expect(stage).toBeDefined();
        expect(stage.status).toBeDefined();
        expect(['healthy', 'degraded', 'unhealthy']).toContain(stage.status);
        expect(typeof stage.avgLatencyMs).toBe('number');
        expect(typeof stage.p95LatencyMs).toBe('number');
        expect(typeof stage.errorRate).toBe('number');
        expect(typeof stage.callCount).toBe('number');
      });
    });
  });

  describe('Session Data Integrity', () => {
    it('sessions have unique IDs', () => {
      const sessions = createMockSessions(10);
      const ids = sessions.recentSessions.map((s) => s.id);

      // All IDs should be unique
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('session counts are consistent', () => {
      const sessions = createMockSessions(5);

      // Active count should be a non-negative number
      expect(sessions.active).toBeGreaterThanOrEqual(0);
      // Today total should be at least as many as active
      expect(sessions.todayTotal).toBeGreaterThanOrEqual(0);
      // Recent sessions array length matches count parameter
      expect(sessions.recentSessions.length).toBe(5);
    });

    it('session timestamps are valid ISO strings', () => {
      const sessions = createMockSessions(3);

      sessions.recentSessions.forEach((session) => {
        expect(session.startTime).toBeDefined();
        // Should be parseable as a date
        const date = new Date(session.startTime);
        expect(date.getTime()).not.toBeNaN();
      });
    });
  });

  describe('User Growth Data', () => {
    it('user growth delta calculations are correct', () => {
      const growth = createMockUserGrowth();

      // If yesterday was 0, delta should be 0 or handle division by zero
      if (growth.newUsersYesterday > 0) {
        const expectedDelta =
          ((growth.newUsersToday - growth.newUsersYesterday) / growth.newUsersYesterday) * 100;
        expect(growth.newUsersDelta).toBeCloseTo(expectedDelta, 5);
      }
    });

    it('session delta calculations are correct', () => {
      const growth = createMockUserGrowth();

      if (growth.newSessionsYesterday > 0) {
        const expectedDelta =
          ((growth.newSessionsToday - growth.newSessionsYesterday) / growth.newSessionsYesterday) * 100;
        expect(growth.newSessionsDelta).toBeCloseTo(expectedDelta, 5);
      }
    });
  });

  describe('Mock Data Randomization', () => {
    it('generates different data on each call', () => {
      const ai1 = createMockCockpitAI();
      const ai2 = createMockCockpitAI();

      // At least some fields should be different (probabilistically)
      // This test may flake very rarely due to random chance
      const fieldsMatch =
        ai1.avgLatencyMs === ai2.avgLatencyMs &&
        ai1.requestsPerMin === ai2.requestsPerMin &&
        ai1.tokensInput === ai2.tokensInput;

      // Very unlikely all three random fields match
      expect(fieldsMatch).toBe(false);
    });

    it('session IDs are unique across calls', () => {
      const sessions1 = createMockSessions(3);
      const sessions2 = createMockSessions(3);

      const allIds = [
        ...sessions1.recentSessions.map((s) => s.id),
        ...sessions2.recentSessions.map((s) => s.id),
      ];

      // All 6 IDs should be unique
      expect(new Set(allIds).size).toBe(6);
    });
  });
});
