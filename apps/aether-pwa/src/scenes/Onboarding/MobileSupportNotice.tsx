'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, X, Monitor, Smartphone } from 'lucide-react';
import { checkDeviceCapabilities } from '@/shared/utils/device-capabilities';
import { useTranslation } from '@/shared/i18n/use-translation';

export const MobileSupportNotice = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const { isMobile } = checkDeviceCapabilities();
    const hasSeenNotice = localStorage.getItem('aether_mobile_notice_seen');

    if (isMobile && !hasSeenNotice) {
      // Small delay to appear after initial load
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('aether_mobile_notice_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm duration-300">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-[#1e1e1e] shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-amber-500/10 to-transparent px-5 py-4">
          <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
            <AlertTriangle size={18} />
          </div>
          <h3 className="text-sm font-semibold tracking-wide text-gray-200">
            {t('onboarding.betaMobileSupport')}
          </h3>
          <button
            onClick={handleDismiss}
            className="ml-auto p-1 text-gray-500 transition-colors hover:text-gray-300"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 p-5">
          <p className="text-xs leading-relaxed text-gray-400">{t('onboarding.mobileWarning')}</p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3">
              <Monitor size={16} className="text-emerald-400" />
              <div>
                <div className="text-xs font-medium text-gray-200">{t('onboarding.desktop')}</div>
                <div className="text-[10px] text-emerald-400/80">
                  {t('onboarding.desktopCapability')}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-3 opacity-75">
              <Smartphone size={16} className="text-amber-400" />
              <div>
                <div className="text-xs font-medium text-gray-200">{t('onboarding.mobile')}</div>
                <div className="text-[10px] text-amber-400/80">
                  {t('onboarding.mobileCapability')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full rounded-lg border border-white/5 bg-white/10 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/15"
          >
            {t('onboarding.continueAnyway')}
          </button>
        </div>
      </div>
    </div>
  );
};
