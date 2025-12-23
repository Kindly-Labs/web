// ============================================================================
// Corpus API Client - DLI Data Integration
// ============================================================================

import { BaseApiClient, ClientConfig } from './base-client';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CorpusTopic {
  id: string;
  name: string;
  nameChinese: string;
  description: string;
  phraseCount: number;
  validatedCount: number;
  packagedCount: number;
}

export interface CorpusSubTopic {
  id: string;
  topicId: string;
  name: string;
  context: string;
  phraseCount: number;
  validatedCount: number;
  volume: number;
  lesson: number;
}

export interface CorpusPhrase {
  id: string;
  topicId: string;
  subTopicId: string;
  textRomanized: string;
  textChinese: string;
  textEnglish: string;
  speaker: string;
  audioPath: string;
  durationSeconds: number;
  sourceOffset: number;
  sourceFile: string;
  volume: number;
  lesson: number;
  segmentIndex: number;
  status: 'pending' | 'validated' | 'packaged' | 'rejected';
  tier: 1 | 2 | 3;
  validationCount: number;
  qualityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkbenchCorpusPhrase extends CorpusPhrase {
  audioUrl: string;
  dialogueContext?: string[];
  guidelines?: string[];
  previousPhrase?: string;
  nextPhrase?: string;
}

export interface CorpusStats {
  totalPhrases: number;
  pendingPhrases: number;
  validatedPhrases: number;
  packagedPhrases: number;
  rejectedPhrases: number;
  totalDuration: number;
  validatedDuration: number;
  totalTopics: number;
  totalSubTopics: number;
  totalValidations: number;
  avgQualityScore: number;
  tier1Count: number;
  tier2Count: number;
  tier3Count: number;
}

export interface CorpusProgress {
  stats: CorpusStats;
  topicProgress: Array<{
    id: string;
    name: string;
    phraseCount: number;
    validatedCount: number;
    progress: number;
  }>;
  overallProgress: {
    validated: number;
    tier1: number;
    avgQuality: number;
  };
}

export interface ValidatePhraseRequest {
  transcriptMatch: 'exact' | 'close' | 'mismatch';
  qualityScore: 1 | 2 | 3 | 4 | 5;
  audioClarity: 'clear' | 'acceptable' | 'noisy' | 'unusable';
  speakerMatch: boolean;
  flags?: string[];
  notes?: string;
  recommendedTier?: number;
}

export interface PhrasesListParams {
  topicId?: string;
  subTopicId?: string;
  status?: string;
  tier?: number;
  speaker?: string;
  minQuality?: number;
  limit?: number;
  offset?: number;
}

export interface PhrasesListResponse {
  phrases: CorpusPhrase[];
  total: number;
  limit: number;
  offset: number;
}

export interface ExportRequest {
  tier: number;
  format: 'jsonl' | 'huggingface' | 'raw';
  includeAudio: boolean;
  minValidationCount?: number;
  speakers?: string[];
  volumes?: number[];
  minQualityScore?: number;
}

export interface ExportResult {
  exportId: string;
  tier: number;
  format: string;
  phraseCount: number;
  totalDuration: number;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Corpus API Client
// ---------------------------------------------------------------------------

export class CorpusApiClient extends BaseApiClient {
  constructor(config: ClientConfig) {
    super(config);
  }

  // ---------------------------------------------------------------------------
  // Topics (Volumes)
  // ---------------------------------------------------------------------------

  async getTopics(): Promise<CorpusTopic[]> {
    return this.get<CorpusTopic[]>('/api/corpus/topics');
  }

  async getTopic(id: string): Promise<CorpusTopic> {
    return this.get<CorpusTopic>(`/api/corpus/topics/${encodeURIComponent(id)}`);
  }

  async getSubTopics(topicId: string): Promise<CorpusSubTopic[]> {
    return this.get<CorpusSubTopic[]>(
      `/api/corpus/topics/${encodeURIComponent(topicId)}/subtopics`
    );
  }

