'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Rocket, Server, Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeployStatus = 'idle' | 'deploying' | 'success' | 'error';

interface DeployStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
}

export function DeployModal({ isOpen, onClose }: DeployModalProps) {
  const { productionAuth } = useEnvironment();
  const [status, setStatus] = useState<DeployStatus>('idle');
  const [steps, setSteps] = useState<DeployStep[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = async () => {
    if (!productionAuth) {
      setError('Not authenticated');
      return;
    }

    setStatus('deploying');
    setError(null);
    setSteps([
      { name: 'Connecting to server', status: 'running' },
      { name: 'Pulling latest changes', status: 'pending' },
      { name: 'Building application', status: 'pending' },
      { name: 'Restarting services', status: 'pending' },
      { name: 'Health check', status: 'pending' },
    ]);

    try {
      // Call the deploy endpoint
      const response = await fetch('/api/production/deploy', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${productionAuth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target: 'backend' }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      // Simulate step progress (in reality, this would come from SSE or polling)
      const stepDelay = 1500;
      for (let i = 0; i < steps.length; i++) {
        await new Promise((r) => setTimeout(r, stepDelay));
        setSteps((prev) =>
          prev.map((step, idx) => ({
            ...step,
            status: idx < i ? 'success' : idx === i ? 'running' : 'pending',
          }))
        );
      }

      // Final success
      await new Promise((r) => setTimeout(r, stepDelay));
      setSteps((prev) => prev.map((step) => ({ ...step, status: 'success' })));
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setStatus('error');
      setSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: step.status === 'running' ? 'error' : step.status,
        }))
      );
    }
  };

  const handleClose = () => {
    if (status !== 'deploying') {
      setStatus('idle');
      setSteps([]);
      setError(null);
      onClose();
    }
  };

  const getStepIcon = (stepStatus: DeployStep['status']) => {
    switch (stepStatus) {
      case 'running':
        return <Loader2 size={14} className="animate-spin text-sky-400" />;
      case 'success':
        return <CheckCircle size={14} className="text-emerald-400" />;
      case 'error':
        return <XCircle size={14} className="text-red-400" />;
      default:
        return <div className="h-3.5 w-3.5 rounded-full border border-slate-600" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Deploy to Production">
      <div className="space-y-4">
        {/* Warning */}
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
          <AlertTriangle size={18} className="mt-0.5 flex-shrink-0 text-amber-400" />
          <div>
            <div className="text-sm font-medium text-amber-300">Production Deployment</div>
            <div className="text-xs text-amber-400/80">
              This will deploy the latest changes to api.cogito.cv. The backend will be
              temporarily unavailable during the deployment.
            </div>
          </div>
        </div>

        {/* Target */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3">
          <div className="flex items-center gap-3">
            <Server size={18} className="text-emerald-400" />
            <div>
              <div className="text-sm font-medium text-white">Owly API Backend</div>
              <div className="text-xs text-slate-400">api.cogito.cv • Oracle Cloud ARM</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-2 rounded-lg border border-slate-700 bg-slate-900/50 p-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                {getStepIcon(step.status)}
                <span
                  className={`text-sm ${
                    step.status === 'success'
                      ? 'text-slate-400'
                      : step.status === 'running'
                        ? 'text-white'
                        : step.status === 'error'
                          ? 'text-red-400'
                          : 'text-slate-500'
                  }`}
                >
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
            Deployment completed successfully!
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={status === 'deploying'}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            {status === 'success' ? 'Close' : 'Cancel'}
          </Button>
          {status !== 'success' && (
            <Button
              onClick={handleDeploy}
              disabled={status === 'deploying'}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
            >
              {status === 'deploying' ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Rocket size={14} className="mr-2" />
                  Deploy Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
