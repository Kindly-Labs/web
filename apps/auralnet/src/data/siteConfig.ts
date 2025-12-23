export interface SocialLink {
  platform: string;
  url: string;
}

export interface FooterLink {
  text: string;
  href: string;
  external?: boolean;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface DonationTier {
  amount: number;
  label: string;
  url: string;
}

export const siteConfig = {
  metadata: {
    siteName: 'Owly Labs',
    tagline: 'Preserving Heritage Through Voice',
    copyrightYear: new Date().getFullYear(),
  },
  socials: [
    { platform: 'LinkedIn', url: 'https://www.linkedin.com' },
    { platform: 'Instagram', url: 'https://www.instagram.com' },
  ] as SocialLink[],
  newsletter: {
    title: 'Join the Movement',
    description: 'Updates on our mission to preserve human heritage.',
    placeholder: 'Enter your email',
    buttonText: 'Subscribe',
  },
  footer: {
    columns: {
      business: {
        title: 'Platform',
        links: [
          { text: 'Voice OS', href: '/services' },
          { text: 'Heritage Mission', href: '/heritage' },
          { text: 'Governance', href: '/transparency' },
        ],
      },
      volunteer: {
        title: 'Community',
        links: [
          { text: 'Voice Passport', href: '/contribute/voice-passport' },
          { text: 'Terms of Service', href: '/terms' },
          { text: 'Privacy Policy', href: '/privacy' },
        ],
      },
      social: {
        title: 'Connect',
        links: [
          { text: 'Contact Us', href: '/contact' },
          { text: 'LinkedIn', href: 'https://www.linkedin.com', external: true },
          { text: 'Instagram', href: 'https://www.instagram.com', external: true },
        ],
      },
    } as Record<string, FooterColumn>,
    donationTiers: [
      { amount: 50, label: 'Hero', url: '/invest' },
      { amount: 250, label: 'Legend', url: '/invest' },
    ] as DonationTier[],
  },
};
