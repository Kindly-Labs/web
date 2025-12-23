// ============================================================================
// Shared API Types for Aether Platform
// ============================================================================

// ----------------------------------------------------------------------------
// Labeling/Volunteer Types
// ----------------------------------------------------------------------------

export interface Annotator {
  id: string;
  email: string;
  name: string;
  role: string;
  organization?: string;
  qualityScore: number;
  totalLabels: number;
  serviceHours: number;
  labelsThisWeek: number;
  labelsThisMonth: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
  certificatesEarned: string[];
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface BadgeInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: string;
  category: string;
}

export interface CertificateType {
  id: string;
  title: string;
  description: string;
  requirement: string;
}

export interface Certificate {
  id: string;
  annotatorId: string;
  type: string;
  title: string;
  description: string;
  hoursAtIssue: number;
  labelsAtIssue: number;
  issuedAt: string;
}

export interface VolunteerStats {
  totalLabels: number;
  totalHours: number;
  qualityScore: number;
  currentStreak: number;
  longestStreak: number;
  labelsThisWeek: number;
  labelsThisMonth: number;
  badges: string[];
  nextBadge?: BadgeProgress;
  nextCertificate?: CertProgress;
  rank?: number;
}

export interface BadgeProgress {
  badge: string;
  current: number;
  required: number;
  percent: number;
}

export interface CertProgress {
  certificate: string;
  current: number;
  required: number;
  percent: number;
}

export interface LeaderboardEntry {
  rank: number;
  annotatorId: string;
  name: string;
  totalLabels: number;
  serviceHours: number;
  qualityScore: number;
  badges: string[];
}

export interface BadgesResponse {
  earned: BadgeInfo[];
  available: Record<string, BadgeInfo>;
}

export interface LabelingStats {
  totalClips: number;
  pendingClips: number;
  labeledClips: number;
  approvedClips: number;
  totalAnnotators: number;
  activeAnnotators: number;
  totalLabels: number;
  totalHoursLabeled: number;
  avgQualityScore: number;
}

// ----------------------------------------------------------------------------
// Session/Conversation Types
// ----------------------------------------------------------------------------

export interface SessionStartResponse {
  status: string;
  sessionId: string;
  mode?: string;
}

export interface VoiceStateResponse {
  success: boolean;
}

// ----------------------------------------------------------------------------
// Error Types
// ----------------------------------------------------------------------------

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}
