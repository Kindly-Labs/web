'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  Mic,
  CheckCircle,
  Clock,
  Flame,
  Trophy,
  Award,
  Star,
  Shield,
  Zap,
  Rocket,
  Grid3X3,
} from 'lucide-react';
import { badges, mockUserStats, mockLeaderboard } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

// Calculate progress toward a badge
function getBadgeProgress(badge: typeof badges[0], stats: typeof mockUserStats) {
  let current = 0;

  switch (badge.type) {
    case 'recording':
      current = stats.recordings;
      break;
    case 'validation':
      current = stats.validations;
      break;
    case 'streak':
      current = Math.max(stats.currentStreak, stats.longestStreak);
      break;
    case 'special':
      if (badge.id === 'all-topics') {
        current = stats.topicsCompleted.length;
      } else if (badge.id === 'early-adopter') {
        current = 1; // Already earned if badge exists
      }
      break;
  }

  return {
    current,
    required: badge.requirement,
    percentage: Math.min(100, Math.round((current / badge.requirement) * 100)),
    isComplete: current >= badge.requirement,
  };
}

const iconMap: Record<string, React.ElementType> = {
  mic: Mic,
  award: Award,
  star: Star,
  trophy: Trophy,
  'check-circle': CheckCircle,
  shield: Shield,
  grid: Grid3X3,
  flame: Flame,
  zap: Zap,
  rocket: Rocket,
};

export default function ProgressPage() {
  const earnedBadgeIds = new Set(mockUserStats.earnedBadges);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <h1 className="text-lg font-semibold">My Progress</h1>
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <Mic className="h-5 w-5" />
              <span className="text-sm">Recordings</span>
            </div>
            <p className="text-3xl font-bold">{mockUserStats.recordings}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">Validations</span>
            </div>
            <p className="text-3xl font-bold">{mockUserStats.validations}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <Clock className="h-5 w-5" />
              <span className="text-sm">Service Hours</span>
            </div>
            <p className="text-3xl font-bold">{mockUserStats.serviceHours}h</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-2 flex items-center gap-2 text-neutral-400">
              <Flame className="h-5 w-5" />
              <span className="text-sm">Current Streak</span>
            </div>
            <p className="text-3xl font-bold">{mockUserStats.currentStreak} days</p>
          </div>
        </div>

        {/* Next Badge CTA */}
        {(() => {
          // Find the next badge to earn
          const nextBadge = badges.find((b) => {
            const progress = getBadgeProgress(b, mockUserStats);
            return !progress.isComplete;
          });

          if (nextBadge) {
            const progress = getBadgeProgress(nextBadge, mockUserStats);
            const remaining = progress.required - progress.current;
            const Icon = iconMap[nextBadge.icon] || Award;

            return (
              <div className="mb-8 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
                    <Icon className="h-7 w-7 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-amber-400">Next Badge</p>
                    <h3 className="text-lg font-semibold">{nextBadge.name}</h3>
                    <p className="text-sm text-neutral-400">
                      {remaining} more {nextBadge.type === 'recording' ? 'recordings' : nextBadge.type === 'validation' ? 'validations' : nextBadge.type === 'streak' ? 'days' : 'to go'}!
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-500">{progress.percentage}%</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Badges Section */}
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Badges</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => {
              const Icon = iconMap[badge.icon] || Award;
              const isEarned = earnedBadgeIds.has(badge.id);
              const progress = getBadgeProgress(badge, mockUserStats);

              return (
                <div
                  key={badge.id}
                  className={cn(
                    'flex flex-col gap-3 rounded-xl border p-4 transition-colors',
                    isEarned
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-neutral-800 bg-neutral-900/50'
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-lg',
                        isEarned ? 'bg-amber-500/20' : 'bg-neutral-800'
                      )}
                    >
                      <Icon
                        className={cn('h-6 w-6', isEarned ? 'text-amber-500' : 'text-neutral-600')}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={cn(
                          'font-medium',
                          isEarned ? 'text-neutral-100' : 'text-neutral-400'
                        )}
                      >
                        {badge.name}
                      </h3>
                      <p className="text-sm text-neutral-500">{badge.description}</p>
                    </div>
                    {isEarned && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>

                  {/* Progress bar for unearned badges */}
                  {!isEarned && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-neutral-500">
                        <span>{progress.current} / {progress.required}</span>
                        <span>{progress.percentage}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                        <div
                          className="h-full bg-neutral-600 transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Leaderboard Section */}
        <section>
          <h2 className="mb-4 text-xl font-semibold">Leaderboard</h2>
          <div className="overflow-hidden rounded-xl border border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900">
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-400">
                    Contributor
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                    Recordings
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                    Validations
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-neutral-400">
                    Hours
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockLeaderboard.map((entry) => (
                  <tr
                    key={entry.rank}
                    className={cn(
                      'border-b border-neutral-800/50 transition-colors',
                      entry.isCurrentUser ? 'bg-amber-500/10' : 'hover:bg-neutral-900/50'
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                        {entry.rank === 2 && <Trophy className="h-4 w-4 text-neutral-400" />}
                        {entry.rank === 3 && <Trophy className="h-4 w-4 text-amber-700" />}
                        <span
                          className={cn(
                            'font-medium',
                            entry.rank <= 3 ? 'text-neutral-100' : 'text-neutral-400'
                          )}
                        >
                          #{entry.rank}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          entry.isCurrentUser ? 'font-medium text-amber-500' : 'text-neutral-300'
                        )}
                      >
                        {entry.name}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">{entry.recordings}</td>
                    <td className="px-4 py-3 text-right text-neutral-400">{entry.validations}</td>
                    <td className="px-4 py-3 text-right text-neutral-400">{entry.hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Service Hours Certificate CTA */}
        <section className="mt-8 rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
          <Trophy className="mx-auto mb-3 h-8 w-8 text-green-500" />
          <h3 className="mb-2 text-lg font-semibold">Earn Service Hour Certificates</h3>
          <p className="mb-4 text-sm text-neutral-400">
            Your contributions count! Each recording earns 0.02 hours and each validation earns 0.01
            hours. Request a certificate for school or volunteer credit.
          </p>
          <button className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium transition-colors hover:bg-green-500">
            Request Certificate
          </button>
        </section>
      </main>
    </div>
  );
}
