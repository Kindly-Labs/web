'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useSession } from '../Session.context';
import { PolicyOverlay } from './PolicyOverlay';

type PolicyType = 'terms' | 'privacy' | null;

export function DebugPanelRight() {
  const { actions, state } = useSession();
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
      setError('Invalid');
    }
  };

  return (
    <>
      <div className="animate-in slide-in-from-bottom-4 sm:slide-in-from-right-4 fixed inset-x-3 bottom-3 z-50 overflow-hidden rounded-2xl border border-white/5 bg-[#111] pb-[env(safe-area-inset-bottom)] duration-200 sm:absolute sm:top-20 sm:right-4 sm:bottom-auto sm:left-auto sm:w-64 sm:bg-black/90 sm:backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-white/80">Settings</span>
          <button
            onClick={actions.toggleDebug}
            className="-mr-1 rounded-full p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Access Code - only show if not unlocked */}
        {!isUnlocked && (
          <div className="px-4 pb-4">
            <div className="flex gap-2">
              <input
                type="password"
                value={accessCodeInput}
                onChange={(e) => setAccessCodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyCode()}
                placeholder="Access code"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white placeholder-white/30 focus:border-emerald-500/50 focus:outline-none sm:text-xs"
              />
              <button
                onClick={handleVerifyCode}
                disabled={isVerifying || !accessCodeInput.trim()}
                className="rounded-lg bg-emerald-600 px-3 py-2 text-xs text-white transition-colors hover:bg-emerald-500 disabled:bg-white/10 disabled:text-white/30"
              >
                {isVerifying ? '...' : 'Go'}
              </button>
            </div>
            {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
          </div>
        )}

        {/* Status - only show if unlocked */}
        {isUnlocked && (
          <div className="px-4 pb-3">
            <span className="text-xs text-emerald-400/80">Unlimited access</span>
          </div>
        )}

        {/* Language */}
        <div className="px-4 pb-4">
          <select
            value={state.language}
            onChange={(e) => actions.setLanguage(e.target.value)}
            className="w-full cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-base text-white/80 focus:border-emerald-500/50 focus:outline-none sm:text-xs"
          >
            <option value="auto">Auto-detect language</option>
            <option value="toi-HK">台山話 (Toishanese)</option>
            <option value="yue-HK">廣東話 (Cantonese)</option>
            <option value="cmn-CN">普通话 (Mandarin)</option>
            <option value="en-US">English</option>
          </select>
        </div>

        {/* Footer - Legal links */}
        <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
          <div className="flex gap-4">
            <button
              onClick={() => setPolicyView('terms')}
              className="text-[10px] text-white/30 transition-colors hover:text-white/60"
            >
              Terms
            </button>
            <button
              onClick={() => setPolicyView('privacy')}
              className="text-[10px] text-white/30 transition-colors hover:text-white/60"
            >
              Privacy
            </button>
          </div>
          <span className="font-mono text-[10px] text-white/20">v0.1.0</span>
        </div>
      </div>

      {/* Policy Overlay */}
      <PolicyOverlay type={policyView} onClose={() => setPolicyView(null)} />
    </>
  );
}
