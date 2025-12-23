'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Play,
  Pause,
  Star,
  Flag,
  SkipForward,
  Send,
  AlertTriangle,
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getContributorInfo } from '@/components/WelcomeModal';

// API base URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

interface ValidationTask {
  id: string;
  recordingId: string;
  phraseId: string;
  topic: string;
  audioUrl: string;
  recordedAt: string;
  contributor?: string;
  phraseChinese: string;
  phraseEnglish: string;
  phraseRomanized: string;
  queuePosition: number;
  queueTotal: number;
}

const flagReasons = [
  { id: 'noise', label: 'Too much background noise' },
  { id: 'wrong-language', label: 'Wrong language/dialect' },
  { id: 'incomplete', label: 'Incomplete or cut off' },
  { id: 'offensive', label: 'Inappropriate content' },
  { id: 'other', label: 'Other issue' },
];

// Reasons for skipping a recording
const skipReasons = [
  { id: 'unfamiliar', label: "I don't know this phrase" },
  { id: 'audio-issue', label: "Can't play the audio" },
  { id: 'unsure', label: 'Not sure how to rate this' },
  { id: 'conflict-of-interest', label: 'This is my own recording' },
  { id: 'other', label: 'Other reason' },
];

// Reasons for partial match or no match
const mismatchReasons = [
  { id: 'wrong-phrase', label: 'Said a different phrase' },
  { id: 'missing-words', label: 'Missing words or syllables' },
  { id: 'extra-words', label: 'Added extra words' },
  { id: 'wrong-tone', label: 'Wrong tones/pronunciation' },
  { id: 'mixed-language', label: 'Mixed with other language' },
  { id: 'unclear-speech', label: 'Speech is unclear/mumbled' },
];

