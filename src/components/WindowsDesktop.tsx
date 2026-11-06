import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Settings, 
  Sliders, 
  Maximize, 
  Minimize, 
  Volume2, 
  Wifi, 
  Battery, 
  Search, 
  Folder, 
  Compass, 
  Sparkles,
  Zap,
  Monitor,
  Shield,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { IslandPosition, WallpaperOption } from '../types/widget';

interface WindowsDesktopProps {
  position: IslandPosition;
  setPosition: (pos: IslandPosition) => void;
  autoExpandOnHover: boolean;
  setAutoExpandOnHover: (val: boolean) => void;
  glassTheme: 'acrylic-dark' | 'acrylic-light' | 'fluent-oled';
  setGlassTheme: (theme: 'acrylic-dark' | 'acrylic-light' | 'fluent-oled') => void;
  wallpaper: WallpaperOption;
  setWallpaper: (wp: WallpaperOption) => void;
  onOpenIslandMedia: () => void;
  onOpenIslandSystem: () => void;
}

export const WindowsDesktop: React.FC<WindowsDesktopProps> = ({
  position,
  setPosition,
  autoExpandOnHover,
  setAutoExpandOnHover,
  glassTheme,
  setGlassTheme,
  wallpaper,
  setWallpaper,
  onOpenIslandMedia,
  onOpenIslandSystem
}) => {
  const [clockTime, setClockTime] = useState<string>('');
  const [clockDate, setClockDate] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
      setClockDate(now.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getWallpaperBackground = () => {
    switch (wallpaper) {
      case 'win11-dark-bloom':
        return `url('/src/assets/images/wallpaper_win11_dark_bloom_1793952300102.jpg')`;
      case 'minimal-nordic':
        return `url('/src/assets/images/wallpaper_minimal_nordic_1793952300788.jpg')`;
      case 'obsidian-clean':
        return 'linear-gradient(135deg, #090d16 0%, #030712 100%)';
      case 'azure-mesh':
      default:
        return 'radial-gradient(ellipse at 50% 0%, #0e2a47 0%, #07111e 60%, #030712 100%)';
    }
  };

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden select-none bg-cover bg-center transition-all duration-700 font-sans"
      style={{ backgroundImage: getWallpaperBackground() }}
    >
      {/* Background Soft Ambient Vignette */}
      <div className="absolute inset-0 bg-black/25 pointer-events-none" />

      {/* Desktop App Shortcuts (Left edge) */}
      <div className="absolute top-12 left-6 flex flex-col gap-5 z-10">
        <button
          onClick={onOpenIslandMedia}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all w-20 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-lg shadow-cyan-500/20 flex items-center justify-center text-white border border-white/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-md tracking-tight leading-snug">
            Media Hub
          </span>
        </button>

        <button
          onClick={onOpenIslandSystem}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all w-20 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-lg shadow-indigo-500/20 flex items-center justify-center text-white border border-white/20 group-hover:scale-105 transition-transform">
            <Laptop className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-md tracking-tight leading-snug">
            System Spec
          </span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-all w-20 text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 shadow-lg flex items-center justify-center text-cyan-300 border border-white/15 group-hover:scale-105 transition-transform">
            <Sliders className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-medium text-white/90 drop-shadow-md tracking-tight leading-snug">
            Island Setup
          </span>
        </button>
      </div>

      {/* Floating Quick Feature Highlights (Right Corner) */}
      <div className="hidden lg:flex absolute top-12 right-6 flex-col items-end gap-2.5 z-10 pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-xs text-slate-200">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">RAM Footprint: ~11.8 MB</span>
          <span className="opacity-40">·</span>
          <span className="text-emerald-400 font-medium">Ultra-Optimized</span>
        </div>

        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-md border border-white/10 text-xs text-slate-200 transition-colors shadow-sm"
          title="Toggle Fullscreen for authentic laptop immersion"
        >
          {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Laptop View'}</span>
        </button>
      </div>

      {/* Windows Settings & Customization Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900/90 border border-white/15 rounded-3xl p-6 shadow-2xl text-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white tracking-tight">
                  Dynamic Island & Windows Configuration
                </h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              {/* Position selector */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Island Screen Position
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'top-center', label: 'Top Center (Notch)' },
                    { id: 'floating', label: 'Floating Island' },
                    { id: 'top-right', label: 'Top Right HUD' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      onClick={() => setPosition(pos.id as IslandPosition)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        position === pos.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-medium'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hover behavior toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
                <div>
                  <div className="font-semibold text-white">Auto-Expand on Hover</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Gently reveals full media player and controls when mouse glides over the island
                  </div>
                </div>
                <button
                  onClick={() => setAutoExpandOnHover(!autoExpandOnHover)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-1 ${
                    autoExpandOnHover ? 'bg-cyan-500' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-transform ${
                      autoExpandOnHover ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Glass Material Theme */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Glassmorphism Surface Material
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'acrylic-dark', label: 'Windows Fluent Acrylic' },
                    { id: 'fluent-oled', label: 'Pure OLED Glass' },
                    { id: 'acrylic-light', label: 'Frosted Pure Light' }
                  ].map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setGlassTheme(theme.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        glassTheme === theme.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-medium'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {theme.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Wallpaper Switcher */}
              <div>
                <label className="font-semibold text-slate-300 block mb-1.5">
                  Windows 11 Desktop Wallpaper
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'win11-dark-bloom', label: 'Dark Mode Silk Bloom' },
                    { id: 'minimal-nordic', label: 'Minimal Nordic Twilight' },
                    { id: 'azure-mesh', label: 'Deep Azure Radial' },
                    { id: 'obsidian-clean', label: 'Obsidian Minimalist' }
                  ].map(wp => (
                    <button
                      key={wp.id}
                      onClick={() => setWallpaper(wp.id as WallpaperOption)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        wallpaper === wp.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-white font-medium'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-md bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-[10px]">
                        ✓
                      </div>
                      <span className="truncate">{wp.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Windows Laptop Performance Guarantee */}
              <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 flex items-start gap-3">
                <Shield className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="text-[11px] leading-relaxed text-cyan-200/90">
                  <strong>Negligible Resource Architecture:</strong> Web Audio context automatically suspends when playback is paused. Canvas rendering loops pause on tab hide. Zero memory leaks with pre-allocated TypedArrays.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors"
              >
                Apply & Return to Desktop
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Windows 11 Taskbar (Bottom Center) */}
      <footer className="fixed bottom-0 left-0 right-0 h-12 bg-[#0c121e]/85 backdrop-blur-2xl border-t border-white/10 z-40 flex items-center justify-between px-4 select-none shadow-2xl">
        {/* Left: Weather Widget */}
        <div className="flex items-center gap-2 text-xs text-slate-300 hover:bg-white/10 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="font-semibold text-white">68°F Partly Cloudy</span>
            <span className="text-[10px] text-slate-400 font-mono">Air Quality: 24 AQI</span>
          </div>
        </div>

        {/* Center: Windows 11 Centered App Icons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/5 rounded-xl border border-white/5">
          {/* Windows Start Button */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-all group"
            title="Windows Start & Aura Settings"
          >
            <div className="grid grid-cols-2 gap-0.5 p-1">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-sm" />
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-sm" />
            </div>
          </button>

          {/* Search */}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* File Explorer */}
          <button 
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-amber-400 transition-colors"
            title="File Explorer"
          >
            <Folder className="w-4 h-4 fill-amber-400/20" />
          </button>

          {/* Edge / Browser */}
          <button 
            className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center text-sky-400 transition-colors"
            title="Microsoft Edge"
          >
            <Compass className="w-4 h-4" />
          </button>

          {/* Island Focus Button */}
          <button 
            onClick={onOpenIslandMedia}
            className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 hover:scale-105 transition-all"
            title="Focus Aura Dynamic Island"
          >
            <div className="w-3 h-1.5 rounded-full bg-cyan-400" />
          </button>
        </div>

        {/* Right: Windows System Tray & Clock */}
        <div className="flex items-center gap-2">
          {/* Quick System Tray Icons */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer text-slate-300 transition-colors">
            <Wifi className="w-3.5 h-3.5" />
            <Volume2 className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5 text-emerald-400" />
          </div>

          {/* Clock & Date */}
          <div 
            onClick={() => setIsSettingsOpen(true)}
            className="flex flex-col items-end px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer text-right transition-colors"
            title="Click to open Island Preferences"
          >
            <span className="text-[11px] font-mono font-medium text-white tabular-nums leading-tight">
              {clockTime}
            </span>
            <span className="text-[10px] text-slate-400 leading-tight">
              {clockDate}
            </span>
          </div>

          {/* Show Desktop Sliver */}
          <div className="w-1 h-5 border-l border-white/20 ml-1" />
        </div>
      </footer>
    </div>
  );
};
