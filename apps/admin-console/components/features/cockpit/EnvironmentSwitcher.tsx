'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Laptop, ChevronDown, Wifi, WifiOff, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useEnvironment } from '@/lib/context/EnvironmentContext';
import { cn } from '@/lib/utils';

export function EnvironmentSwitcher() {
  const {
    environment,
    setEnvironment,
    isAuthenticated,
    productionAuth,
    productionHealth,
    login,
    logout,
  } = useEnvironment();

  const [isOpen, setIsOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);

    const result = await login(loginEmail, loginPassword);

    setIsLoggingIn(false);
    if (result.success) {
      setShowLogin(false);
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setLoginError(result.error || 'Login failed');
    }
  };

  const handleSwitchToProduction = () => {
    if (!isAuthenticated && environment === 'local') {
      setShowLogin(true);
    } else {
      setEnvironment('production');
    }
    setIsOpen(false);
  };

  const handleSwitchToLocal = () => {
    setEnvironment('local');
    setIsOpen(false);
  };

  const getHealthIcon = () => {
    if (environment === 'local') return <Laptop size={14} />;
    if (productionHealth.status === 'checking') return <Loader2 size={14} className="animate-spin" />;
    if (productionHealth.status === 'healthy') return <Wifi size={14} />;
    if (productionHealth.status === 'degraded') return <Wifi size={14} className="text-amber-400" />;
    return <WifiOff size={14} />;
  };

  const getHealthColor = () => {
    if (environment === 'local') return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    if (productionHealth.status === 'healthy') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (productionHealth.status === 'degraded') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
          getHealthColor(),
          'hover:brightness-110'
        )}
      >
        {getHealthIcon()}
        <span>{environment === 'production' ? 'Production' : 'Local Dev'}</span>
        <ChevronDown size={12} className={cn('transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-lg border border-slate-700 bg-slate-800 shadow-xl"
          >
            {/* Local Option */}
            <button
              onClick={handleSwitchToLocal}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-700/50',
                environment === 'local' && 'bg-slate-700/30'
              )}
            >
              <Laptop size={18} className="text-sky-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Local Development</div>
                <div className="text-xs text-slate-400">localhost:3002</div>
              </div>
              {environment === 'local' && (
                <span className="h-2 w-2 rounded-full bg-sky-400" />
              )}
            </button>

            {/* Divider */}
            <div className="border-t border-slate-700" />

            {/* Production Option */}
            <button
              onClick={handleSwitchToProduction}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-700/50',
                environment === 'production' && 'bg-slate-700/30'
              )}
            >
              <Globe size={18} className="text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Production</div>
                <div className="text-xs text-slate-400">api.cogito.cv</div>
              </div>
              {environment === 'production' && (
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Production Status */}
            {environment === 'production' && (
              <div className="border-t border-slate-700 px-4 py-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {productionHealth.status === 'checking'
                      ? 'Checking...'
                      : `${productionHealth.latencyMs}ms latency`}
                  </span>
                  {productionAuth && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 truncate max-w-[100px]">{productionAuth.email}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          logout();
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <LogOut size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogin(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <Globe size={24} className="text-emerald-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">Connect to Production</h2>
                  <p className="text-sm text-slate-400">Sign in with admin credentials</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="admin@kindly-labs.org"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-400">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700 px-3 py-2 text-sm text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                {loginError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    {loginError}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLogin(false)}
                    className="flex-1 rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {isLoggingIn ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <LogIn size={16} />
                    )}
                    Connect
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
