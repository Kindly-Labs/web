// ============================================================================
// AURALNET ENTERPRISE - DATA & TYPES
// ============================================================================

// ----------------------------------------------------------------------------
// TYPE DEFINITIONS
// ----------------------------------------------------------------------------

export interface PackageStats {
  totalClips: number;
  totalDurationHours: number;
  uniqueSpeakers: number;
  avgQualityScore: number;
  validationRate: number;
  phrasesCovered: number;
}

export interface PackageFormat {
  audio: 'wav_16k' | 'wav_44k' | 'mp3_320' | 'flac';
  labels: 'jsonl' | 'csv' | 'huggingface' | 'kaldi';
  structure: 'flat' | 'by_speaker' | 'by_topic';
}

export interface PackageLicensing {
  tier: 'research' | 'commercial' | 'sovereign';
  price: number; // In cents
  currency: 'usd';
  restrictions: string[];
  attribution: boolean;
}

export interface PackageSample {
  audioUrl: string;
  text: string;
  duration: number;
}

export interface SalesPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  topics: string[];
  stats: PackageStats;
  format: PackageFormat;
  licensing: PackageLicensing;
  samples: PackageSample[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  publishedAt?: string;
}

export interface PackagePurchase {
  id: string;
  packageId: string;
  packageName: string;
  buyerId: string;
  buyerOrg: string;
  licenseTier: 'research' | 'commercial' | 'sovereign';
  price: number;
  currency: 'usd';
  downloadUrl?: string;
  downloadCount: number;
  purchasedAt: string;
  expiresAt?: string;
}

// ----------------------------------------------------------------------------
// PRICING CONSTANTS
// ----------------------------------------------------------------------------

export const PACKAGE_PRICING = {
  research: 2500_00, // $2,500
  commercial: 10000_00, // $10,000
  sovereign: 50000_00, // $50,000
};

// ----------------------------------------------------------------------------
// MOCK DATA
// ----------------------------------------------------------------------------

export const MOCK_PACKAGES: SalesPackage[] = [
  {
    id: 'pkg_toishanese_transit_v1',
    name: 'Toishanese Transit Corpus v1.0',
    description:
      'High-quality audio recordings of transit-related phrases in Toishanese dialect. Includes bus, BART, directions, and taxi conversations.',
    version: '1.0.0',
    topics: ['transit'],
    stats: {
      totalClips: 1247,
      totalDurationHours: 3.2,
      uniqueSpeakers: 89,
      avgQualityScore: 4.7,
      validationRate: 98.2,
      phrasesCovered: 45,
    },
    format: {
      audio: 'wav_16k',
      labels: 'jsonl',
      structure: 'by_topic',
    },
    licensing: {
      tier: 'commercial',
      price: PACKAGE_PRICING.commercial,
      currency: 'usd',
      restrictions: ['No redistribution', 'Attribution required'],
      attribution: true,
    },
    samples: [
      { audioUrl: '/samples/transit_001.wav', text: '三十號巴士幾時嚟呀？', duration: 2.3 },
      { audioUrl: '/samples/transit_002.wav', text: '呢架巴士去唔去唐人街？', duration: 2.8 },
    ],
    status: 'published',
    createdAt: '2025-12-01T00:00:00Z',
    publishedAt: '2025-12-15T00:00:00Z',
  },
  {
    id: 'pkg_toishanese_medical_v05',
    name: 'Toishanese Medical Corpus v0.5 (Beta)',
    description:
      'Medical and healthcare-related phrases including symptoms, pharmacy, and appointment scheduling. Currently in beta with ongoing collection.',
    version: '0.5.0',
    topics: ['medical'],
    stats: {
      totalClips: 423,
      totalDurationHours: 1.1,
      uniqueSpeakers: 34,
      avgQualityScore: 4.5,
      validationRate: 95.1,
      phrasesCovered: 20,
    },
    format: {
      audio: 'wav_16k',
      labels: 'jsonl',
      structure: 'by_topic',
    },
    licensing: {
      tier: 'research',
      price: PACKAGE_PRICING.research,
      currency: 'usd',
      restrictions: ['Research use only', 'No commercial deployment'],
      attribution: true,
    },
    samples: [],
    status: 'draft',
    createdAt: '2025-12-10T00:00:00Z',
  },
  {
    id: 'pkg_toishanese_family_v1',
    name: 'Toishanese Family & Greetings v1.0',
    description:
      'Cultural greetings, family terms, honorifics, and celebration phrases. Essential for culturally-aware AI systems.',
    version: '1.0.0',
    topics: ['family', 'greetings'],
    stats: {
      totalClips: 892,
      totalDurationHours: 2.4,
      uniqueSpeakers: 67,
      avgQualityScore: 4.8,
      validationRate: 99.1,
      phrasesCovered: 50,
    },
    format: {
      audio: 'wav_16k',
      labels: 'jsonl',
      structure: 'by_topic',
    },
    licensing: {
      tier: 'commercial',
      price: PACKAGE_PRICING.commercial,
      currency: 'usd',
      restrictions: ['No redistribution', 'Attribution required'],
      attribution: true,
    },
    samples: [{ audioUrl: '/samples/family_001.wav', text: '阿婆，你好嘛？', duration: 1.8 }],
    status: 'published',
    createdAt: '2025-11-20T00:00:00Z',
    publishedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'pkg_dli_foundation',
    name: 'DLI Toishanese Foundation (17 hrs)',
    description:
      'Defense Language Institute Toishanese Basic Course. 17+ hours of structured audio with aligned textbook transcriptions.',
    version: '1.0.0',
    topics: ['foundation', 'structured'],
    stats: {
      totalClips: 1306,
      totalDurationHours: 17.2,
      uniqueSpeakers: 12,
      avgQualityScore: 4.9,
      validationRate: 100,
      phrasesCovered: 1306,
    },
    format: {
      audio: 'wav_16k',
      labels: 'jsonl',
      structure: 'by_speaker',
    },
    licensing: {
      tier: 'sovereign',
      price: PACKAGE_PRICING.sovereign,
      currency: 'usd',
      restrictions: ['Exclusive license', 'No sublicensing', 'Air-gapped deployment supported'],
      attribution: false,
    },
    samples: [],
    status: 'published',
    createdAt: '2025-10-01T00:00:00Z',
    publishedAt: '2025-10-15T00:00:00Z',
  },
];

