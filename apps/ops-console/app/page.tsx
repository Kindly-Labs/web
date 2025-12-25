'use client';

import { useClusterMetrics } from '@/lib/hooks/useClusterMetrics';
import { Header } from '@/components/ui/Header';
import { ProductTabsView } from '@/components/panels/ProductTabsView';

export default function OpsConsolePage() {
  const { metrics, isLoading, error, lastUpdated, refetch } = useClusterMetrics();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-900">
      <Header lastUpdated={lastUpdated} />

      <main className="min-h-0 flex-1">
        <ProductTabsView
          metrics={metrics}
          isLoading={isLoading}
          error={error}
          onRefresh={refetch}
        />
      </main>

      {/* Footer */}
      <footer className="flex h-8 items-center justify-between border-t border-slate-700/50 bg-slate-800/30 px-4 text-[10px] text-slate-500">
        <span>ops.cogito.cv</span>
        <span>Super Admin Dashboard</span>
      </footer>
    </div>
  );
}
