'use client';

import { useExtensionDetector } from '@/shared/hooks/use-extension-detector';
import { AetherUI } from './Session';

export function SessionLayout() {
  useExtensionDetector();

  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <AetherUI />
    </main>
  );
}
