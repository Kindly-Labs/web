import React from 'react';
import { motion } from 'framer-motion';
import { useSimulatedData, useAnimatedNumber } from '../../../hooks/useSimulatedData';

/**
 * Dashboard Component
 *
 * Displays simulated transparency metrics with growth algorithm.
 *
 * PRD Requirements (Section 4.5):
 * - Simulated Growth Algorithm:
 *   - VolunteerCount = 20 + (monthsPassed * 5.5)
 *   - ImpactDollars = 5000 + (monthsPassed * 4200)
 *   - BusinessesServed = 10 + (monthsPassed * 3.2)
 *   - HoursContributed = 500 + (monthsPassed * 125)
 * - Framer Motion useSpring for animations
 * - Grid of 3-4 GlassCard components
 *
 * Usage:
 * <Dashboard client:load />
 */

interface MetricCardProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  description: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  prefix = '',
  suffix = '',
  description,
}) => {
  const animatedValue = useAnimatedNumber(value, 2000);

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex h-full flex-col">
        <h3 className="text-neon-400 mb-2 font-mono text-sm tracking-wider uppercase">{label}</h3>
        <div className="flex-grow">
          <motion.div
            className="text-text-light mb-2 font-mono text-4xl font-bold"
            initial={{ scale: 0.5 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            {prefix}
            {animatedValue.toLocaleString()}
            {suffix}
          </motion.div>
          <p className="text-text-muted text-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  // Get simulated data based on time since launch
  const data = useSimulatedData(new Date('2024-01-01'));

  const metrics: MetricCardProps[] = [
    {
      label: 'Active Volunteers',
      value: data.volunteerCount,
      description: 'Community members contributing their expertise',
    },
    {
      label: 'Businesses Served',
      value: data.businessesServed,
      description: 'Local small businesses receiving support',
    },
    {
      label: 'Economic Impact',
      value: data.impactDollars,
      prefix: '$',
      description: 'Estimated value of services provided',
    },
    {
      label: 'Hours Contributed',
      value: data.hoursContributed,
      description: 'Total volunteer hours invested in the community',
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12">
      {/* Section Header */}
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-text-light mb-4 font-mono text-4xl font-bold">
          Transparency Dashboard
        </h2>
        <p className="text-text-muted mx-auto max-w-2xl text-lg">
          Real-time metrics tracking our community impact and growth. All data is openly shared as
          part of our commitment to radical transparency.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Growth Indicator */}
      <motion.div
        className="mt-8 text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
      >
        <div className="glass-hud inline-flex items-center gap-2 px-4 py-2">
          <span className="text-neon-400 text-xl">↗</span>
          <span className="text-text-light font-mono text-sm">Growing since January 2024</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
