import fs from 'fs';
import path from 'path';

export interface PortConfig {
  default: number;
  fallbacks: number[];
  description?: string;
}

export interface PortsConfig {
  backend: PortConfig;
  frontend: PortConfig;
  console: PortConfig;
  tts: PortConfig;
  mlx: PortConfig;
  langdetect: PortConfig;
}

// Default ports as fallback if config file not found
const DEFAULT_PORTS: PortsConfig = {
  backend: { default: 3002, fallbacks: [3012, 3022] },
  frontend: { default: 3004, fallbacks: [3014, 3024] },
  console: { default: 3001, fallbacks: [3011, 3021] },
  tts: { default: 8880, fallbacks: [8881, 8882] },
  mlx: { default: 8000, fallbacks: [8002, 8003] },
  langdetect: { default: 8001, fallbacks: [8011, 8021] },
};

let cachedConfig: PortsConfig | null = null;

export function loadPortsConfig(): PortsConfig {
  if (cachedConfig) return cachedConfig;

  // Try to load from config file
  const configPaths = [
    path.join(process.cwd(), '../../config/ports.json'),
    path.join(process.cwd(), '../../../config/ports.json'),
    path.join(__dirname, '../../../config/ports.json'),
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const content = fs.readFileSync(configPath, 'utf-8');
        cachedConfig = JSON.parse(content);
        return cachedConfig!;
      }
    } catch {
      // Continue to next path
    }
  }

  // Return defaults if config not found
  cachedConfig = DEFAULT_PORTS;
  return cachedConfig;
}

export function getServiceUrl(service: keyof PortsConfig): string {
  const config = loadPortsConfig();
  const port = config[service].default;
  return `http://localhost:${port}`;
}

export function getPort(service: keyof PortsConfig): number {
  const config = loadPortsConfig();
  return config[service].default;
}
