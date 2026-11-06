import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Music, 
  Cpu, 
  Clock, 
  FileText, 
  Bluetooth, 
  X, 
  Pin, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause, 
  ChevronRight,
  BatteryCharging,
  Eye,
  Radio,
  GripHorizontal
} from 'lucide-react';
import { WidgetMode, FeatureTab, Track, IslandPosition } from '../types/widget';
import { MediaView } from './MediaView';
import { TelemetryView } from './TelemetryView';
import { TimerView } from './TimerView';
import { NotesView } from './NotesView';
import { PeripheralsView } from './PeripheralsView';
import { AudioVisualizer } from './AudioVisualizer';
import { audioEngine } from '../utils/audioEngine';

interface DynamicIslandProps {
  tracks: Track[];
  currentTrack: Track;
  isPlaying: boolean;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  position: IslandPosition;
  autoExpandOnHover: boolean;
  glassTheme: 'acrylic-dark' | 'acrylic-light' | 'fluent-oled';
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
  onOpenSettings?: () => void;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  tracks,
  currentTrack,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  isShuffle,
  isRepeat,
  position,
  autoExpandOnHover,
  glassTheme,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onToggleRepeat,
  onSelectTrack,
  onUploadTrack
}) => {
  const [mode, setMode] = useState<WidgetMode>('compact');
  const [activeTab, setActiveTab] = useState<FeatureTab>('media');
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<number | null>(null);
  const leaveTimeoutRef = useRef<number | null>(null);

  // Global keyboard shortcuts: Ctrl + Space to toggle expand/compact, Escape to close/collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        setMode(prev => prev === 'expanded' ? 'compact' : 'expanded');
      } else if (e.key === 'Escape' && mode === 'expanded') {
        if (!isPinned) {
          setMode('compact');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isPinned]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }

    if (autoExpandOnHover && mode === 'compact' && !isPinned) {
      hoverTimeoutRef.current = window.setTimeout(() => {
        setMode('expanded');
      }, 180);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (mode === 'expanded' && !isPinned) {
      leaveTimeoutRef.current = window.setTimeout(() => {
        setMode('compact');
      }, 350);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Smoothly minimize to discrete dot
    setMode('minimized');
    setIsPinned(false);
  };

  const formatShortTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Glass background styling based on theme
  const getGlassStyle = () => {
    if (glassTheme === 'acrylic-light') {
      return 'glass-island-light text-slate-900 border-white/70 shadow-2xl shadow-slate-900/10';
    }
    if (glassTheme === 'fluent-oled') {
      return 'bg-black/90 backdrop-blur-3xl border border-white/10 text-white shadow-2xl shadow-black/80';
    }
    // Default acrylic dark
    return 'glass-island-dark text-white shadow-2xl shadow-black/60';
  };

  // Position wrapper classes
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-6';
      case 'top-left':
        return 'top-4 left-6';
      case 'floating':
        return 'top-14 left-1/2 -translate-x-1/2';
      case 'top-center':
      default:
        return 'top-2.5 left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-auto transition-all duration-300 select-none`}>
      {/* MINIMIZED MODE: Discrete sleek glowing pill / ambient dot */}
      {mode === 'minimized' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          whileHover={{ scale: 1.08 }}
          onClick={() => setMode('compact')}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-island-dark cursor-pointer group shadow-xl border border-cyan-500/30"
          title="Click to restore Aura Dynamic Island (or press Ctrl + Space)"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 group-hover:scale-125 transition-transform" />
            {isPlaying && (
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping absolute inset-0 opacity-75" />
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-200 group-hover:text-cyan-300 transition-colors">
            {isPlaying ? currentTrack.title : 'Aura Island'}
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>
      )}

      {/* COMPACT & EXPANDED MODES: Fluid Morphing Dynamic Island */}
      {mode !== 'minimized' && mode !== 'closed' && (
        <motion.div
          layout
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 32,
            mass: 0.75
          }}
          className={`relative rounded-[26px] overflow-hidden transition-shadow duration-300 ${getGlassStyle()} ${
            mode === 'compact' 
              ? 'w-[340px] sm:w-[370px] h-[46px] px-3.5 flex items-center cursor-pointer' 
              : 'w-[440px] sm:w-[500px] p-4 flex flex-col'
          }`}
          onClick={() => {
            if (mode === 'compact') {
              setMode('expanded');
            }
          }}
        >
          {/* Subtle Ambient Refraction Glare */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* ================= COMPACT STATE ================= */}
          {mode === 'compact' && (
            <motion.div
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between gap-3 text-xs"
            >
              {/* Left: Album cover artwork / mini vinyl */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative w-7 h-7 rounded-full overflow-hidden shrink-0 border border-white/20 shadow-sm bg-black/40">
                  <img
                    src={currentTrack.coverUrl}
                    alt={currentTrack.title}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}
                  />
                  {/* Vinyl center pin */}
                  <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-slate-900 border border-white/40" />
                </div>

                {/* Track marquee & artist */}
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-white truncate text-[12px] leading-tight flex items-center gap-1.5">
                    {currentTrack.title}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight mt-0.5">
                    {currentTrack.artist}
                  </span>
                </div>
              </div>

              {/* Center / Right: Real-time Audio visualizer & Quick Controls */}
              <div className="flex items-center gap-2.5 shrink-0">
                <AudioVisualizer isPlaying={isPlaying} compact={true} height={16} />

                <span className="text-[10px] font-mono text-slate-400 tabular-nums">
                  {formatShortTime(currentTime)}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPause();
                  }}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-slate-950 text-white flex items-center justify-center transition-all transform active:scale-90"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 fill-current" />
                  ) : (
                    <Play className="w-3 h-3 fill-current translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleClose}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Minimize to discrete ambient dot"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= EXPANDED STATE ================= */}
          {mode === 'expanded' && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col gap-3"
            >
              {/* Island Header with Tabs & Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                {/* Feature Navigation Tabs */}
                <div className="flex items-center gap-1 p-0.5 bg-black/30 rounded-xl border border-white/5">
                  <button
                    onClick={() => setActiveTab('media')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'media'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Music className="w-3.5 h-3.5" />
                    <span>Media</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('telemetry')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'telemetry'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-3.5 h-3.5" />
                    <span>System</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('timer')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'timer'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timer</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'notes'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Notes</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('peripherals')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'peripherals'
                        ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bluetooth className="w-3.5 h-3.5" />
                    <span>Devices</span>
                  </button>
                </div>

                {/* Right Actions: Low-RAM badge, Pin button, Close button */}
                <div className="flex items-center gap-1.5">
                  <span className="hidden sm:inline-flex items-center text-[10px] font-mono text-cyan-300/80 bg-cyan-950/40 border border-cyan-400/20 px-2 py-0.5 rounded-full">
                    12.4 MB RAM
                  </span>

                  {/* Pin toggle */}
                  <button
                    onClick={() => setIsPinned(!isPinned)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isPinned 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30' 
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                    title={isPinned ? 'Unpin (auto-collapses on mouse leave)' : 'Pin (stays open always)'}
                  >
                    <Pin className={`w-3.5 h-3.5 ${isPinned ? 'rotate-45' : ''}`} />
                  </button>

                  {/* Collapse back to compact */}
                  <button
                    onClick={() => setMode('compact')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    title="Collapse to compact pill"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Close / Minimize to Dot */}
                  <button
                    onClick={handleClose}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Minimize to ambient dot"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tab Content Body */}
              <div className="min-h-[220px] flex items-center">
                <AnimatePresence mode="wait">
                  {activeTab === 'media' && (
                    <motion.div
                      key="media"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <MediaView
                        currentTrack={currentTrack}
                        tracks={tracks}
                        isPlaying={isPlaying}
                        currentTime={currentTime}
                        volume={volume}
                        isMuted={isMuted}
                        isShuffle={isShuffle}
                        isRepeat={isRepeat}
                        onPlayPause={onPlayPause}
                        onNext={onNext}
                        onPrev={onPrev}
                        onSeek={onSeek}
                        onVolumeChange={onVolumeChange}
                        onToggleMute={onToggleMute}
                        onToggleShuffle={onToggleShuffle}
                        onToggleRepeat={onToggleRepeat}
                        onSelectTrack={onSelectTrack}
                        onUploadTrack={onUploadTrack}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'telemetry' && (
                    <motion.div
                      key="telemetry"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <TelemetryView />
                    </motion.div>
                  )}

                  {activeTab === 'timer' && (
                    <motion.div
                      key="timer"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <TimerView />
                    </motion.div>
                  )}

                  {activeTab === 'notes' && (
                    <motion.div
                      key="notes"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <NotesView />
                    </motion.div>
                  )}

                  {activeTab === 'peripherals' && (
                    <motion.div
                      key="peripherals"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="w-full"
                    >
                      <PeripheralsView />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Subtle Island Footer Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>Aura HUD</span>
                  </span>
                  <span>·</span>
                  <span>Hover to expand · Esc to collapse</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-slate-300 border border-white/10">
                    Ctrl + Space
                  </kbd>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
};
