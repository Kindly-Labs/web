import { getConfig, PRODUCTION_CONFIG, LOCAL_CONFIG, checkSiteHealth } from '@/lib/environment';

describe('environment', () => {
  describe('getConfig', () => {
    it('returns local config when environment is "local"', () => {
      const config = getConfig('local');

      expect(config).toBe(LOCAL_CONFIG);
      expect(config.api.baseUrl).toBe('http://localhost:3002');
      expect(config.api.adminEndpoint).toBe('/admin/api');
    });

    it('returns production config when environment is "production"', () => {
      const config = getConfig('production');

      expect(config).toBe(PRODUCTION_CONFIG);
      expect(config.api.baseUrl).toBe('https://api.cogito.cv');
      expect(config.api.adminEndpoint).toBe('/v1/admin');
    });
  });

  describe('checkSiteHealth', () => {
    it('returns offline status when fetch throws error', async () => {
      // Mock fetch to throw an error (simulating network failure)
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await checkSiteHealth('https://example.com');

      expect(result.status).toBe('offline');
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });
  });
});