export default function ValidatePage() {
  const [task, setTask] = useState<ValidationTask | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rating, setRating] = useState(0);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [totalValidated, setTotalValidated] = useState(0);
  const [selectedMismatchReasons, setSelectedMismatchReasons] = useState<string[]>([]);
  const [mismatchComment, setMismatchComment] = useState('');
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [selectedSkipReason, setSelectedSkipReason] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch next validation task
  const fetchNextTask = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setRating(0);
    setMatchScore(null);
    setSubmitStatus('idle');
    setSubmitMessage('');
    setSelectedMismatchReasons([]);
    setMismatchComment('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/workbench/validate/next`);
      const data = await response.json();

      if (data.message && !data.id) {
        // No tasks available
        setTask(null);
        setError(data.message);
      } else {
        setTask(data);
      }
    } catch (err) {
      console.error('Failed to fetch task:', err);
      setError('Failed to load validation task. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNextTask();
  }, [fetchNextTask]);

  // Audio playback
  const playAudio = () => {
    if (!task || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Set the audio source with the full URL
      const audioUrl = task.audioUrl.startsWith('http')
        ? task.audioUrl
        : `${API_BASE_URL}${task.audioUrl}`;
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((err) => {
        console.error('Audio playback error:', err);
        setError('Failed to play audio');
      });
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  // Submit validation
  const handleSubmit = async () => {
    if (!task || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Get validator ID
    const contributor = getContributorInfo();

    try {
      const response = await fetch(`${API_BASE_URL}/api/workbench/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordingId: task.recordingId,
          validatorId: contributor?.id || '',
          qualityScore: rating,
          matchScore: matchScore,
          mismatchReasons: matchScore !== null && matchScore < 1 ? selectedMismatchReasons : [],
          notes: matchScore !== null && matchScore < 1 ? mismatchComment : '',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(`Validation saved! +${(data.serviceHours * 60).toFixed(1)} min service hours`);
        setTotalValidated((prev) => prev + 1);

        // Auto-advance after delay
        setTimeout(() => {
          fetchNextTask();
        }, 1500);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Failed to submit validation');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flag recording
  const handleFlag = async () => {
    if (!task || !selectedFlag) return;

    try {
      await fetch(`${API_BASE_URL}/api/workbench/recordings/${task.recordingId}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: selectedFlag,
        }),
      });

      setShowFlagModal(false);
      setSelectedFlag(null);
      fetchNextTask();
    } catch (err) {
      console.error('Flag error:', err);
    }
  };

  // Skip current task - show modal to capture reason
  const openSkipModal = () => {
    setShowSkipModal(true);
  };

  // Submit skip with reason
  const handleSkip = async () => {
    if (!task || !selectedSkipReason) return;

    // Log skip reason to backend
    try {
      await fetch(`${API_BASE_URL}/api/workbench/recordings/${task.recordingId}/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: selectedSkipReason,
        }),
      });
    } catch (err) {
      console.error('Failed to log skip reason:', err);
      // Continue anyway - don't block user
    }

    setShowSkipModal(false);
    setSelectedSkipReason(null);
    fetchNextTask();
  };

  // Quick skip without reason (for users who just want to move on)
  const quickSkip = () => {
    setShowSkipModal(false);
    setSelectedSkipReason(null);
    fetchNextTask();
  };

  // Toggle mismatch reason selection
  const toggleMismatchReason = (reasonId: string) => {
    setSelectedMismatchReasons((prev) =>
      prev.includes(reasonId)
        ? prev.filter((r) => r !== reasonId)
        : [...prev, reasonId]
    );
  };

  // Require at least one reason when partial/no match
  const needsMismatchReason = matchScore !== null && matchScore < 1;
  const hasMismatchReason = selectedMismatchReasons.length > 0 || mismatchComment.trim().length > 0;
  const canSubmit = rating > 0 && matchScore !== null && (!needsMismatchReason || hasMismatchReason);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <p className="text-neutral-400">Loading validation task...</p>
        </div>
      </div>
    );
  }

  // No tasks available
  if (!task) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <header className="border-b border-neutral-800 bg-neutral-900/50">
          <div className="mx-auto max-w-3xl px-6 py-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-6 py-16 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="mb-4 text-2xl font-semibold">All Caught Up!</h1>
          <p className="mb-8 text-neutral-400">
            {error || 'No recordings are waiting for validation right now.'}
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/record?topic=transit"
              className="rounded-lg bg-amber-600 px-6 py-3 font-medium transition-colors hover:bg-amber-500"
            >
              Record New Phrases
            </Link>
            <button
              onClick={fetchNextTask}
              className="flex items-center gap-2 rounded-lg bg-neutral-800 px-6 py-3 font-medium transition-colors hover:bg-neutral-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} />

      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </Link>
            <div className="flex items-center gap-3">
              {totalValidated > 0 && (
                <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">
                  {totalValidated} validated
                </span>
              )}
              <div className="rounded-full bg-amber-500/10 px-3 py-1 text-sm text-amber-500">
                {task.queueTotal} in queue
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        <h1 className="mb-2 text-2xl font-semibold">Validate Recording</h1>
        <p className="mb-8 text-neutral-400">
          Listen to the recording and rate its quality and accuracy.
        </p>

        {/* Recording Card */}
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
          {/* Phrase Display */}
          <div className="mb-6 text-center">
            <p className="mb-2 text-3xl font-medium">{task.phraseChinese}</p>
            <p className="mb-1 text-lg text-neutral-400">{task.phraseEnglish}</p>
            <p className="font-mono text-sm text-neutral-500">{task.phraseRomanized}</p>
          </div>

          {/* Audio Player */}
          <div className="mb-6 flex flex-col items-center">
            <button
              onClick={playAudio}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-all',
                isPlaying
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/30'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              )}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="ml-1 h-8 w-8" />}
            </button>
            <p className="mt-3 text-sm text-neutral-500">
              {isPlaying ? 'Playing...' : 'Tap to play recording'}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
            <span>{task.topic}</span>
            <span>•</span>
            <span>Phrase: {task.phraseId}</span>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="mb-4 font-medium">Audio Quality</h3>
          <p className="mb-4 text-sm text-neutral-400">How clear and well-recorded is the audio?</p>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    'h-10 w-10 transition-colors',
                    star <= rating
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-neutral-600 hover:text-neutral-400'
                  )}
                />
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-sm text-neutral-500">
            {rating === 0 && 'Select a rating'}
            {rating === 1 && 'Poor - Hard to understand'}
            {rating === 2 && 'Fair - Some issues'}
            {rating === 3 && 'Good - Acceptable quality'}
            {rating === 4 && 'Very Good - Clear audio'}
            {rating === 5 && 'Excellent - Perfect quality'}
          </p>
        </div>

        {/* Match Score Section */}
        <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h3 className="mb-4 font-medium">Content Match</h3>
          <p className="mb-4 text-sm text-neutral-400">
            Does the recording match the expected phrase?
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setMatchScore(1);
                setSelectedMismatchReasons([]);
                setMismatchComment('');
              }}
              className={cn(
                'rounded-lg px-6 py-3 text-sm font-medium transition-all',
                matchScore === 1
                  ? 'bg-green-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              )}
            >
              Matches
            </button>
            <button
              onClick={() => setMatchScore(0.5)}
              className={cn(
                'rounded-lg px-6 py-3 text-sm font-medium transition-all',
                matchScore === 0.5
                  ? 'bg-yellow-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              )}
            >
              Partial Match
            </button>
            <button
              onClick={() => setMatchScore(0)}
              className={cn(
                'rounded-lg px-6 py-3 text-sm font-medium transition-all',
                matchScore === 0
                  ? 'bg-red-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
              )}
            >
              No Match
            </button>
          </div>
        </div>

        {/* Mismatch Reasons - shown when Partial Match or No Match */}
        {needsMismatchReason && (
          <div className="mb-8 rounded-xl border border-amber-900/50 bg-amber-950/20 p-6">
            <h3 className="mb-2 font-medium text-amber-400">
              {matchScore === 0.5 ? 'Why is it a partial match?' : 'Why doesn\'t it match?'}
            </h3>
            <p className="mb-4 text-sm text-neutral-400">
              Select all that apply, or add a comment:
            </p>

            {/* Predefined Reasons - Multi-select chips */}
            <div className="mb-4 flex flex-wrap gap-2">
              {mismatchReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => toggleMismatchReason(reason.id)}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm transition-all',
                    selectedMismatchReasons.includes(reason.id)
                      ? 'bg-amber-600 text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            {/* Optional Comment */}
            <textarea
              value={mismatchComment}
              onChange={(e) => setMismatchComment(e.target.value)}
              placeholder="Add additional details (optional)..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-3 text-sm text-neutral-100 placeholder-neutral-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              rows={2}
            />

            {!hasMismatchReason && (
              <p className="mt-2 text-xs text-amber-500">
                Please select at least one reason or add a comment
              </p>
            )}
          </div>
        )}

        {/* Submit Status */}
        {submitMessage && (
          <div
            className={cn(
              'mb-6 rounded-lg px-4 py-3 text-center text-sm',
              submitStatus === 'success'
                ? 'bg-green-900/50 text-green-300'
                : 'bg-red-900/50 text-red-300'
            )}
          >
            {submitMessage}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFlagModal(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Flag className="h-4 w-4" />
              Flag Issue
            </button>
            <button
              onClick={openSkipModal}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-400 transition-colors hover:bg-neutral-800"
            >
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={cn(
              'flex items-center gap-2 rounded-lg px-6 py-2 font-medium transition-colors',
              submitStatus === 'success'
                ? 'bg-green-600'
                : 'bg-green-600 hover:bg-green-500',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : submitStatus === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Review
          </button>
        </div>
      </main>

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-semibold">Flag Recording</h3>
            </div>
            <p className="mb-4 text-sm text-neutral-400">
              Select the reason for flagging this recording:
            </p>
            <div className="mb-6 space-y-2">
              {flagReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedFlag(reason.id)}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    selectedFlag === reason.id
                      ? 'border-red-500 bg-red-500/10 text-red-400'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setSelectedFlag(null);
                }}
                className="flex-1 rounded-lg bg-neutral-800 py-2 text-sm transition-colors hover:bg-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleFlag}
                disabled={!selectedFlag}
                className="flex-1 rounded-lg bg-red-600 py-2 text-sm transition-colors hover:bg-red-500 disabled:opacity-50"
              >
                Submit Flag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="mb-4 flex items-center gap-3">
              <SkipForward className="h-6 w-6 text-amber-500" />
              <h3 className="text-lg font-semibold">Skip Recording</h3>
            </div>
            <p className="mb-4 text-sm text-neutral-400">
              Help us improve by telling us why you&apos;re skipping (optional):
            </p>
            <div className="mb-6 space-y-2">
              {skipReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedSkipReason(reason.id)}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    selectedSkipReason === reason.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-600'
                  )}
                >
                  {reason.label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={quickSkip}
                className="flex-1 rounded-lg bg-neutral-800 py-2 text-sm transition-colors hover:bg-neutral-700"
              >
                Just Skip
              </button>
              <button
                onClick={handleSkip}
                disabled={!selectedSkipReason}
                className="flex-1 rounded-lg bg-amber-600 py-2 text-sm transition-colors hover:bg-amber-500 disabled:opacity-50"
              >
                Skip with Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
