import React from 'react';
import { render, screen } from '../utils/test-utils';
import { AIPerformancePanel } from '@/components/features/cockpit/panels/AIPerformancePanel';
import { createMockCockpitAI, createMockPipelineHealth } from '../utils/mock-generators';
import type { CockpitAI, PipelineHealth } from '@/lib/cockpit-types';

describe('AIPerformancePanel', () => {
  const createTestData = () => ({
    ai: createMockCockpitAI(),
    pipeline: createMockPipelineHealth(),
  });

  describe('Header', () => {
    it('renders panel header with "AI Pipeline" title', () => {
      const { ai } = createTestData();
      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('AI Pipeline')).toBeInTheDocument();
    });

    it('displays overall health status badge when pipeline data exists', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.overall = 'healthy';

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('HEALTHY')).toBeInTheDocument();
    });

    it('displays degraded status badge', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.overall = 'degraded';

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('DEGRADED')).toBeInTheDocument();
    });

    it('displays unhealthy status badge', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.overall = 'unhealthy';

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('UNHEALTHY')).toBeInTheDocument();
    });
  });

  describe('Pipeline Summary Stats', () => {
    it('displays health score percentage', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.score = 0.95;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('95%')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    it('displays E2E latency', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.avgE2ELatencyMs = 1500;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('1.5s')).toBeInTheDocument();
      expect(screen.getByText('E2E Latency')).toBeInTheDocument();
    });

    it('displays success rate', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.successRate1h = 0.98;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('98.0%')).toBeInTheDocument();
      expect(screen.getByText('Success (1h)')).toBeInTheDocument();
    });

    it('shows -- for missing pipeline data', () => {
      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={null} />);

      // Multiple '--' values expected for missing pipeline stats
      const dashes = screen.getAllByText('--');
      expect(dashes.length).toBeGreaterThan(0);
    });
  });

  describe('Pipeline Stages', () => {
    it('displays Stage Performance header', () => {
      const { ai, pipeline } = createTestData();
      render(<AIPerformancePanel ai={ai} pipeline={pipeline} />);

      expect(screen.getByText('Stage Performance')).toBeInTheDocument();
    });

    it('displays all pipeline stages from mock data', () => {
      const { ai, pipeline } = createTestData();
      render(<AIPerformancePanel ai={ai} pipeline={pipeline} />);

      // Stages are rendered with uppercase names
      expect(screen.getByText('STT')).toBeInTheDocument();
      expect(screen.getByText('LLM')).toBeInTheDocument();
      expect(screen.getByText('TTS')).toBeInTheDocument();
    });

    it('shows call count for stages', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.stages.stt.callCount = 42;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('42 calls')).toBeInTheDocument();
    });

    it('shows error rate when stage has errors', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.stages.stt.errorRate = 0.073;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      expect(screen.getByText('7.3% err')).toBeInTheDocument();
    });

    it('shows default pipeline stages when no data', () => {
      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={null} />);

      expect(screen.getByText('STT')).toBeInTheDocument();
      expect(screen.getByText('LANGUAGE_DETECT')).toBeInTheDocument();
      expect(screen.getByText('LLM')).toBeInTheDocument();
      expect(screen.getByText('TOOL')).toBeInTheDocument();
      expect(screen.getByText('TTS')).toBeInTheDocument();
    });
  });

  describe('Latency Metrics', () => {
    it('displays latency label', () => {
      const { ai } = createTestData();
      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('Latency')).toBeInTheDocument();
    });

    it('formats latency in seconds when >= 1000ms', () => {
      const ai = createMockCockpitAI();
      ai.avgLatencyMs = 1500;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('1.5s')).toBeInTheDocument();
    });

    it('formats latency in ms when < 1000ms', () => {
      const ai = createMockCockpitAI();
      ai.avgLatencyMs = 500;
      ai.p95LatencyMs = 800;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('500ms')).toBeInTheDocument();
    });

    it('displays p95 latency', () => {
      const ai = createMockCockpitAI();
      ai.p95LatencyMs = 2000;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('p95: 2.0s')).toBeInTheDocument();
    });

    it('displays TTFA', () => {
      const ai = createMockCockpitAI();
      ai.avgTTFAMs = 800;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('TTFA')).toBeInTheDocument();
      expect(screen.getByText('800ms')).toBeInTheDocument();
    });

    it('displays RPM', () => {
      const ai = createMockCockpitAI();
      ai.requestsPerMin = 42;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('RPM: 42')).toBeInTheDocument();
    });

    it('displays error rate', () => {
      const ai = createMockCockpitAI();
      ai.errorRate = 0.035;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('3.5%')).toBeInTheDocument();
    });

    it('shows red styling when error rate exceeds 5%', () => {
      const ai = createMockCockpitAI();
      ai.errorRate = 0.08;

      render(<AIPerformancePanel ai={ai} />);

      // Find the error rate text value (8.0%) and check the container
      const errorRateValue = screen.getByText('8.0%');
      expect(errorRateValue).toHaveClass('text-red-400');
    });
  });

  describe('Token Usage', () => {
    it('displays token input/output labels', () => {
      const { ai } = createTestData();
      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('In:')).toBeInTheDocument();
      expect(screen.getByText('Out:')).toBeInTheDocument();
    });

    it('formats large token counts with M suffix', () => {
      const ai = createMockCockpitAI();
      ai.tokensInput = 1500000;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('1.5M')).toBeInTheDocument();
    });

    it('formats medium token counts with K suffix', () => {
      const ai = createMockCockpitAI();
      ai.tokensOutput = 25000;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('25.0K')).toBeInTheDocument();
    });

    it('displays estimated cost in USD', () => {
      const ai = createMockCockpitAI();
      ai.estimatedCostUSD = 3.45;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('3.45')).toBeInTheDocument();
    });
  });

  describe('Loading and Error States', () => {
    it('renders gracefully with null ai data', () => {
      render(<AIPerformancePanel ai={null} />);

      // Should show '--' for unavailable metrics
      expect(screen.getAllByText('--').length).toBeGreaterThan(0);
    });

    it('shows 0 for RPM when ai is null', () => {
      render(<AIPerformancePanel ai={null} />);

      expect(screen.getByText('RPM: 0')).toBeInTheDocument();
    });

    it('shows 0.00 for cost when ai is null', () => {
      render(<AIPerformancePanel ai={null} />);

      expect(screen.getByText('0.00')).toBeInTheDocument();
    });
  });

  describe('Data Integrity', () => {
    it('all metrics match mock data exactly', () => {
      const ai = createMockCockpitAI();
      ai.requestsPerMin = 55;
      ai.errorRate = 0.025;
      ai.estimatedCostUSD = 3.45;

      render(<AIPerformancePanel ai={ai} />);

      expect(screen.getByText('RPM: 55')).toBeInTheDocument();
      expect(screen.getByText('2.5%')).toBeInTheDocument();
      expect(screen.getByText('3.45')).toBeInTheDocument();
    });

    it('pipeline call counts are not placeholders', () => {
      const pipeline = createMockPipelineHealth();
      pipeline.stages.stt.callCount = 67;

      render(<AIPerformancePanel ai={createMockCockpitAI()} pipeline={pipeline} />);

      const callsElement = screen.getByText('67 calls');
      expect(callsElement).toBeInTheDocument();
      expect(callsElement.textContent).not.toBe('-- calls');
    });
  });
});
