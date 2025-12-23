// Mock data for the Dialect Workflow Portal
// This simulates a database until backend is connected

export type UserRole = 'owly_admin' | 'dialect_admin' | 'expert' | 'partner';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  assignedDialects?: string[];
  avatar?: string;
}

export interface Dialect {
  id: string;
  name: string;
  region: string;
  status: 'pilot' | 'active' | 'archived';
  dialectAdminId: string;
  targetSamples: number;
  completedSamples: number;
  createdAt: string;
}

export interface Topic {
  id: string;
  dialectId: string;
  name: string;
  description: string;
  category: 'safety' | 'cultural' | 'general' | 'specialized';
  isSensitive: boolean;
  status: 'draft' | 'active' | 'in_progress' | 'pending_review' | 'admin_review' | 'ready_for_sale';
  phraseCount: number;
  completedPhrases: number;
}

export interface Phrase {
  id: string;
  topicId: string;
  dialectId: string;
  text: string;
  englishHint: string;
  culturalNote?: string;
  requiredTasks: ('record' | 'transcribe' | 'validate')[];
  status: 'pending' | 'in_progress' | 'completed' | 'needs_review';
  paymentPerTask: number;
  validationCount: number;
  requiredValidations: number;
}

export interface ExpertApplication {
  id: string;
  name: string;
  email: string;
  dialects: string[];
  howLearned: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

// ============================================
// MOCK USERS
// ============================================

export const DEMO_USERS: User[] = [
  {
    id: 'admin-001',
    email: 'admin@owlylabs.com',
    name: 'Adrian Chen',
    role: 'owly_admin',
  },
  {
    id: 'dialect-admin-001',
    email: 'toisan@owlylabs.com',
    name: 'Mei Lin',
    role: 'dialect_admin',
    assignedDialects: ['toishanese-001'],
  },
  {
    id: 'expert-001',
    email: 'expert@owlylabs.com',
    name: 'Wei Chen',
    role: 'expert',
    assignedDialects: ['toishanese-001'],
  },
  {
    id: 'partner-001',
    email: 'demo@owlylabs.com',
    name: 'Demo Partner',
    role: 'partner',
  },
];

// Password is always 'demo123' for all demo accounts
export const DEMO_PASSWORD = 'demo123';

// ============================================
// MOCK DIALECTS
// ============================================

export const DIALECTS: Dialect[] = [
  {
    id: 'toishanese-001',
    name: 'Toishanese',
    region: 'Guangdong, China / San Francisco',
    status: 'pilot',
    dialectAdminId: 'dialect-admin-001',
    targetSamples: 100,
    completedSamples: 47,
    createdAt: '2025-12-01',
  },
  {
    id: 'cantonese-001',
    name: 'Cantonese (Urban)',
    region: 'Hong Kong / Guangzhou',
    status: 'active',
    dialectAdminId: 'dialect-admin-001',
    targetSamples: 500,
    completedSamples: 156,
    createdAt: '2025-11-15',
  },
];

// ============================================
// MOCK TOPICS
// ============================================

export const TOPICS: Topic[] = [
  // Toishanese topics
  {
    id: 'topic-001',
    dialectId: 'toishanese-001',
    name: 'Offensive Language Detection',
    description: 'Slurs, profanity, and culturally sensitive terms in Toishanese',
    category: 'safety',
    isSensitive: true,
    status: 'in_progress',
    phraseCount: 25,
    completedPhrases: 8,
  },
  {
    id: 'topic-002',
    dialectId: 'toishanese-001',
    name: 'Market Haggling',
    description: 'Common phrases used when shopping at traditional markets',
    category: 'cultural',
    isSensitive: false,
    status: 'active',
    phraseCount: 15,
    completedPhrases: 12,
  },
  {
    id: 'topic-003',
    dialectId: 'toishanese-001',
    name: 'Family Terms',
    description: 'Kinship terms and family-related expressions',
    category: 'general',
    isSensitive: false,
    status: 'ready_for_sale',
    phraseCount: 20,
    completedPhrases: 20,
  },
  {
    id: 'topic-004',
    dialectId: 'toishanese-001',
    name: 'Medical Phrases',
    description: 'Health and medical vocabulary for elder care',
    category: 'specialized',
    isSensitive: false,
    status: 'draft',
    phraseCount: 0,
    completedPhrases: 0,
  },
  // Cantonese topics
  {
    id: 'topic-005',
    dialectId: 'cantonese-001',
    name: 'Urban Slang',
    description: 'Modern slang from Hong Kong youth culture',
    category: 'cultural',
    isSensitive: false,
    status: 'active',
    phraseCount: 50,
    completedPhrases: 35,
  },
];

// ============================================
// MOCK PHRASES
// ============================================

export const PHRASES: Phrase[] = [
  {
    id: 'phrase-001',
    topicId: 'topic-002',
    dialectId: 'toishanese-001',
    text: 'Dim gai gum gwai?',
    englishHint: 'Why so expensive?',
    culturalNote: 'Classic market haggling opener',
    requiredTasks: ['record', 'transcribe', 'validate'],
    status: 'pending',
    paymentPerTask: 0.5,
    validationCount: 0,
    requiredValidations: 2,
  },
  {
    id: 'phrase-002',
    topicId: 'topic-002',
    dialectId: 'toishanese-001',
    text: 'Peng di la!',
    englishHint: 'Make it cheaper!',
    culturalNote: 'Direct request for discount',
    requiredTasks: ['record', 'transcribe', 'validate'],
    status: 'in_progress',
    paymentPerTask: 0.5,
    validationCount: 1,
    requiredValidations: 2,
  },
  {
    id: 'phrase-003',
    topicId: 'topic-002',
    dialectId: 'toishanese-001',
    text: 'Gei chin?',
    englishHint: 'How much?',
    culturalNote: 'Basic price inquiry',
    requiredTasks: ['record', 'transcribe', 'validate'],
    status: 'completed',
    paymentPerTask: 0.5,
    validationCount: 2,
    requiredValidations: 2,
  },
  {
    id: 'phrase-004',
    topicId: 'topic-003',
    dialectId: 'toishanese-001',
    text: 'Ni sik fan mei?',
    englishHint: 'Have you eaten?',
    culturalNote: 'Traditional greeting, like asking "How are you?"',
    requiredTasks: ['record', 'transcribe', 'validate'],
    status: 'completed',
    paymentPerTask: 0.5,
    validationCount: 2,
    requiredValidations: 2,
  },
  {
    id: 'phrase-005',
    topicId: 'topic-001',
    dialectId: 'toishanese-001',
    text: '[REDACTED - Offensive Term #1]',
    englishHint: 'Culturally insensitive term',
    culturalNote: 'Used as slur against outsiders',
    requiredTasks: ['record', 'transcribe', 'validate'],
    status: 'pending',
    paymentPerTask: 1.0, // Higher rate for sensitive content
    validationCount: 0,
    requiredValidations: 2,
  },
];

// ============================================
// MOCK APPLICATIONS
// ============================================

export const APPLICATIONS: ExpertApplication[] = [
  {
    id: 'app-001',
    name: 'Lily Wong',
    email: 'lily.wong@gmail.com',
    dialects: ['Toishanese', 'Cantonese'],
    howLearned: 'Native speaker, grew up in SF Chinatown',
    status: 'pending',
    submittedAt: '2025-12-15',
  },
  {
    id: 'app-002',
    name: 'James Chen',
    email: 'jchen@berkeley.edu',
    dialects: ['Toishanese'],
    howLearned: 'Learned from grandparents in Taishan',
    status: 'pending',
    submittedAt: '2025-12-14',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getUserByEmail(email: string): User | undefined {
  return DEMO_USERS.find((u) => u.email === email);
}

export function getDialectsByAdmin(adminId: string): Dialect[] {
  return DIALECTS.filter((d) => d.dialectAdminId === adminId);
}

export function getTopicsByDialect(dialectId: string): Topic[] {
  return TOPICS.filter((t) => t.dialectId === dialectId);
}

export function getPhrasesByTopic(topicId: string): Phrase[] {
  return PHRASES.filter((p) => p.topicId === topicId);
}

export function getAvailableTasks(dialectId?: string): Phrase[] {
  return PHRASES.filter((p) => p.status === 'pending' && (!dialectId || p.dialectId === dialectId));
}

export function getPendingApplications(): ExpertApplication[] {
  return APPLICATIONS.filter((a) => a.status === 'pending');
}
