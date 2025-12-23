// API utilities for workbench

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface WorkbenchStats {
  totalRecordings: number;
  pendingRecordings: number;
  validatedRecordings: number;
  approvedRecordings: number;
  exportedRecordings: number;
  totalValidations: number;
  goldenSamples: number;
  avgQualityScore: number;
  totalDurationHours: number;
  topicBreakdown?: Record<string, number>;
}

export interface TopicCoverage {
  phraseId: string;
  recordings: number;
  validated: number;
}

// Fetch workbench statistics from the backend
export async function fetchWorkbenchStats(): Promise<WorkbenchStats | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/workbench/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch stats');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching workbench stats:', error);
    return null;
  }
}

// Helper to format topic breakdown for coverage display
export function getTopicCoverageFromStats(
  stats: WorkbenchStats | null,
  topicId: string
): TopicCoverage[] {
  // If we have real data from backend, use it
  if (stats?.topicBreakdown && stats.topicBreakdown[topicId]) {
    // Backend returns count per topic, not per phrase
    // For now, return empty array to fall back to mock
    return [];
  }
  return [];
}

// Calculate overall platform stats
export function calculatePlatformStats(stats: WorkbenchStats | null) {
  if (!stats) {
    return {
      totalRecordings: 0,
      validated: 0,
      contributors: 0,
    };
  }

  return {
    totalRecordings: stats.totalRecordings,
    validated: stats.validatedRecordings + stats.approvedRecordings + stats.exportedRecordings,
    contributors: 0, // Would need a separate API call
  };
}
