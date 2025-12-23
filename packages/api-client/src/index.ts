// ============================================================================
// @owly-labs/api-client - Unified API Client for Aether Platform
// ============================================================================

// Base client for building custom clients
export { BaseApiClient, type ClientConfig } from './base-client';

// Labeling/Volunteer API
export { LabelingApiClient, createLabelingClient } from './labeling';

// Session/Conversation API
export { SessionApiClient, createSessionClient, type SessionConfig } from './session';

// Corpus/DLI Data API
export {
  CorpusApiClient,
  createCorpusClient,
  type CorpusTopic,
  type CorpusSubTopic,
  type CorpusPhrase,
  type WorkbenchCorpusPhrase,
  type CorpusStats,
  type CorpusProgress,
  type ValidatePhraseRequest,
  type PhrasesListParams,
  type PhrasesListResponse,
  type ExportRequest,
  type ExportResult,
} from './corpus';

// All types
export * from './types';
