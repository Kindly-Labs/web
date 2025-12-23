'use client';

import { useState, useEffect } from 'react';
import { X, Mic, CheckCircle, Clock, Award, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const CONTRIBUTOR_KEY = 'aether_workbench_contributor';

interface WelcomeModalProps {
  onClose: () => void;
  onGetStarted?: () => void;
}

export function getContributorInfo(): { name: string; id: string } | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CONTRIBUTOR_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function saveContributorInfo(name: string) {
  const id = `contrib_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const info = { name, id };
  localStorage.setItem(CONTRIBUTOR_KEY, JSON.stringify(info));
  return info;
}

export default function WelcomeModal({ onClose, onGetStarted }: WelcomeModalProps) {
  const [step, setStep] = useState(0);
  const [contributorName, setContributorName] = useState('');

  const steps = [
    {
      title: 'Help Preserve Toishanese',
      icon: Mic,
      content: (
        <div className="text-center">
          <p className="mb-4 text-neutral-300">
            Welcome to the Aether Workbench! Your voice recordings help train AI to
            understand and speak Toishanese, an endangered Chinese dialect spoken by
            millions worldwide.
          </p>
          <p className="text-neutral-400">
            Every phrase you record contributes to preserving this language for
            future generations.
          </p>
        </div>
      ),
    },
    {
      title: 'Earn Service Hours',
      icon: Clock,
      content: (
        <div className="space-y-4">
          <p className="text-center text-neutral-300">
            Your contributions are tracked and rewarded with service hours:
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                <Mic className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-100">Recording a phrase</p>
                <p className="text-sm text-neutral-400">+0.02 hours (1.2 minutes)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-neutral-100">Validating a recording</p>
                <p className="text-sm text-neutral-400">+0.01 hours (0.6 minutes)</p>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-neutral-500">
            Request a certificate anytime from your Progress page!
          </p>
        </div>
      ),
    },
    {
      title: 'Earn Badges & Recognition',
      icon: Award,
      content: (
        <div className="space-y-4">
          <p className="text-center text-neutral-300">
            Unlock badges as you contribute and climb the leaderboard!
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
              <div className="mb-2 text-2xl">🎤</div>
              <p className="text-xs font-medium text-neutral-300">First Steps</p>
              <p className="text-xs text-neutral-500">First recording</p>
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
              <div className="mb-2 text-2xl">⭐</div>
              <p className="text-xs font-medium text-neutral-300">Dedicated</p>
              <p className="text-xs text-neutral-500">50 recordings</p>
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
              <div className="mb-2 text-2xl">🔥</div>
              <p className="text-xs font-medium text-neutral-300">Weekly Warrior</p>
              <p className="text-xs text-neutral-500">7-day streak</p>
            </div>
            <div className="rounded-lg border border-neutral-700 bg-neutral-800/50 p-3 text-center">
              <div className="mb-2 text-2xl">🏆</div>
              <p className="text-xs font-medium text-neutral-300">Voice Champion</p>
              <p className="text-xs text-neutral-500">100 recordings</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "What's Your Name?",
      icon: User,
      content: (
        <div className="space-y-4">
          <p className="text-center text-neutral-300">
            Enter your name so we can track your contributions and award you certificates.
          </p>
          <input
            type="text"
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
            placeholder="Your name (e.g., Amy L.)"
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-center text-lg text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
          <p className="text-center text-xs text-neutral-500">
            This will appear on the leaderboard and your service hour certificates.
          </p>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;
  const isLastStep = step === steps.length - 1;
  const canProceed = !isLastStep || contributorName.trim().length >= 2;

  const handleNext = () => {
    if (isLastStep) {
      if (contributorName.trim()) {
        saveContributorInfo(contributorName.trim());
      }
      onClose();
      onGetStarted?.();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-neutral-500 transition-colors hover:text-neutral-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center px-6 pt-8">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
            <Icon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">{currentStep.title}</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">{currentStep.content}</div>

        {/* Footer */}
        <div className="border-t border-neutral-800 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Step indicators */}
            <div className="flex gap-2">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={cn(
                    'h-2 w-2 rounded-full transition-all',
                    i === step ? 'w-6 bg-amber-500' : 'bg-neutral-700 hover:bg-neutral-600'
                  )}
                />
              ))}
            </div>

            {/* Navigation button */}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 font-medium transition-colors',
                canProceed
                  ? 'bg-amber-600 hover:bg-amber-500'
                  : 'cursor-not-allowed bg-neutral-700 text-neutral-500'
              )}
            >
              {isLastStep ? 'Get Started' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