export const MOCK_PURCHASES: PackagePurchase[] = [
  {
    id: 'pur_001',
    packageId: 'pkg_dli_foundation',
    packageName: 'DLI Toishanese Foundation',
    buyerId: 'partner-001',
    buyerOrg: 'Demo Partner',
    licenseTier: 'sovereign',
    price: PACKAGE_PRICING.sovereign,
    currency: 'usd',
    purchasedAt: '2025-12-01T00:00:00Z',
    downloadCount: 3,
  },
];

// ----------------------------------------------------------------------------
// TIER METADATA
// ----------------------------------------------------------------------------

export const TIER_INFO = {
  research: {
    name: 'Research',
    price: '$2,500',
    color: 'blue',
    icon: 'FileText',
    features: [
      'Academic use only',
      'No commercial deployment',
      'Attribution required',
      'Standard support',
    ],
  },
  commercial: {
    name: 'Commercial',
    price: '$10,000',
    color: 'green',
    icon: 'Package',
    features: [
      'Full commercial rights',
      'Production deployment',
      'Attribution required',
      'Priority support',
    ],
    recommended: true,
  },
  sovereign: {
    name: 'Sovereign',
    price: '$50,000',
    color: 'purple',
    icon: 'Shield',
    features: [
      'Exclusive license option',
      'Air-gapped deployment',
      'No attribution required',
      'Dedicated support',
    ],
  },
} as const;

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export function getPackageById(id: string): SalesPackage | undefined {
  return MOCK_PACKAGES.find((pkg) => pkg.id === id);
}

export function getPublishedPackages(): SalesPackage[] {
  return MOCK_PACKAGES.filter((pkg) => pkg.status === 'published');
}

export function getPackagesByTier(tier: 'research' | 'commercial' | 'sovereign'): SalesPackage[] {
  return MOCK_PACKAGES.filter((pkg) => pkg.licensing.tier === tier);
}

export function getPurchasesByBuyer(buyerId: string): PackagePurchase[] {
  return MOCK_PURCHASES.filter((p) => p.buyerId === buyerId);
}
