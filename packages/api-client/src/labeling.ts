// ============================================================================
// Labeling API Client
// ============================================================================

import { BaseApiClient, ClientConfig } from './base-client';
import type {
  Annotator,
  BadgeInfo,
  BadgesResponse,
  Certificate,
  CertificateType,
  LabelingStats,
  LeaderboardEntry,
  VolunteerStats,
} from './types';

export class LabelingApiClient extends BaseApiClient {
  constructor(config: ClientConfig) {
    super(config);
  }

  // ---------------------------------------------------------------------------
  // Annotator Registration & Profile
  // ---------------------------------------------------------------------------

  async registerAnnotator(data: {
    email: string;
    name: string;
    role?: string;
    organization?: string;
  }): Promise<Annotator> {
    return this.post<Annotator>('/api/labeling/annotators', data);
  }

  async getAnnotator(idOrEmail: string): Promise<Annotator> {
    return this.get<Annotator>(`/api/labeling/annotators/${encodeURIComponent(idOrEmail)}`);
  }

  async listAnnotators(): Promise<Annotator[]> {
    return this.get<Annotator[]>('/api/labeling/annotators');
  }

  // ---------------------------------------------------------------------------
  // Volunteer Stats & Progress
  // ---------------------------------------------------------------------------

  async getVolunteerStats(annotatorId: string): Promise<VolunteerStats> {
    return this.get<VolunteerStats>(`/api/labeling/volunteers/${annotatorId}/stats`);
  }

  async getVolunteerBadges(annotatorId: string): Promise<BadgesResponse> {
    return this.get<BadgesResponse>(`/api/labeling/volunteers/${annotatorId}/badges`);
  }

  async getVolunteerCertificates(annotatorId: string): Promise<Certificate[]> {
    return this.get<Certificate[]>(`/api/labeling/volunteers/${annotatorId}/certificates`);
  }

  // ---------------------------------------------------------------------------
  // Certificates
  // ---------------------------------------------------------------------------

  async getCertificate(certificateId: string): Promise<Certificate> {
    return this.get<Certificate>(`/api/labeling/certificates/${certificateId}`);
  }

  // ---------------------------------------------------------------------------
  // Leaderboard
  // ---------------------------------------------------------------------------

  async getLeaderboard(limit: number = 10): Promise<LeaderboardEntry[]> {
    return this.get<LeaderboardEntry[]>(`/api/labeling/leaderboard?limit=${limit}`);
  }

  // ---------------------------------------------------------------------------
  // Badge & Certificate Metadata
  // ---------------------------------------------------------------------------

  async getAllBadges(): Promise<Record<string, BadgeInfo>> {
    return this.get<Record<string, BadgeInfo>>('/api/labeling/badges');
  }

  async getAllCertificateTypes(): Promise<Record<string, CertificateType>> {
    return this.get<Record<string, CertificateType>>('/api/labeling/certificate-types');
  }

  // ---------------------------------------------------------------------------
  // Workbench Operations
  // ---------------------------------------------------------------------------

  async getNextClip(annotatorId: string): Promise<{ message?: string; clip?: unknown }> {
    return this.get(`/api/labeling/workbench/next?annotatorId=${annotatorId}`);
  }

  async submitLabel(
    annotatorId: string,
    data: {
      audioClipId: string;
      labels: Record<string, string>;
      confidence?: number;
    }
  ): Promise<{ status: string; message: string }> {
    return this.request('/api/labeling/workbench/submit', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'X-Annotator-ID': annotatorId,
      },
    });
  }

  async skipClip(
    annotatorId: string,
    audioClipId: string,
    reason?: string
  ): Promise<{ status: string; message: string }> {
    return this.request('/api/labeling/workbench/skip', {
      method: 'POST',
      body: JSON.stringify({ audioClipId, reason }),
      headers: {
        'X-Annotator-ID': annotatorId,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Admin Operations
  // ---------------------------------------------------------------------------

  async verifyVolunteer(
    annotatorId: string,
    adminId?: string
  ): Promise<{ status: string; message: string }> {
    const params = adminId ? `?adminId=${adminId}` : '';
    return this.post(`/api/labeling/admin/volunteers/${annotatorId}/verify${params}`);
  }

  async awardBadge(
    annotatorId: string,
    badge: string
  ): Promise<{ status: string; message: string }> {
    return this.post(`/api/labeling/admin/volunteers/${annotatorId}/badge`, {
      badge,
    });
  }

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------

  async getLabelingStats(): Promise<LabelingStats> {
    return this.get<LabelingStats>('/api/labeling/stats');
  }
}

// Factory function for creating client instances
export function createLabelingClient(
  baseUrl: string,
  options?: Partial<ClientConfig>
): LabelingApiClient {
  return new LabelingApiClient({
    baseUrl,
    ...options,
  });
}
