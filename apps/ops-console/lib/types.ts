// Cluster metrics from ops-metrics service
export interface ClusterMetrics {
  timestamp: string;
  node: NodeMetrics | null;
  pods: PodMetrics[];
  argocd: ArgoCDMetrics | null;
  caddy: CaddyMetrics | null;
  oracle: OracleMetrics | null;
}

export interface NodeMetrics {
  cpu_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  uptime_seconds: number;
  load_1m: number;
  load_5m: number;
  load_15m: number;
}

export interface PodMetrics {
  namespace: string;
  name: string;
  status: string;
  restarts: number;
  age_seconds: number;
  ready: boolean;
}

export interface ArgoCDMetrics {
  apps: ArgoCDApp[];
}

export interface ArgoCDApp {
  name: string;
  namespace: string;
  sync_status: string;
  health_status: string;
  last_sync_time?: string;
  message?: string;
}

export interface CaddyMetrics {
  healthy: boolean;
  uptime_seconds: number;
  routes: CaddyRoute[];
}

export interface CaddyRoute {
  host: string;
  upstream: string;
  healthy: boolean;
}

export interface OracleMetrics {
  storage_used_gb: number;
  storage_limit_gb: number;
  egress_used_tb: number;
  egress_limit_tb: number;
}

// Product tabs for iframe embedding
export interface ProductTab {
  id: string;
  name: string;
  iframeUrl: string | null;
  icon: string;
}

export const PRODUCT_TABS: ProductTab[] = [
  { id: 'cluster', name: 'Cluster', iframeUrl: null, icon: 'server' },
  { id: 'aethersing', name: 'AetherSing', iframeUrl: 'https://sing.cogito.cv/admin/logs', icon: 'music' },
  { id: 'kindly-labs', name: 'Kindly-Labs', iframeUrl: 'https://admin.cogito.cv', icon: 'brain' },
];
