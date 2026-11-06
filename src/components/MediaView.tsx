import React, { useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Repeat, 
  Shuffle, 
  Upload,
  Music2
} from 'lucide-react';
import { Track } from '../types/widget';
import { AudioVisualizer } from './AudioVisualizer';

interface MediaViewProps {
  currentTrack: Track;
  tracks: Track[];
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (seconds: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSelectTrack: (track: Track) => void;
  onUploadTrack: (file: File) => void;
}

export const MediaView: React.FC<MediaViewProps> = ({
  currentTrack,
  tracks,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  isShuffle,
  isRepeat,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onSelectTrack,
  onUploadTrack,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = currentTrack.duration > 0 ? (currentTime / currentTrack.duration) * 100 : 0;

  return (
    <div className="w-full flex flex-col gap-4 text-slate-100">
      {/* Top Track Header */}
      <div className="flex items-center gap-3.5">
        <div className="relative group w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/10 bg-slate-900/60">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping opacity-75" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm tracking-tight text-white truncate">
              {currentTrack.title}
            </h3>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 font-mono shrink-0">
              {currentTrack.genre}
            </span>
          </div>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {currentTrack.artist} <span className="opacity-40">·</span> {currentTrack.album}
          </p>

          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400 font-mono tabular-nums">
            <span>{currentTrack.bpm} BPM</span>
            <span className="opacity-40">·</span>
            <span className="text-cyan-400/90 font-medium">Fluent Audio Engine</span>
          </div>
        </div>

        {/* Real-time Spectrum Visualizer */}
        <div className="w-28 shrink-0 flex flex-col items-end">
          <AudioVisualizer isPlaying={isPlaying} barCount={20} height={28} />
          <span className="text-[9px] font-mono text-slate-400 mt-1">REAL-TIME FFT</span>
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="flex flex-col gap-1.5">
        <div className="relative w-full h-2 bg-white/10 rounded-full cursor-pointer group flex items-center"
             onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const clickX = e.clientX - rect.left;
               const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
               onSeek(newRatio * currentTrack.duration);
             }}>
          <div 
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 rounded-full relative"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
          </div>
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400 tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(currentTrack.duration)}</span>
        </div>
      </div>

      {/* Main Playback Controls */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleShuffle}
            title="Shuffle"
            className={`p-2 rounded-lg transition-colors ${isShuffle ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleRepeat}
            title="Repeat"
            className={`p-2 rounded-lg transition-colors ${isRepeat ? 'text-cyan-400 bg-cyan-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Play/Pause & Skips */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button
            onClick={onPlayPause}
            className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current translate-x-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            className="p-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>

        {/* Volume & File Upload */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 group/vol">
            <button
              onClick={onToggleMute}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <div className="w-16 flex items-center">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-cyan-400"
                title="Volume"
              />
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            accept="audio/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onUploadTrack(file);
              }
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload local MP3 from your Windows laptop"
            className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors flex items-center gap-1.5 text-xs"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Track Quick Playlist Switcher */}
      <div className="pt-2 border-t border-white/5">
        <div className="text-[11px] font-medium text-slate-400 mb-2 flex items-center justify-between">
          <span>SELECT TRACK / PRESET</span>
          <span className="font-mono text-[10px] text-slate-400">{tracks.length} Tracks Ready</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {tracks.map((track) => {
            const isCurrent = track.id === currentTrack.id;
            return (
              <button
                key={track.id}
                onClick={() => onSelectTrack(track)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-500/15 border border-cyan-400/30 text-white shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent text-slate-300'
                }`}
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                  <img
                    src={track.coverUrl}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold truncate leading-tight flex items-center gap-1.5">
                    {track.title}
                    {isCurrent && isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {track.artist}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
