'use client';

import React from 'react';
import { useTranslation } from '@/shared/i18n/use-translation';

export const LandscapeWarning = () => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[9999] hidden touch-none flex-col items-center justify-center bg-black/95 p-6 text-center landscape:flex md:landscape:hidden">
      <div className="mb-4 animate-pulse text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
          <path d="M19 3v4"></path>
          <path d="M21 5h-4"></path>
        </svg>
      </div>
      <h2 className="mb-2 text-xl font-medium text-white">{t('onboarding.rotateDevice')}</h2>
      <p className="mx-auto max-w-xs text-sm text-white/60">{t('onboarding.portraitMode')}</p>

      <style jsx>{`
        @media (orientation: landscape) and (max-height: 500px) {
          .landscape\\:flex {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
};
