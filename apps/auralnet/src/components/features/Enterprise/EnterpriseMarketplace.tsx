import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MOCK_PACKAGES,
  MOCK_PURCHASES,
  TIER_INFO,
  formatPrice,
  type SalesPackage,
} from '../../../data/enterprise-data';

/**
 * EnterpriseMarketplace Component
 *
 * Data licensing marketplace for enterprise customers.
 * Displays audio dataset packages with tier-based pricing.
 */

type TierFilter = 'all' | 'research' | 'commercial' | 'sovereign';

export default function EnterpriseMarketplace() {
  const [selectedTier, setSelectedTier] = useState<TierFilter>('all');
  const [cart, setCart] = useState<string[]>([]);

  const filteredPackages = MOCK_PACKAGES.filter(
    (pkg) => selectedTier === 'all' || pkg.licensing.tier === selectedTier
  );

  const addToCart = (packageId: string) => {
    if (!cart.includes(packageId)) {
      setCart([...cart, packageId]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20 p-8 backdrop-blur-md"
      >
        <div className="max-w-2xl">
          <h2 className="text-text-light mb-4 text-3xl font-bold">
            Enterprise-Grade Audio Datasets
          </h2>
          <p className="text-text-muted mb-6">
            High-quality, validated audio recordings for training and evaluating AI systems.
            Double-blind validated. Community-sourced. Ethically licensed.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-green-400">
              <CheckIcon />
              <span>98%+ Validation Rate</span>
            </div>
            <div className="flex items-center gap-2 text-blue-400">
              <UsersIcon />
              <span>100+ Contributors</span>
            </div>
            <div className="flex items-center gap-2 text-purple-400">
              <ShieldIcon />
              <span>Fair Trade Licensed</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tier Filter */}
      <div className="flex items-center gap-4">
        <span className="text-text-muted text-sm">Filter by license:</span>
        {(['all', 'research', 'commercial', 'sovereign'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedTier(tier)}
            className={`rounded-lg border px-4 py-2 font-mono text-sm tracking-wider uppercase transition-all ${
              selectedTier === tier
                ? 'bg-neon-400/20 border-neon-400/50 text-neon-400'
                : 'bg-glass-surface/30 text-text-muted hover:text-text-light border-white/10 hover:border-white/20'
            } `}
          >
            {tier === 'all' ? 'All' : tier}
          </button>
        ))}

        {cart.length > 0 && (
          <div className="ml-auto flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/20 px-4 py-2 text-blue-400">
            <CartIcon />
            <span className="font-mono text-sm">{cart.length} in cart</span>
          </div>
        )}
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredPackages.map((pkg, index) => (
          <PackageCard
            key={pkg.id}
            package={pkg}
            onAddToCart={() => addToCart(pkg.id)}
            inCart={cart.includes(pkg.id)}
            index={index}
          />
        ))}
      </div>

      {/* My Purchases */}
      {MOCK_PURCHASES.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-glass-surface/30 rounded-xl border border-white/10 p-6 backdrop-blur-md"
        >
          <h3 className="text-text-light mb-4 flex items-center gap-2 text-lg font-bold">
            <DownloadIcon className="text-green-400" />
            My Purchases
          </h3>
          <div className="space-y-3">
            {MOCK_PURCHASES.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4"
              >
                <div>
                  <p className="text-text-light font-semibold">{purchase.packageName}</p>
                  <p className="text-text-muted text-xs">
                    Purchased {new Date(purchase.purchasedAt).toLocaleDateString()} · Downloaded{' '}
                    {purchase.downloadCount} times
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-text-muted hover:text-text-light flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm transition-colors hover:bg-white/10">
                    <FileIcon size={14} />
                    License
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-sm text-green-400 transition-colors hover:bg-green-500/30">
                    <DownloadIcon size={14} />
                    Re-download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pricing Tiers Explanation */}
      <div className="bg-glass-surface/30 rounded-xl border border-white/10 p-6 backdrop-blur-md">
        <h3 className="text-text-light mb-6 text-lg font-bold">Licensing Tiers</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {Object.entries(TIER_INFO).map(([key, tier]) => (
            <TierCard key={key} tier={tier} />
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="py-8 text-center">
        <p className="text-text-muted mb-4">
          Need a custom dataset or have questions about licensing?
        </p>
        <a
          href="mailto:enterprise@auralnet.ai"
          className="bg-neon-400 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-bold text-black transition-transform hover:scale-105"
        >
          <span>Contact Enterprise Sales</span>
          <ExternalLinkIcon size={16} />
        </a>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------------

interface PackageCardProps {
  package: SalesPackage;
  onAddToCart: () => void;
  inCart: boolean;
  index: number;
}

function PackageCard({ package: pkg, onAddToCart, inCart, index }: PackageCardProps) {
  const tierColors = {
    research: 'blue',
    commercial: 'green',
    sovereign: 'purple',
  } as const;
  const color = tierColors[pkg.licensing.tier];
  const isDraft = pkg.status === 'draft';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`overflow-hidden rounded-xl border backdrop-blur-md ${isDraft ? 'opacity-60' : ''} ${color === 'blue' ? 'border-blue-500/30 bg-blue-900/10' : ''} ${color === 'green' ? 'border-green-500/30 bg-green-900/10' : ''} ${color === 'purple' ? 'border-purple-500/30 bg-purple-900/10' : ''} `}
    >
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h3 className="text-text-light text-lg font-bold">{pkg.name}</h3>
            <p className="text-text-muted mt-1 text-xs">v{pkg.version}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${color === 'blue' ? 'bg-blue-500/20 text-blue-400' : ''} ${color === 'green' ? 'bg-green-500/20 text-green-400' : ''} ${color === 'purple' ? 'bg-purple-500/20 text-purple-400' : ''} `}
          >
            {pkg.licensing.tier}
          </span>
        </div>
        <p className="text-text-muted line-clamp-2 text-sm">{pkg.description}</p>
      </div>

      {/* Stats */}
      <div className="border-b border-white/10 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-text-light text-2xl font-bold">
              {pkg.stats.totalClips.toLocaleString()}
            </p>
            <p className="text-text-muted text-xs">Clips</p>
          </div>
          <div className="text-center">
            <p className="text-text-light text-2xl font-bold">
              {pkg.stats.totalDurationHours.toFixed(1)}h
            </p>
            <p className="text-text-muted text-xs">Duration</p>
          </div>
          <div className="text-center">
            <p className="text-text-light text-2xl font-bold">{pkg.stats.uniqueSpeakers}</p>
            <p className="text-text-muted text-xs">Speakers</p>
          </div>
        </div>
      </div>

      {/* Quality Indicators */}
      <div className="flex items-center justify-center gap-6 border-b border-white/10 p-4 text-xs">
        <div className="flex items-center gap-1.5">
          <StarIcon className="text-yellow-400" size={14} />
          <span className="text-text-muted">{pkg.stats.avgQualityScore.toFixed(1)}/5</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckIcon className="text-green-400" size={14} />
          <span className="text-text-muted">{pkg.stats.validationRate.toFixed(1)}% validated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ClockIcon className="text-blue-400" size={14} />
          <span className="text-text-muted">{pkg.format.audio}</span>
        </div>
      </div>

      {/* Samples */}
      {pkg.samples.length > 0 && (
        <div className="border-b border-white/10 p-4">
          <p className="text-text-muted mb-2 text-xs">Preview Samples</p>
          <div className="flex gap-2">
            {pkg.samples.slice(0, 2).map((sample, i) => (
              <button
                key={i}
                className="text-text-muted hover:text-text-light flex items-center gap-2 rounded border border-white/5 bg-white/5 px-3 py-1.5 text-xs transition-colors"
              >
                <PlayIcon size={12} />
                <span className="max-w-[100px] truncate">{sample.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between p-6">
        <div>
          <p className="text-text-light text-2xl font-bold">{formatPrice(pkg.licensing.price)}</p>
          <p className="text-text-muted text-xs">One-time license</p>
        </div>

        {isDraft ? (
          <button className="text-text-muted flex cursor-not-allowed items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
            <BellIcon size={16} />
            <span>Notify Me</span>
          </button>
        ) : inCart ? (
          <button className="flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/20 px-4 py-2 text-green-400">
            <CheckIcon size={16} />
            <span>In Cart</span>
          </button>
        ) : (
          <button
            onClick={onAddToCart}
            className="bg-neon-400 flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-black transition-transform hover:scale-105"
          >
            <CartIcon size={16} />
            <span>Add to Cart</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface TierCardProps {
  tier: (typeof TIER_INFO)[keyof typeof TIER_INFO];
}

function TierCard({ tier }: TierCardProps) {
  const colorClasses = {
    blue: 'border-blue-500/30',
    green: 'border-green-500/30',
    purple: 'border-purple-500/30',
  } as const;

  return (
    <div
      className={`relative rounded-xl border bg-white/5 p-6 ${colorClasses[tier.color as keyof typeof colorClasses]} ${'recommended' in tier && tier.recommended ? 'ring-2 ring-green-500/50' : ''} `}
    >
      {'recommended' in tier && tier.recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-black">
          Recommended
        </span>
      )}
      <div className="mb-4 flex items-center gap-3">
        {tier.color === 'blue' && <FileIcon className="text-blue-400" />}
        {tier.color === 'green' && <PackageIcon className="text-green-400" />}
        {tier.color === 'purple' && <ShieldIcon className="text-purple-400" />}
        <h4 className="text-text-light font-bold">{tier.name}</h4>
      </div>
      <p className="text-text-light mb-4 text-2xl font-bold">{tier.price}</p>
      <ul className="space-y-2">
        {tier.features.map((feature, i) => (
          <li key={i} className="text-text-muted flex items-center gap-2 text-sm">
            <CheckIcon size={14} className="text-green-400" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ----------------------------------------------------------------------------
// ICONS (Simple inline SVGs to avoid lucide-react import issues in Astro)
// ----------------------------------------------------------------------------

function CheckIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function UsersIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function ShieldIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}

function CartIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function DownloadIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function FileIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10,9 9,9 8,9" />
    </svg>
  );
}

function PackageIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27,6.96 12,12.01 20.73,6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  );
}

function StarIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

function ClockIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

function PlayIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

function BellIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ExternalLinkIcon({ className = '', size = 16 }: { className?: string; size?: number }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
