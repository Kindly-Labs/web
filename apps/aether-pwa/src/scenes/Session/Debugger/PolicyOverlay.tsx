'use client';

import { X } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/use-translation';

type PolicyType = 'terms' | 'privacy' | null;

interface PolicyOverlayProps {
  type: PolicyType;
  onClose: () => void;
}

export function PolicyOverlay({ type, onClose }: PolicyOverlayProps) {
  const { t } = useTranslation();

  if (!type) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[9999] bg-[#0a0a0a] duration-200">
      <div className="flex h-full flex-col pt-[env(safe-area-inset-top)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <h1 className="text-lg font-light tracking-wide text-white">
            {type === 'terms' ? t('legal.terms') : t('legal.privacy')}
          </h1>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 pb-[env(safe-area-inset-bottom)] sm:p-6">
          <div className="mx-auto max-w-2xl">
            {type === 'terms' ? <TermsContent /> : <PrivacyContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

function TermsContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-sm leading-relaxed text-gray-300">
      <p className="text-xs text-gray-500">{t('legal.lastUpdated')}</p>

      <Section title={t('legal.acceptance')}>{t('legal.acceptanceText')}</Section>

      <Section title={t('legal.service')}>{t('legal.serviceText')}</Section>

      <Section title={t('legal.dataUse')}>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>{t('legal.dataUsePoint1')}</li>
          <li>{t('legal.dataUsePoint2')}</li>
          <li>{t('legal.dataUsePoint3')}</li>
        </ul>
      </Section>

      <Section title={t('legal.consent')}>{t('legal.consentText')}</Section>

      <Section title={t('legal.usage')}>{t('legal.usageText')}</Section>

      <Section title={t('legal.disclaimer')}>{t('legal.disclaimerText')}</Section>
    </div>
  );
}

function PrivacyContent() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 text-sm leading-relaxed text-gray-300">
      <p className="text-xs text-gray-500">{t('legal.lastUpdated')}</p>

      <Section title={t('legal.dataCollected')}>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>{t('legal.dataCollectedPoint1')}</li>
          <li>{t('legal.dataCollectedPoint2')}</li>
          <li>{t('legal.dataCollectedPoint3')}</li>
        </ul>
      </Section>

      <Section title={t('legal.notCollected')}>
        <ul className="list-inside list-disc space-y-1 text-gray-400">
          <li>{t('legal.notCollectedPoint1')}</li>
          <li>{t('legal.notCollectedPoint2')}</li>
          <li>{t('legal.notCollectedPoint3')}</li>
        </ul>
      </Section>

      <Section title={t('legal.anonymization')}>{t('legal.anonymizationText')}</Section>

      <Section title={t('legal.sharing')}>{t('legal.sharingText')}</Section>

      <Section title={t('legal.rights')}>{t('legal.rightsText')}</Section>

      <Section title={t('legal.children')}>{t('legal.childrenText')}</Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-xs tracking-wider text-emerald-400/80 uppercase">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
