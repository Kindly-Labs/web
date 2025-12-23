'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { UIVoiceState } from '../Orb/Orb.logic';
import { useSession } from '../Session.context';
import { PolicyOverlay } from '../Debugger/PolicyOverlay';
import { useTranslation } from '@/shared/i18n/use-translation';

type PolicyType = 'terms' | 'privacy' | null;

interface FooterProps {
  emotionalTone: string;
  uiVoiceState: UIVoiceState;
  isRateLimited?: boolean;
}

export const Footer = ({ emotionalTone, uiVoiceState, isRateLimited }: FooterProps) => {
  const { actions, state } = useSession();
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [policyView, setPolicyView] = useState<PolicyType>(null);

  const isUnlocked = state.accessState?.isUnlocked;

  const handleVerifyCode = async () => {
    if (!accessCodeInput.trim()) return;
    setError('');
    setIsVerifying(true);

    const success = await actions.verifyAccessCode(accessCodeInput);
    setIsVerifying(false);

    if (success) {
      setAccessCodeInput('');
    } else {
      setError(t('footer.invalidCode'));
    }
  };

  // Haptic feedback utility
  const triggerHaptic = (style: 'light' | 'medium' = 'light') => {
    if ('vibrate' in navigator) {
      navigator.vibrate(style === 'light' ? [10] : [20]);
    }
  };

  const toggleExpand = () => {
    triggerHaptic('light');
    setIsExpanded(!isExpanded);
  };
  const collapse = () => setIsExpanded(false);

  // Indicator color based on state
  const indicatorColor = isRateLimited
    ? 'bg-amber-500/50'
    : emotionalTone === 'calm'
      ? 'bg-emerald-500/50'
      : emotionalTone === 'warm'
        ? 'bg-lime-500/50'
        : emotionalTone === 'contemplative'
          ? 'bg-teal-500/50'
          : 'bg-green-500/50';

  const indicatorRingColor = isRateLimited
    ? 'from-amber-500/20 to-orange-500/20 border-amber-400/20'
    : 'from-emerald-500/20 to-teal-500/20 border-emerald-400/20';

  return (
    <>
      <div
        className={`duration-slow w-full max-w-2xl transition-opacity ${uiVoiceState === 'listening' ? 'opacity-50' : ''}`}
      >
        <div className="duration-normal overflow-hidden rounded-2xl border border-emerald-400/5 bg-gradient-to-br from-emerald-950/30 to-teal-950/20 backdrop-blur-xl transition-all md:rounded-[1.5rem]">
          {/* Collapsed View - Always visible */}
          {!isExpanded && (
            <div className="px-6 py-4 md:px-8 md:py-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 space-y-1 md:space-y-2">
                  <p className="text-[10px] font-light tracking-wider text-emerald-200/90 uppercase md:text-xs">
                    {t('footer.safeSpaceMode')}
                  </p>
                  <p className="text-[10px] leading-relaxed text-emerald-300/70 md:max-w-md md:text-xs">
                    {t('footer.safeSpaceMessage')}
                  </p>
                </div>

                {/* Tappable Indicator */}
                <button
                  onClick={toggleExpand}
                  className="group flex flex-col items-center"
                  aria-label="Open settings"
                >
                  <div
                    className={`h-10 w-10 rounded-full bg-gradient-to-br md:h-12 md:w-12 ${indicatorRingColor} duration-normal flex items-center justify-center border transition-all group-hover:scale-105 group-hover:border-emerald-400/40 ${isRateLimited ? 'animate-pulse' : ''} `}
                  >
                    <div
                      className={`h-5 w-5 rounded-full md:h-6 md:w-6 ${indicatorColor} animate-pulse-slow`}
                    />
                  </div>
                  <span className="mt-1 text-[10px] tracking-wider text-emerald-400/60 uppercase transition-colors group-hover:text-emerald-300/80">
                    {emotionalTone}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Expanded View - Settings */}
          {isExpanded && (
            <div className="animate-in fade-in duration-fast max-h-[60vh] overflow-y-auto overscroll-contain">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-emerald-400/10 px-6 py-4 md:px-8">
                <span className="text-sm font-light text-emerald-300/80">
                  {t('footer.settings')}
                </span>
                <button
                  onClick={collapse}
                  className="-mr-1 rounded-full p-1.5 text-emerald-400/40 transition-colors hover:bg-emerald-500/10 hover:text-emerald-300"
                  aria-label="Close settings"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Access Code - only show if not unlocked */}
              {!isUnlocked && (
                <div className="border-b border-emerald-400/10 px-6 py-4 md:px-8">
                  <label className="mb-2 block text-[10px] tracking-wider text-emerald-300/70 uppercase">
                    {t('footer.accessCode')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={accessCodeInput}
                      onChange={(e) => setAccessCodeInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                      placeholder={t('footer.enterCode')}
                      className="flex-1 rounded-lg border border-emerald-400/10 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-100 placeholder-emerald-500/30 transition-colors focus:border-emerald-400/30 focus:outline-none"
                    />
                    <button
                      onClick={handleVerifyCode}
                      disabled={isVerifying || !accessCodeInput.trim()}
                      className="rounded-lg bg-emerald-600/80 px-4 py-2 text-xs text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-900/50 disabled:text-emerald-500/30"
                    >
                      {isVerifying ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      ) : (
                        t('footer.go')
                      )}
                    </button>
                  </div>
                  {error && <p className="mt-2 text-xs text-rose-400/80">{error}</p>}
                </div>
              )}

              {/* Status - only show if unlocked */}
              {isUnlocked && (
                <div className="border-b border-emerald-400/10 px-6 py-3 md:px-8">
                  <span className="text-xs text-emerald-400/80">
                    ✓ {t('footer.unlimitedAccess')}
                  </span>
                </div>
              )}

              {/* Language Selector */}
              <div className="border-b border-emerald-400/10 px-6 py-4 md:px-8">
                <label className="mb-2 block text-[10px] tracking-wider text-emerald-300/70 uppercase">
                  {t('footer.language')}
                </label>
                <select
                  value={state.language}
                  onChange={(e) => actions.setLanguage(e.target.value)}
                  className="w-full cursor-pointer rounded-lg border border-emerald-400/10 bg-emerald-950/50 px-3 py-2 text-sm text-emerald-200/80 transition-colors focus:border-emerald-400/30 focus:outline-none"
                >
                  <option value="auto">{t('languages.autoDetect')}</option>
                  <option value="toi-HK">{t('languages.toishanese')}</option>
                  <option value="yue-HK">{t('languages.cantonese')}</option>
                  <option value="cmn-CN">{t('languages.mandarin')}</option>
                  <option value="en-US">{t('languages.english')}</option>
                </select>
              </div>

              {/* Footer Links */}
              <div className="flex items-center justify-between px-6 py-3 md:px-8">
                <div className="flex gap-4">
                  <button
                    onClick={() => setPolicyView('terms')}
                    className="text-[10px] text-white/50 transition-colors hover:text-white/70"
                  >
                    {t('footer.terms')}
                  </button>
                  <button
                    onClick={() => setPolicyView('privacy')}
                    className="text-[10px] text-white/50 transition-colors hover:text-white/70"
                  >
                    {t('footer.privacy')}
                  </button>
                </div>
                <span className="font-mono text-[10px] text-white/30">v0.1.0</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Policy Overlay */}
      <PolicyOverlay type={policyView} onClose={() => setPolicyView(null)} />
    </>
  );
};
