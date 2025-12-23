export type ServiceState = 'stopped' | 'starting' | 'running' | 'stopping' | 'error';

export type ServiceStatus = {
  name: string;
  description?: string;
  running: boolean;
  pid?: number;
  startTime?: string;
  url?: string;
};

export type ServiceConfig = {
  flag: string;
  log: string;
  url?: string;
  description: string;
  isVirtual?: boolean; // Virtual services don't have start/stop controls
};

// Hardcoded URLs to avoid fs dependency in client components
export const SERVICES: Record<string, ServiceConfig> = {
  backend: {
    flag: '--backend',
    log: 'backend.log',
    url: 'http://localhost:3002',
    description: 'Core API & Logic',
  },
  tts: {
    flag: '--tts',
    log: 'tts.log',
    url: 'http://localhost:8880',
    description: 'Kokoro Speech Engine',
  },
  mlx: {
    flag: '--mlx',
    log: 'mlx.log',
    url: 'http://localhost:8000',
    description: 'Local LLM Inference',
  },
  frontend: {
    flag: '--frontend',
    log: 'frontend.log',
    url: 'http://localhost:3004',
    description: 'Consumer PWA',
  },
  langdetect: {
    flag: '--langdetect',
    log: 'langdetect.log',
    url: 'http://localhost:8001',
    description: 'Language Detection',
  },
  control: {
    flag: '', // No flag - virtual service
    log: 'console-control.log',
    description: 'Console Control',
    isVirtual: true,
  },
};

// Get only real (non-virtual) services
export const REAL_SERVICES = Object.fromEntries(
  Object.entries(SERVICES).filter(([_, config]) => !config.isVirtual)
);
