export type WidgetMode = 'compact' | 'expanded' | 'notch' | 'minimized' | 'closed';

export type FeatureTab = 'media' | 'telemetry' | 'timer' | 'notes' | 'peripherals';

export type IslandPosition = 'top-center' | 'top-right' | 'top-left' | 'floating';

export type WallpaperOption = 'win11-dark-bloom' | 'minimal-nordic' | 'obsidian-clean' | 'azure-mesh';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  genre: string;
  bpm: number;
  syntheticPreset: 'celestial' | 'prism' | 'ambient' | 'synthwave';
  customUrl?: string;
}

export interface TelemetryData {
  batteryLevel: number;
  isCharging: boolean;
  batteryHealth: string;
  estimatedHoursLeft: number;
  ramUsageMB: number;
  ramTotalGB: number;
  cpuUsagePercent: number;
  networkLatencyMs: number;
  thermalProfile: 'Silent' | 'Balanced' | 'Performance';
}

export interface PeripheralDevice {
  id: string;
  name: string;
  type: 'headphones' | 'mouse' | 'keyboard' | 'display';
  battery: number;
  connected: boolean;
  model: string;
}
