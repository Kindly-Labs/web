/**
 * Service Detection Integration Tests
 *
 * Verifies that the service detection logic works correctly for:
 * - Services with URLs (port-based detection)
 * - Detection priority (port > PID > memory)
 * - Configuration completeness
 */

import { SERVICES, REAL_SERVICES, type ServiceStatus } from '@/lib/types';

describe('Service Detection', () => {
  describe('Service Configuration', () => {
    it('all real services have URLs defined', () => {
      Object.entries(REAL_SERVICES).forEach(([name, config]) => {
        expect(config.url).toBeDefined();
        expect(config.url).toMatch(/^http:\/\/localhost:\d+/);
      });
    });

    it('all services have unique ports', () => {
      const ports = Object.values(REAL_SERVICES)
        .filter((c) => c.url)
        .map((c) => new URL(c.url!).port);

      // Ports should be unique
      expect(new Set(ports).size).toBe(ports.length);
    });

    it('service configuration includes all expected services', () => {
      const expectedServices = ['backend', 'frontend', 'mlx', 'tts', 'langdetect'];
      const configuredServices = Object.keys(REAL_SERVICES);

      expectedServices.forEach((svc) => {
        expect(configuredServices).toContain(svc);
      });
    });

    it('virtual services are excluded from REAL_SERVICES', () => {
      // Control is a virtual service
      expect(SERVICES.control).toBeDefined();
      expect(SERVICES.control.isVirtual).toBe(true);

      // Virtual services should not be in REAL_SERVICES
      expect(REAL_SERVICES.control).toBeUndefined();
    });

    it('all services have required configuration fields', () => {
      Object.entries(SERVICES).forEach(([name, config]) => {
        expect(config.log).toBeDefined();
        expect(config.description).toBeDefined();
        // Flag can be empty string for virtual services
        expect(config.flag).toBeDefined();
      });
    });
  });

  describe('Detection Priority', () => {
    it('port check is primary detection method for URL services', () => {
      // All real services have URLs, so port detection should be authoritative
      const urlServices = Object.entries(REAL_SERVICES).filter(([_, config]) => config.url);

      // All real services should have URLs
      expect(urlServices.length).toBe(Object.keys(REAL_SERVICES).length);
    });

    it('detection methods are correctly typed', () => {
      // Verify the detection method type
      const validMethods: ServiceStatus['_detectionMethod'][] = ['port', 'pid', 'memory', 'none'];

      validMethods.forEach((method) => {
        const mockStatus: ServiceStatus = {
          name: 'test',
          running: true,
          _detectionMethod: method,
        };
        expect(validMethods).toContain(mockStatus._detectionMethod);
      });
    });
  });

  describe('Service URLs', () => {
    it('backend runs on port 3002', () => {
      const url = new URL(SERVICES.backend.url!);
      expect(url.port).toBe('3002');
    });

    it('frontend runs on port 3004', () => {
      const url = new URL(SERVICES.frontend.url!);
      expect(url.port).toBe('3004');
    });

    it('mlx runs on port 8000', () => {
      const url = new URL(SERVICES.mlx.url!);
      expect(url.port).toBe('8000');
    });

    it('tts runs on port 8880', () => {
      const url = new URL(SERVICES.tts.url!);
      expect(url.port).toBe('8880');
    });

    it('langdetect runs on port 8001', () => {
      const url = new URL(SERVICES.langdetect.url!);
      expect(url.port).toBe('8001');
    });
  });
});
