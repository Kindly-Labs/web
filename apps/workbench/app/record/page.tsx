'use client';

import { Suspense, useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Send,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { phrasesByTopic } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import { getContributorInfo } from '@/components/WelcomeModal';

// API base URL - defaults to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function RecordPageContent() {
  const searchParams = useSearchParams();
  const topic = searchParams.get('topic') || 'transit';
  const phrases = phrasesByTopic[topic] || phrasesByTopic.transit;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [totalSubmitted, setTotalSubmitted] = useState(0);
  const [isExamplePlaying, setIsExamplePlaying] = useState(false);
  const [isExampleLoading, setIsExampleLoading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exampleAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPhrase = phrases[currentIndex];

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  // Stop example audio when changing phrases
  useEffect(() => {
    if (exampleAudioRef.current) {
      exampleAudioRef.current.pause();
      exampleAudioRef.current.src = '';
      setIsExamplePlaying(false);
    }
  }, [currentIndex]);

  // Play example pronunciation using TTS
  const playExample = async () => {
    if (isExampleLoading) return;

    // If already playing, stop it
    if (isExamplePlaying && exampleAudioRef.current) {
      exampleAudioRef.current.pause();
      setIsExamplePlaying(false);
      return;
    }

    setIsExampleLoading(true);

    try {
      // Request TTS from backend
      const response = await fetch(`${API_BASE_URL}/api/tts/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: currentPhrase.chinese,
          language: 'yue', // Cantonese/Toishanese
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate example audio');
      }

      // Get audio blob
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Play the audio
      if (exampleAudioRef.current) {
        exampleAudioRef.current.src = audioUrl;
        exampleAudioRef.current.onended = () => {
          setIsExamplePlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        exampleAudioRef.current.onerror = () => {
          setIsExamplePlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        await exampleAudioRef.current.play();
        setIsExamplePlaying(true);
      }
    } catch (error) {
      console.error('Example audio error:', error);
      // Fallback: use browser speech synthesis if TTS fails
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(currentPhrase.chinese);
        utterance.lang = 'zh-HK'; // Closest to Toishanese
        utterance.rate = 0.8;
        utterance.onend = () => setIsExamplePlaying(false);
        utterance.onerror = () => setIsExamplePlaying(false);
        speechSynthesis.speak(utterance);
        setIsExamplePlaying(true);
      }
    } finally {
      setIsExampleLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        setSubmitStatus('idle');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const playAudio = () => {
    if (audioURL && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetRecording = () => {
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    setSubmitStatus('idle');
    setSubmitMessage('');
  };

  const submitRecording = async () => {
    if (!audioBlob || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    try {
      // Create form data with the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, `${currentPhrase.id}.webm`);
      formData.append('phraseId', currentPhrase.id);
      formData.append('topic', topic);

      // Include contributor ID if available
      const contributor = getContributorInfo();
      if (contributor) {
        formData.append('annotatorId', contributor.id);
        formData.append('annotatorName', contributor.name);
      }

      // Submit to the backend API
      const response = await fetch(`${API_BASE_URL}/api/workbench/recordings`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(`Recording saved! +${(data.serviceHours * 60).toFixed(1)} min service hours`);
        setTotalSubmitted((prev) => prev + 1);

        // Auto-advance after a short delay
        setTimeout(() => {
          goToNext();
        }, 1500);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.message || 'Failed to upload recording');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNext = () => {
    resetRecording();
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    resetRecording();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const topicLabels: Record<string, string> = {
    transit: 'Transit',
    medical: 'Medical',
    banking: 'Banking',
    shopping: 'Shopping',
    family: 'Family',
    food: 'Food',
    phone: 'Phone',
    home: 'Home',
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50">
        <div className="mx-auto max-w-3xl px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-neutral-400 transition-colors hover:text-neutral-100"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Topics</span>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-400">
                {topicLabels[topic] || 'Transit'} Phrases
              </span>
              {totalSubmitted > 0 && (
                <span className="rounded-full bg-green-900/50 px-2 py-0.5 text-xs text-green-400">
                  {totalSubmitted} submitted
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-neutral-400">
            <span>
              Phrase {currentIndex + 1} of {phrases.length}
            </span>
            <span>{Math.round(((currentIndex + 1) / phrases.length) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
              style={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Phrase Card */}
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900 p-8">
          <div className="mb-6 text-center">
            <p className="mb-3 text-4xl font-medium">{currentPhrase.chinese}</p>
            <p className="mb-2 text-lg text-neutral-400">{currentPhrase.english}</p>
            <p className="font-mono text-sm text-neutral-500">{currentPhrase.romanization}</p>
          </div>

          <button
            onClick={playExample}
            disabled={isExampleLoading}
            className={cn(
              'mx-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors',
              isExamplePlaying
                ? 'bg-amber-600 text-white'
                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100',
              isExampleLoading && 'cursor-wait opacity-50'
            )}
          >
            {isExampleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isExamplePlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            {isExampleLoading ? 'Loading...' : isExamplePlaying ? 'Stop' : 'Listen to example'}
          </button>
        </div>

        {/* Recording Controls */}
        <div className="mb-8 flex flex-col items-center">
          {/* Recording Timer */}
          {(isRecording || audioURL) && (
            <div className="mb-4 font-mono text-2xl text-neutral-400">
              {formatTime(recordingTime)}
            </div>
          )}

          {/* Waveform Placeholder */}
          {isRecording && (
            <div className="mb-6 flex h-16 w-full items-center justify-center gap-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-red-500"
                  style={{
                    height: `${Math.random() * 100}%`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Main Record Button - Click to Start/Stop */}
          {!audioURL ? (
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                'flex h-24 w-24 items-center justify-center rounded-full transition-all',
                isRecording
                  ? 'scale-110 bg-red-600 shadow-lg shadow-red-500/30 animate-pulse'
                  : 'bg-neutral-800 hover:bg-neutral-700'
              )}
            >
              {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </button>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={playAudio}
                  disabled={isSubmitting}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </button>
                <button
                  onClick={resetRecording}
                  disabled={isSubmitting}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800 transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-6 w-6" />
                </button>
                <button
                  onClick={submitRecording}
                  disabled={isSubmitting || submitStatus === 'success'}
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full transition-colors',
                    submitStatus === 'success'
                      ? 'bg-green-600'
                      : submitStatus === 'error'
                        ? 'bg-red-600 hover:bg-red-500'
                        : 'bg-green-600 hover:bg-green-500',
                    'disabled:opacity-50'
                  )}
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : submitStatus === 'success' ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : submitStatus === 'error' ? (
                    <AlertCircle className="h-6 w-6" />
                  ) : (
                    <Send className="h-6 w-6" />
                  )}
                </button>
              </div>

              {/* Submit Status Message */}
              {submitMessage && (
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm',
                    submitStatus === 'success'
                      ? 'bg-green-900/50 text-green-300'
                      : 'bg-red-900/50 text-red-300'
                  )}
                >
                  {submitMessage}
                </div>
              )}
            </div>
          )}

          {/* Instructions */}
          <p className="mt-4 text-center text-sm text-neutral-500">
            {isRecording
              ? 'Recording... Tap to stop'
              : audioURL
                ? 'Listen, re-record, or submit'
                : 'Tap to start recording'}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>
          <button
            onClick={goToNext}
            disabled={currentIndex === phrases.length - 1}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Skip
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </main>

      {/* Hidden audio elements */}
      {audioURL && <audio ref={audioRef} src={audioURL} onEnded={() => setIsPlaying(false)} />}
      <audio ref={exampleAudioRef} />
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
    </div>
  );
}

export default function RecordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecordPageContent />
    </Suspense>
  );
}
