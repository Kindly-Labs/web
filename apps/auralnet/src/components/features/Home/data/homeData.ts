export interface ActivityItem {
  type: 'business' | 'volunteer' | 'impact';
  icon: string;
  text: string;
  time: string;
}

export interface HeroContent {
  tagline: string;
  headline: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  subheadline: string;
  stats: {
    value: string;
    label: string;
  };
}

export interface MissionContent {
  sectionTagline: string;
  headline: {
    prefix: string;
    highlight: string;
    suffix: string;
  };
  description: string;
  cards: {
    title: string;
    description: string;
    icon: 'users' | 'award';
    color: 'terracotta' | 'gold';
  }[];
}

export const homeData = {
  activityFeed: [
    { type: 'impact', icon: '🗣️', text: 'Toishanese Voice Preserved', time: 'Just now' },
    { type: 'volunteer', icon: '🎙️', text: 'Dialect Contributor Rewarded', time: '5m ago' },
    { type: 'business', icon: '🌍', text: 'Cultural AI Model Deployed', time: '22m ago' },
    { type: 'impact', icon: '📖', text: 'Heritage Story Archived', time: '1h ago' },
  ] as ActivityItem[],

  hero: {
    tagline: 'Building AI for All',
    headline: {
      prefix: 'Preserving',
      highlight: 'Heritage',
      suffix: 'Through Voice',
    },
    subheadline:
      "What makes your grandmother's stories extraordinary? Her dialect, her experiences, her voice. We're building AI that understands and preserves the richness of human language—every accent, every dialect, every story.",
    stats: {
      value: 'Active',
      label: 'Preservation Network',
    },
  } as HeroContent,

  mission: {
    sectionTagline: 'Our Mission',
    headline: {
      prefix: 'Bringing Your',
      highlight: 'Dialect',
      suffix: 'Online',
    },
    description:
      "Current AI doesn't understand your grandmother's Toishanese, your uncle's Spanglish, or your neighbor's Patois. We're changing that. By preserving dialects as cultural heritage, we're building AI that serves all of humanity—not just those who speak Standard English.",
    cards: [
      {
        title: 'Guardian of Your Voice',
        description:
          'Preserve your dialect for future generations while gaining AI that truly understands you. Teach Aether your language through our Voice Passport, and unlock lifetime access to culturally-aware AI.',
        icon: 'users',
        color: 'terracotta',
      },
      {
        title: 'Universal Access',
        description:
          "From Chinatown grandmothers checking bus times in Toishanese to global enterprises building culturally-aware products—we're making AI accessible to everyone, in every language.",
        icon: 'award',
        color: 'gold',
      },
    ],
  } as MissionContent,
};
