import React from 'react';
import { Lock, Compass, AlertCircle, Play } from 'lucide-react';
import { SessionStatus } from '../Session.logic';
import { PermissionStatus } from '@/shared/utils/voice/permissions';

interface OrbStatusOverlayProps {
  sessionStatus: SessionStatus;
  permissionStatus: PermissionStatus;
}

export const OrbStatusOverlay = ({ sessionStatus, permissionStatus }: OrbStatusOverlayProps) => {
  return (
    <>
      {/* Error/Status Icons Overlay */}
      {sessionStatus === 'insecure-context' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Lock className="h-16 w-16 text-red-300/80" />
        </div>
      )}
      {sessionStatus === 'unsupported' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <Compass className="h-16 w-16 text-yellow-300/80" />
        </div>
      )}
      {permissionStatus === 'denied' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <AlertCircle className="h-16 w-16 text-red-300/80" />
        </div>
      )}

      {/* Start Prompt Overlay */}
      {sessionStatus === 'idle' && (
        <div className="pointer-events-none absolute inset-0 z-20 flex animate-pulse items-center justify-center">
          <Play className="ml-2 h-16 w-16 fill-emerald-200/50 text-emerald-200/80" />
        </div>
      )}

      {/* Connection Progress Indicator */}
      {(sessionStatus === 'initializing' || sessionStatus === 'connecting') && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
          <div className="flex gap-1.5">
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-emerald-400/80 [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </>
  );
};
