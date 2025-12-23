export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  trend: string;
  color: string; // 'neon-400' | 'secondary' | 'accent-blue' | 'accent'
  prefix?: string;
}

export interface ImpactInsight {
  icon: string; // Emoji or simple text representation
  text: string;
  highlight: string;
}

export const impactMetrics: ImpactMetric[] = [
  {
    id: 'volunteers',
    label: 'Founding Team',
    value: 1,
    trend: 'Recruiting Now',
    color: 'neon-400',
  },
  {
    id: 'businesses',
    label: 'Pilot Cohort',
    value: 3,
    trend: 'Launching Soon',
    color: 'secondary',
  },
  {
    id: 'hours',
    label: 'Founder Hours',
    value: 100,
    trend: 'Sweat Equity',
    color: 'accent-blue',
  },
  {
    id: 'impact',
    label: 'Projected Impact',
    value: 0,
    trend: 'Unlimited Potential',
    color: 'accent',
    prefix: '$',
  },
];

export const impactInsights: ImpactInsight[] = [
  {
    icon: '📍',
    text: 'Starting in',
    highlight: 'The Mission District',
  },
  {
    icon: '🚀',
    text: 'Goal',
    highlight: '3 days from inquiry to live website',
  },
  {
    icon: '💡',
    text: '',
    highlight: '100% of businesses',
  },
];

// Revised Insight Structure for better flexibility
export interface FlexibleInsight {
  icon: string;
  content: {
    pre?: string;
    highlight: string;
    post?: string;
  };
}

export const insights: FlexibleInsight[] = [
  {
    icon: '📍',
    content: {
      pre: 'Starting in',
      highlight: 'The Mission District',
    },
  },
  {
    icon: '🚀',
    content: {
      pre: 'Target',
      highlight: '3 Days',
      post: 'from inquiry to live website',
    },
  },
  {
    icon: '💡',
    content: {
      highlight: '100% Focused',
      post: 'on economic empowerment',
    },
  },
];
