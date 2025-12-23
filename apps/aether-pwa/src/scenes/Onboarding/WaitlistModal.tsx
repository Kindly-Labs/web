'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, X, Key } from 'lucide-react';
import { useTranslation } from '@/shared/i18n/use-translation';

interface WaitlistModalProps {
  isOpen: boolean;
  onJoin: (email: string) => void;
  onClose: () => void;
  onBypass: (code: string) => Promise<boolean>;
}

export const WaitlistModal = ({ isOpen, onJoin, onClose, onBypass }: WaitlistModalProps) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [mode, setMode] = useState<'waitlist' | 'access'>('waitlist');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (mode === 'waitlist') {
      if (!email) return;
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onJoin(email);
      setSubmitted(true);
      setIsSubmitting(false);
    } else {
      if (!accessCode) return;
      const success = await onBypass(accessCode);
      setIsSubmitting(false);
      if (success) {
        onClose(); // Close modal on success
      } else {
        setError(t('onboarding.invalidAccessCode'));
      }
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === 'waitlist' ? 'access' : 'waitlist'));
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500" />

      {/* Modal Content */}
      <div className="relative w-full max-w-md scale-100 transform opacity-100 transition-all duration-500">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-950/90 to-teal-950/90 p-8 shadow-2xl shadow-emerald-900/20">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 rounded-full p-2 text-emerald-400/50 transition-colors hover:bg-emerald-900/50 hover:text-emerald-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Ambient Glow */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-teal-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center space-y-6 text-center">
            {/* Icon */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-500/10">
              {submitted ? (
                <Check className="h-8 w-8 text-emerald-300" />
              ) : (
                <Sparkles className="h-8 w-8 text-emerald-300" />
              )}
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-2xl font-light tracking-wide text-transparent">
                {submitted
                  ? t('onboarding.onTheList')
                  : mode === 'access'
                    ? t('onboarding.enterAccessCode')
                    : t('onboarding.demoLimitReached')}
              </h2>
              <p className="text-sm leading-relaxed text-emerald-100/60">
                {submitted
                  ? t('onboarding.thankYouInterest')
                  : mode === 'access'
                    ? t('onboarding.enterCodeUnlock')
                    : t('onboarding.comeBackLater')}
              </p>
            </div>

            {/* Unlock Option after Submission */}
            {submitted && (
              <button
                onClick={() => {
                  setSubmitted(false);
                  setMode('access');
                }}
                className="text-sm text-emerald-300 underline underline-offset-4 transition-colors hover:text-emerald-200"
              >
                {t('onboarding.haveAccessCode')}
              </button>
            )}

            {/* Form */}
            {!submitted && (
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div className="group relative">
                  {mode === 'waitlist' ? (
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('onboarding.enterEmail')}
                      className="w-full rounded-xl border border-emerald-400/20 bg-emerald-950/50 px-5 py-3.5 text-emerald-100 placeholder-emerald-400/30 transition-all focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 focus:outline-none"
                      required
                    />
                  ) : (
                    <input
                      type="password"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder={t('onboarding.enterCodePlaceholder')}
                      className="w-full rounded-xl border border-emerald-400/20 bg-emerald-950/50 px-5 py-3.5 text-emerald-100 placeholder-emerald-400/30 transition-all focus:border-emerald-400/50 focus:ring-1 focus:ring-emerald-400/50 focus:outline-none"
                      required
                    />
                  )}
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-medium tracking-wide text-white shadow-lg shadow-emerald-900/20 transition-all hover:from-emerald-500 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      {mode === 'waitlist'
                        ? t('onboarding.joinWaitlist')
                        : t('onboarding.unlockAccess')}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMode}
                  className="flex w-full items-center justify-center gap-2 text-sm text-emerald-400/50 transition-colors hover:text-emerald-300"
                >
                  {mode === 'waitlist' ? (
                    <>
                      <Key className="h-3 w-3" />
                      {t('onboarding.haveCode')}
                    </>
                  ) : (
                    t('onboarding.backToWaitlist')
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