  async getSubTopic(id: string): Promise<CorpusSubTopic> {
    return this.get<CorpusSubTopic>(`/api/corpus/subtopics/${encodeURIComponent(id)}`);
  }

  // ---------------------------------------------------------------------------
  // Phrases
  // ---------------------------------------------------------------------------

  async getPhrases(params: PhrasesListParams = {}): Promise<PhrasesListResponse> {
    const queryParams = new URLSearchParams();
    if (params.topicId) queryParams.set('topicId', params.topicId);
    if (params.subTopicId) queryParams.set('subTopicId', params.subTopicId);
    if (params.status) queryParams.set('status', params.status);
    if (params.tier) queryParams.set('tier', params.tier.toString());
    if (params.speaker) queryParams.set('speaker', params.speaker);
    if (params.minQuality) queryParams.set('minQuality', params.minQuality.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.offset) queryParams.set('offset', params.offset.toString());

    const query = queryParams.toString();
    return this.get<PhrasesListResponse>(`/api/corpus/phrases${query ? `?${query}` : ''}`);
  }

  async getPhrase(id: string): Promise<CorpusPhrase> {
    return this.get<CorpusPhrase>(`/api/corpus/phrases/${encodeURIComponent(id)}`);
  }

  async getPhraseWithContext(id: string): Promise<WorkbenchCorpusPhrase> {
    return this.get<WorkbenchCorpusPhrase>(`/api/corpus/phrases/${encodeURIComponent(id)}/context`);
  }

  getAudioUrl(phraseId: string): string {
    return `${this.baseUrl}/api/corpus/phrases/${encodeURIComponent(phraseId)}/audio`;
  }

  // ---------------------------------------------------------------------------
  // Validation Workflow
  // ---------------------------------------------------------------------------

  async getNextForValidation(
    annotatorId: string
  ): Promise<{ message?: string; phrase?: WorkbenchCorpusPhrase }> {
    return this.get(`/api/corpus/workbench/next?annotatorId=${annotatorId}`);
  }

  async submitValidation(
    phraseId: string,
    annotatorId: string,
    data: ValidatePhraseRequest
  ): Promise<{ status: string; message: string }> {
    return this.post(
      `/api/corpus/phrases/${encodeURIComponent(phraseId)}/validate?annotatorId=${annotatorId}`,
      data
    );
  }

  // ---------------------------------------------------------------------------
  // Statistics & Progress
  // ---------------------------------------------------------------------------

  async getStats(): Promise<CorpusStats> {
    return this.get<CorpusStats>('/api/corpus/stats');
  }

  async getProgress(): Promise<CorpusProgress> {
    return this.get<CorpusProgress>('/api/corpus/progress');
  }

  // ---------------------------------------------------------------------------
  // Admin Tier Management
  // ---------------------------------------------------------------------------

  async promoteToTier1(phraseId: string): Promise<{ status: string; message: string }> {
    return this.post(`/api/corpus/phrases/${encodeURIComponent(phraseId)}/promote`);
  }

  async reserveForBenchmark(phraseId: string): Promise<{ status: string; message: string }> {
    return this.post(`/api/corpus/phrases/${encodeURIComponent(phraseId)}/reserve-benchmark`);
  }

  // ---------------------------------------------------------------------------
  // Export
  // ---------------------------------------------------------------------------

  async exportDataset(request: ExportRequest): Promise<ExportResult> {
    return this.post<ExportResult>('/api/corpus/export', request);
  }

  getExportDownloadUrl(exportId: string): string {
    return `${this.baseUrl}/api/corpus/export/${encodeURIComponent(exportId)}/download`;
  }

  getStreamExportUrl(tier: number, format: string = 'jsonl'): string {
    return `${this.baseUrl}/api/corpus/export/stream?tier=${tier}&format=${format}`;
  }
}

// Factory function for creating client instances
export function createCorpusClient(
  baseUrl: string,
  options?: Partial<ClientConfig>
): CorpusApiClient {
  return new CorpusApiClient({
    baseUrl,
    ...options,
  });
}
