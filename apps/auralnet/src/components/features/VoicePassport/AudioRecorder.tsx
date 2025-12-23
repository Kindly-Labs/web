import { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  Share2,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import AudioVisualizer from './AudioVisualizer';

export interface RecordingResult {
  full: Blob;
  segments: { text: string; blob: Blob }[];
}

interface AudioRecorderProps {
  phrase: string;
  dialect?: string;
  segments?: string[];
  onUpload: (result: RecordingResult) => Promise<void>;
}

export default function AudioRecorder({
  phrase,
  dialect = 'Unknown Dialect',
  segments = [],
  onUpload,
}: AudioRecorderProps) {
  // State Machine
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'recording' | 'recorded' | 'saved'>('idle');
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Storage for multi-step process
  const [recordedSegments, setRecordedSegments] = useState<{ text: string; blob: Blob }[]>([]);

  // Derived Data
  const steps = [
    ...segments.map((seg, i) => ({ text: seg, type: 'segment' as const, index: i })),
    { text: phrase, type: 'full' as const, index: -1 },
  ];

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = (currentStepIndex / steps.length) * 100;

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(newStream);

      mediaRecorderRef.current = new MediaRecorder(newStream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setStatus('recorded');
      };

      mediaRecorderRef.current.start();
      setStatus('recording');
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && status === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const resetRecording = () => {
    setAudioURL(null);
    setStatus('idle');
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleNextStep = async () => {
    if (!chunksRef.current.length) return;
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });

    if (currentStep.type === 'segment') {
      setRecordedSegments((prev) => [...prev, { text: currentStep.text, blob }]);
      setCurrentStepIndex((prev) => prev + 1);
      resetRecording();
    } else {
      // Final Step
      setStatus('saved');
      triggerConfetti();

      const result: RecordingResult = {
        full: blob,
        segments: recordedSegments,
      };

      await onUpload(result);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    (function frame() {
      // Heritage confetti colors
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#D4845C', '#D4AF37'], // Terracotta & Gold
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#D4845C', '#D4AF37'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  return (
    <div className="glass-panel mx-auto flex !min-h-[500px] w-full max-w-4xl flex-col">
      <div className="flex flex-1 flex-col p-8 md:p-12">
        {/* Header: Progress & Status */}
        <div className="mb-8 flex items-center justify-between">
          {steps.length > 1 && status !== 'saved' && (
            <div className="flex flex-1 items-center gap-4">
              <span className="text-muted-foreground font-mono text-xs font-bold tracking-widest uppercase">
                Step {currentStepIndex + 1}/{steps.length}
              </span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="bg-primary h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence>
            {status === 'recording' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="ml-auto flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 text-red-400"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                </span>
                <span className="font-mono text-xs font-bold tracking-wider uppercase">On Air</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence mode="wait">
          {status === 'saved' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-1 flex-col items-center justify-center py-8 text-center"
            >
              <div className="bg-primary/20 text-primary border-primary/30 mb-6 flex h-20 w-20 items-center justify-center rounded-full border">
                <CheckCircle className="h-10 w-10" />
              </div>

              <h3 className="text-foreground mb-3 text-4xl font-bold tracking-tight">
                Voice Preserved
              </h3>
              <p className="text-muted-foreground mb-10 max-w-sm text-lg leading-relaxed">
                Your contribution has been added to the global archive. Thank you for preserving{' '}
                {dialect}.
              </p>

              <div className="flex w-full max-w-md flex-col justify-center gap-4 sm:flex-row">
                <button
                  onClick={() => {
                    setCurrentStepIndex(0);
                    setRecordedSegments([]);
                    resetRecording();
                    setStatus('idle');
                  }}
                  className="text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/10 px-8 py-4 font-mono text-sm font-bold transition-all hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                  Record Another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative flex flex-1 flex-col items-center justify-center"
            >
              {/* The Script - Hero Text */}
              <div className="relative z-10 mb-12 w-full max-w-2xl text-center">
                <h3 className="text-primary mb-6 font-mono text-xs font-bold tracking-widest uppercase">
                  {currentStep.type === 'segment' ? 'Read Aloud' : 'Final Phrase'}
                </h3>
                <p
                  className={`text-foreground leading-tight transition-all duration-300 ${
                    status === 'recording'
                      ? 'scale-105 text-4xl md:text-6xl'
                      : 'text-3xl opacity-80 md:text-5xl'
                  }`}
                >
                  "{currentStep.text}"
                </p>
              </div>

              {/* Visualizer - Integrated */}
              <div className="relative mb-12 flex h-24 w-full items-center justify-center opacity-80">
                {status === 'recording' ? (
                  <AudioVisualizer
                    stream={stream}
                    isRecording={status === 'recording'}
                    className="h-full w-full"
                  />
                ) : status === 'recorded' ? (
                  <div className="flex h-12 items-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-primary w-1 animate-pulse rounded-full"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-muted-foreground rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-sm font-medium tracking-widest uppercase">
                    Ready to Record
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="relative z-20 flex items-center gap-8">
                {status === 'idle' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startRecording}
                    className="bg-primary shadow-primary/30 group flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl ring-4 ring-white/20 transition-all hover:opacity-90"
                  >
                    <Mic className="h-10 w-10 transition-transform group-hover:scale-110" />
                  </motion.button>
                )}

                {status === 'recording' && (
                  <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={stopRecording}
                    className="text-foreground group relative flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl"
                  >
                    <span className="absolute inset-0 animate-ping rounded-full border-2 border-red-500 opacity-50"></span>
                    <Square className="h-10 w-10 fill-current text-red-500 transition-transform group-hover:scale-110" />
                  </motion.button>
                )}

                {status === 'recorded' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-6"
                  >
                    <button
                      onClick={resetRecording}
                      className="text-muted-foreground group flex h-16 w-16 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                      title="Redo"
                    >
                      <RotateCcw className="h-6 w-6 transition-transform group-hover:-rotate-90" />
                    </button>

                    <button
                      onClick={playRecording}
                      className="bg-primary/20 text-primary hover:bg-primary/30 group border-primary/30 flex h-16 w-16 items-center justify-center rounded-full border transition-colors"
                      title="Play Preview"
                    >
                      <Play className="ml-1 h-7 w-7 fill-current transition-transform group-hover:scale-110" />
                    </button>

                    <button
                      onClick={handleNextStep}
                      className="bg-primary shadow-primary/30 group flex h-24 w-24 items-center justify-center rounded-full text-white shadow-xl ring-4 ring-white/20 transition-colors hover:opacity-90"
                      title="Approve & Next"
                    >
                      {isLastStep ? (
                        <CheckCircle className="h-10 w-10 transition-transform group-hover:scale-110" />
                      ) : (
                        <ArrowRight className="h-10 w-10 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  </motion.div>
                )}
              </div>

              {audioURL && <audio ref={audioRef} src={audioURL} className="hidden" />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
