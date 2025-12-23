'use client';

import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, X } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/use-translation';

export const IOSInstallPrompt = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if running on iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream;

    // Check if already in standalone mode (installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone;

    // Check if user has dismissed it before
    const hasDismissed = localStorage.getItem('aether_install_dismissed');

    if (isIOS && !isStandalone && !hasDismissed) {
      // Delay slightly to not overwhelm on load
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('aether_install_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="animate-slide-up fixed right-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 z-[9999]">
      <div className="relative rounded-2xl border border-white/10 bg-black/80 p-4 shadow-2xl backdrop-blur-xl">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-2 text-white/40 transition-colors hover:text-white/80"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 pr-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-900/50">
            <img src="/icons/globe.svg" alt="App Icon" className="h-8 w-8 opacity-80" />
          </div>

          <div>
            <h3 className="mb-1 text-sm font-medium text-white">{t('onboarding.installAether')}</h3>
            <p className="text-xs leading-relaxed text-white/60">
              {t('onboarding.installDescription')}
            </p>

            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-400/90">
              <span>{t('onboarding.tap')}</span>
              <Share size={14} />
              <span>{t('onboarding.then')}</span>
              <PlusSquare size={14} />
              <span>{t('onboarding.addToHomeScreen')}</span>
            </div>
          </div>
        </div>

        {/* Pointer arrow (optional, usually bottom center for Safari toolbar) */}
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 origin-center -translate-x-1/2 rotate-45 transform border-r border-b border-white/10 bg-black/80 backdrop-blur-xl"></div>
      </div>
    </div>
  );
};
