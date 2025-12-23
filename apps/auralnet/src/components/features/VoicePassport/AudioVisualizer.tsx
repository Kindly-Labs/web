import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
  isRecording: boolean;
  className?: string;
}

export default function AudioVisualizer({ stream, isRecording, className }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const contextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!stream || !isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Audio Context
    if (!contextRef.current) {
      contextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    const audioContext = contextRef.current;
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }

    if (!audioContext) return;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    // Config
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    source.connect(analyser);

    const draw = () => {
      if (!isRecording) return;

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw settings
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 1.5; // Scale down slightly

        // Dynamic Gradient based on height - Heritage Theme
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#D4845C'); // Terracotta
        gradient.addColorStop(1, '#D4AF37'); // Antique Gold

        ctx.fillStyle = gradient;

        // Rounded bars logic (simple rect for now)
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 2; // Spacing
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (source) source.disconnect();
    };
  }, [stream, isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (contextRef.current) {
        contextRef.current.close().catch(console.error);
        contextRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className={`h-full w-full object-cover ${className || ''}`}
    />
  );
}
