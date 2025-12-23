'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bus,
  Stethoscope,
  Building2,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Phone,
  Home,
  Mic,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import WelcomeModal from '@/components/WelcomeModal';
import { getTopicCoverageSummary, topicCoverage } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { fetchWorkbenchStats, type WorkbenchStats } from '@/lib/api';

const WELCOME_SEEN_KEY = 'aether_workbench_welcome_seen';

const topics = [
  {
    id: 'transit',
    name: 'Transit',
    icon: Bus,
    description: 'Bus, train, and transportation phrases',
    color: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
  },
  {
    id: 'medical',
    name: 'Medical',
    icon: Stethoscope,
    description: 'Healthcare and doctor visit vocabulary',
    color: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
  },
  {
    id: 'banking',
    name: 'Banking',
    icon: Building2,
    description: 'Financial and banking terminology',
    color: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingCart,
    description: 'Retail and marketplace phrases',
    color: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
  },
  {
    id: 'family',
    name: 'Family',
    icon: Users,
    description: 'Family relationships and gatherings',
    color: 'bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/30',
  },
  {
    id: 'food',
    name: 'Food',
    icon: UtensilsCrossed,
    description: 'Dining and food-related expressions',
    color: 'bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/30',
  },
  {
    id: 'phone',
    name: 'Phone',
    icon: Phone,
    description: 'Telephone conversations and calls',
    color: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/30',
  },
  {
    id: 'home',
    name: 'Home',
    icon: Home,
    description: 'Household and daily life phrases',
    color: 'bg-yellow-500/10 hover:bg-yellow-500/20 border-yellow-500/30',
  },
];

export default function LandingPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [stats, setStats] = useState<WorkbenchStats | null>(null);

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem(WELCOME_SEEN_KEY);
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }

    // Fetch real stats from backend
    fetchWorkbenchStats().then(setStats);
  }, []);

  const handleCloseWelcome = () => {
    localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    setShowWelcome(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Welcome Modal for first-time visitors */}
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Aether Workbench</h1>
                <p className="text-xs text-neutral-400">Toishanese Data Collection</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/progress"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              >
                <Trophy className="h-4 w-4" />
                My Progress
              </Link>
              <Link
                href="/validate"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100"
              >
                <CheckCircle className="h-4 w-4" />
                Validate
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold">Help Preserve Toishanese</h2>
          <p className="mb-6 text-lg text-neutral-400">
            Your voice contributions help train AI to understand and speak Toishanese, keeping this
            endangered dialect alive for future generations.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Record phrases</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>Validate recordings</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>Earn badges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Topic Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-6">
          <h3 className="mb-8 text-center text-2xl font-semibold">
            Choose a Topic to Start Recording
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topics.map((topic) => {
              const Icon = topic.icon;
              const coverage = getTopicCoverageSummary(topic.id);
              const needsHelp = coverage.needsRecordings > 0;

              return (
                <Link
                  key={topic.id}
                  href={`/record?topic=${topic.id}`}
                  className={`group rounded-xl border p-6 transition-all ${topic.color}`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-800 transition-transform group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    {needsHelp && (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400">
                        Needs help
                      </span>
                    )}
                  </div>
                  <h4 className="mb-1 text-lg font-medium">{topic.name}</h4>
                  <p className="mb-3 text-sm text-neutral-400">{topic.description}</p>

                  {/* Coverage mini-heatmap */}
                  <div className="flex gap-1">
                    {topicCoverage[topic.id]?.map((phrase) => {
                      const level =
                        phrase.recordings >= 10
                          ? 'bg-green-500'
                          : phrase.recordings >= 5
                            ? 'bg-yellow-500'
                            : phrase.recordings >= 1
                              ? 'bg-orange-500'
                              : 'bg-neutral-700';
                      return (
                        <div
                          key={phrase.phraseId}
                          className={cn('h-2 flex-1 rounded-sm transition-colors', level)}
                          title={`${phrase.recordings} recordings`}
                        />
                      );
                    })}
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    {coverage.totalRecordings} recordings • {coverage.percentComplete}% complete
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-neutral-800 bg-neutral-900/30 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-amber-500">
                {stats?.totalRecordings ?? '—'}
              </div>
              <div className="text-sm text-neutral-400">Recordings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-500">
                {stats ? stats.validatedRecordings + stats.approvedRecordings : '—'}
              </div>
              <div className="text-sm text-neutral-400">Validated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-500">
                {stats?.goldenSamples ?? '—'}
              </div>
              <div className="text-sm text-neutral-400">Golden Samples</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-500">
                {stats?.totalDurationHours?.toFixed(1) ?? '—'}h
              </div>
              <div className="text-sm text-neutral-400">Audio Duration</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-neutral-500">
          Part of the Aether Platform for endangered language preservation
        </div>
      </footer>
    </div>
  );
}
