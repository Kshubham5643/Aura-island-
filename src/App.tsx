/**
 * Aura Island - Windows Dynamic Island & Glass HUD
 * Ultra-optimized, low-resource Dynamic Island widget with real-time media playback.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DynamicIsland } from './components/DynamicIsland';
import { WindowsDesktop } from './components/WindowsDesktop';
import { DEFAULT_TRACKS } from './data/defaultTracks';
import { Track, IslandPosition, WallpaperOption } from './types/widget';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);

  // Widget settings
  const [position, setPosition] = useState<IslandPosition>('top-center');
  const [autoExpandOnHover, setAutoExpandOnHover] = useState<boolean>(true);
  const [glassTheme, setGlassTheme] = useState<'acrylic-dark' | 'acrylic-light' | 'fluent-oled'>('acrylic-dark');
  const [wallpaper, setWallpaper] = useState<WallpaperOption>('win11-dark-bloom');

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Configure Audio Engine Callbacks
  const handleNext = useCallback(() => {
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * tracks.length);
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
    }
  }, [isShuffle, tracks.length]);

  const handlePrev = useCallback(() => {
    setCurrentTrackIndex(prev => (prev - 1 + tracks.length) % tracks.length);
  }, [tracks.length]);

  useEffect(() => {
    audioEngine.setCallbacks(
      (time) => setCurrentTime(time),
      () => {
        if (isRepeat) {
          audioEngine.seek(0);
          audioEngine.play();
        } else {
          handleNext();
        }
      }
    );

    return () => {
      audioEngine.destroy();
    };
  }, [isRepeat, handleNext]);

  // Update audio engine when current track changes
  useEffect(() => {
    if (!currentTrack.customUrl) {
      audioEngine.setPreset(currentTrack.syntheticPreset, currentTrack.duration);
      if (isPlaying) {
        audioEngine.play();
      }
    }
  }, [currentTrackIndex, currentTrack]);

  // Play / Pause toggle
  const handlePlayPause = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleVolumeChange = (vol: number) => {
    setVolume(vol);
    if (isMuted && vol > 0) {
      setIsMuted(false);
    }
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioEngine.setVolume(volume);
    } else {
      setIsMuted(true);
      audioEngine.setVolume(0);
    }
  };

  const handleSelectTrack = (track: Track) => {
    const idx = tracks.findIndex(t => t.id === track.id);
    if (idx !== -1) {
      setCurrentTrackIndex(idx);
      setCurrentTime(0);
      setIsPlaying(true);
      if (!track.customUrl) {
        audioEngine.setPreset(track.syntheticPreset, track.duration);
        audioEngine.play();
      }
    }
  };

  const handleUploadTrack = async (file: File) => {
    const customUrl = await audioEngine.loadCustomAudio(file);
    const newTrack: Track = {
      id: `custom-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local Media (Windows)',
      album: 'Laptop Library',
      duration: 240, // estimated until metadata loads
      coverUrl: '/src/assets/images/album_midnight_echoes_1793952298593.jpg',
      genre: 'Custom Audio',
      bpm: 120,
      syntheticPreset: 'celestial',
      customUrl
    };

    setTracks(prev => [newTrack, ...prev]);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    audioEngine.play();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Dynamic Island Floating Centerpiece */}
      <DynamicIsland
        tracks={tracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        isRepeat={isRepeat}
        position={position}
        autoExpandOnHover={autoExpandOnHover}
        glassTheme={glassTheme}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrev={handlePrev}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        onSelectTrack={handleSelectTrack}
        onUploadTrack={handleUploadTrack}
      />

      {/* Windows 11 Desktop Canvas Simulator */}
      <WindowsDesktop
        position={position}
        setPosition={setPosition}
        autoExpandOnHover={autoExpandOnHover}
        setAutoExpandOnHover={setAutoExpandOnHover}
        glassTheme={glassTheme}
        setGlassTheme={setGlassTheme}
        wallpaper={wallpaper}
        setWallpaper={setWallpaper}
        onOpenIslandMedia={() => {
          // Trigger audio playback
          if (!isPlaying) handlePlayPause();
        }}
        onOpenIslandSystem={() => {
          // focus system
        }}
      />
    </div>
  );
}
