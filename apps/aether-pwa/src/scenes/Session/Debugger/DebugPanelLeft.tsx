'use client';

import { Network, MessageSquare, Activity, Mic, Shield, Coins } from 'lucide-react';
import { PermissionStatus } from '@/shared/utils/voice/permissions';
import { SessionStatus, VoiceState } from '../Session.logic';

// Simple types for UI
interface TokenUsage {
  totalTokens: number;
  cost?: string;
}

interface DebugPanelLeftProps {
  voiceState: VoiceState;
  permissionStatus: PermissionStatus;
  sessionStatus: SessionStatus;
  tokenUsage?: TokenUsage;
  onTestApi: () => void;
}

export function DebugPanelLeft({
  voiceState,
  permissionStatus,
  sessionStatus,
  tokenUsage,
  onTestApi,
}: DebugPanelLeftProps) {
  return (
    <div className="animate-in slide-in-from-bottom-4 md:slide-in-from-left-4 fixed inset-4 z-50 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 md:absolute md:inset-auto md:top-24 md:bottom-24 md:left-6 md:w-64">
      {/* Header */}
      <div className="border-b border-white/5 bg-[#252526]/50 p-3">
        <h3 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          Settings & Controls
        </h3>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto p-3">
        {/* Actions Section */}
        <div className="space-y-2">
          <h4 className="pl-1 text-[9px] font-bold tracking-wider text-gray-600 uppercase">
            Actions
          </h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onTestApi}
              className="group flex items-center gap-3 rounded-lg border border-transparent bg-white/5 px-3 py-2 text-xs text-gray-300 transition-colors hover:border-white/5 hover:bg-white/10"
            >
              <Network size={14} className="text-emerald-400 opacity-80 group-hover:opacity-100" />
              <span>Test API Connection</span>
            </button>
          </div>
        </div>

        {/* State Monitors */}
        <div className="space-y-2">
          <h4 className="pl-1 text-[9px] font-bold tracking-wider text-gray-600 uppercase">
            System State
          </h4>

          {/* Session Status */}
          <div className="space-y-1.5 rounded-lg border border-white/5 bg-black/20 p-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
              <Activity size={10} />
              <span>Session Status</span>
            </div>
            <div className="pl-5 font-mono text-xs break-words text-green-400">{sessionStatus}</div>
          </div>

          {/* Voice State */}
          <div className="space-y-1.5 rounded-lg border border-white/5 bg-black/20 p-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
              <Mic size={10} />
              <span>Voice State</span>
            </div>
            <div className="pl-5 font-mono text-xs break-words text-purple-300">{voiceState}</div>
          </div>

          {/* Permissions */}
          <div className="space-y-1.5 rounded-lg border border-white/5 bg-black/20 p-2.5">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
              <Shield size={10} />
              <span>Permissions</span>
            </div>
            <div
              className={`pl-5 font-mono text-xs break-words ${
                permissionStatus === 'granted'
                  ? 'text-green-400'
                  : permissionStatus === 'denied'
                    ? 'text-red-400'
                    : 'text-amber-400'
              }`}
            >
              {permissionStatus}
            </div>
          </div>

          {/* Token Usage - Simplified View */}
          {tokenUsage && (
            <div className="space-y-2 rounded-lg border border-white/5 bg-black/20 p-2.5">
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-wide text-gray-500 uppercase">
                <Coins size={10} />
                <span>Resources</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pl-1">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-600">Tokens</span>
                  <span className="font-mono text-xs text-indigo-300">
                    {isNaN(tokenUsage.totalTokens) ? 0 : tokenUsage.totalTokens.toLocaleString()}
                  </span>
                </div>

                {tokenUsage.cost && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-gray-600">Est. Cost</span>
                    <span className="font-mono text-xs text-green-400">{tokenUsage.cost}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
