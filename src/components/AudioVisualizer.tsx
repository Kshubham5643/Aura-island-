import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../utils/audioEngine';

interface AudioVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  height?: number;
  compact?: boolean;
  accentColor?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isPlaying,
  barCount = 32,
  height = 36,
  compact = false,
  accentColor = '#38bdf8'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  // Reusable array to prevent memory allocation in the render loop
  const freqDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(32));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let isDocumentVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isDocumentVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const render = () => {
      if (!isDocumentVisible) {
        animFrameId.current = requestAnimationFrame(render);
        return;
      }

      const width = canvas.width;
      const cHeight = canvas.height;

      ctx.clearRect(0, 0, width, cHeight);

      if (isPlaying) {
        audioEngine.getFrequencyData(freqDataRef.current);
      } else {
        // Flatline idle state
        freqDataRef.current.fill(0);
      }

      const count = compact ? 5 : barCount;
      const barWidth = Math.max(2, (width / count) - (compact ? 2 : 2.5));
      const step = Math.floor(freqDataRef.current.length / count);

      for (let i = 0; i < count; i++) {
        const val = isPlaying ? freqDataRef.current[i * step] || 0 : 0;
        // Normalize height
        const normalized = isPlaying ? Math.max(0.15, val / 255) : 0.12;
        const barH = Math.max(3, normalized * cHeight);
        const x = i * (barWidth + (compact ? 2 : 2.5));
        const y = cHeight - barH;

        if (compact) {
          ctx.fillStyle = isPlaying ? accentColor : 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 2);
          ctx.fill();
        } else {
          // Gradient for expanded view
          const grad = ctx.createLinearGradient(0, cHeight, 0, 0);
          grad.addColorStop(0, 'rgba(56, 189, 248, 0.2)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.85)');
          grad.addColorStop(1, 'rgba(192, 132, 252, 0.95)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, 3);
          ctx.fill();

          // Subtle glow cap on top
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fillRect(x, y, barWidth, 1.5);
        }
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying, barCount, compact, accentColor]);

  return (
    <canvas
      ref={canvasRef}
      width={compact ? 28 : 240}
      height={height}
      className={`pointer-events-none transition-opacity duration-300 ${isPlaying ? 'opacity-100' : 'opacity-40'}`}
    />
  );
};
