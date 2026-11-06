/**
 * Ultra-optimized Web Audio Engine
 * Lightweight synthesizer with AnalyserNode for real-time visualization.
 * Designed for negligible memory footprint (<5MB) and zero CPU draw when paused.
 */

class LightweightAudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentVolume: number = 0.75;
  private timerId: number | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private audioElement: HTMLAudioElement | null = null;
  private isCustomAudio: boolean = false;
  private currentPlaybackTime: number = 0;
  private trackDuration: number = 214;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onEndedCallback: (() => void) | null = null;

  private chordProgressions: Record<string, number[][]> = {
    celestial: [
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [196.00, 246.94, 293.66, 349.23], // G7
    ],
    prism: [
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [220.00, 277.18, 329.63, 415.30], // Aaug
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [246.94, 293.66, 369.99, 440.00], // Bm7b5
    ],
    ambient: [
      [146.83, 220.00, 293.66, 369.99], // Dmaj9
      [164.81, 246.94, 329.63, 392.00], // Em7
      [196.00, 293.66, 392.00, 493.88], // Gmaj7
      [220.00, 329.63, 440.00, 554.37], // Amaj7
    ],
    synthwave: [
      [110.00, 164.81, 220.00, 277.18], // A5
      [98.00, 146.83, 196.00, 246.94],  // G5
      [87.31, 130.81, 174.61, 220.00],  // F5
      [130.81, 196.00, 261.63, 329.63], // C5
    ]
  };

  private currentPreset: 'celestial' | 'prism' | 'ambient' | 'synthwave' = 'celestial';
  private stepIndex: number = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64; // Small FFT size for minimal CPU usage (32 frequency bins)
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);

      this.analyser.connect(this.ctx.destination);
      this.gainNode.connect(this.analyser);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setCallbacks(onTimeUpdate: (time: number) => void, onEnded: () => void) {
    this.onTimeUpdateCallback = onTimeUpdate;
    this.onEndedCallback = onEnded;
  }

  public setPreset(preset: 'celestial' | 'prism' | 'ambient' | 'synthwave', duration: number = 214) {
    this.currentPreset = preset;
    this.trackDuration = duration;
    this.currentPlaybackTime = 0;
    this.isCustomAudio = false;
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }
  }

  public async loadCustomAudio(file: File): Promise<string> {
    this.initContext();
    this.isCustomAudio = true;
    this.stopSynthesizer();

    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      const source = this.ctx!.createMediaElementSource(this.audioElement);
      source.connect(this.gainNode!);
      
      this.audioElement.addEventListener('timeupdate', () => {
        if (this.audioElement) {
          this.currentPlaybackTime = this.audioElement.currentTime;
          this.onTimeUpdateCallback?.(this.currentPlaybackTime);
        }
      });
      
      this.audioElement.addEventListener('ended', () => {
        this.isPlaying = false;
        this.onEndedCallback?.();
      });
    }

    const objectUrl = URL.createObjectURL(file);
    this.audioElement.src = objectUrl;
    await this.audioElement.load();
    this.audioElement.volume = this.currentVolume;
    return objectUrl;
  }

  public play() {
    this.initContext();
    this.isPlaying = true;

    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.play().catch(() => {});
      return;
    }

    // Start lightweight generative synth loop
    this.startSynthesizer();
  }

  public pause() {
    this.isPlaying = false;
    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.pause();
    }
    this.stopSynthesizer();

    // Suspend audio context when paused to reduce RAM/CPU to 0
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend().catch(() => {});
    }
  }

  public seek(seconds: number) {
    this.currentPlaybackTime = Math.max(0, Math.min(seconds, this.trackDuration));
    if (this.isCustomAudio && this.audioElement) {
      this.audioElement.currentTime = this.currentPlaybackTime;
    }
    this.onTimeUpdateCallback?.(this.currentPlaybackTime);
  }

  public setVolume(volume: number) {
    this.currentVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.currentVolume;
    }
  }

  private startSynthesizer() {
    if (this.timerId !== null) return;

    const playChordStep = () => {
      if (!this.isPlaying || !this.ctx || this.isCustomAudio) return;

      const chords = this.chordProgressions[this.currentPreset] || this.chordProgressions.celestial;
      const currentChord = chords[this.stepIndex % chords.length];
      this.stepIndex++;

      // Trigger chord notes
      const now = this.ctx.currentTime;
      const stepDuration = 2.4; // 2.4s per chord

      currentChord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800 + (idx * 200), now);
        filter.frequency.exponentialRampToValueAtTime(300, now + stepDuration);

        // Gentle envelope (attack 0.3s, decay)
        const peak = 0.12 / currentChord.length;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.exponentialRampToValueAtTime(peak, now + 0.3);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + stepDuration);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.gainNode!);

        osc.start(now);
        osc.stop(now + stepDuration);

        this.activeOscillators.push(osc);
        setTimeout(() => {
          const oscIdx = this.activeOscillators.indexOf(osc);
          if (oscIdx !== -1) this.activeOscillators.splice(oscIdx, 1);
        }, stepDuration * 1000);
      });

      // Update virtual playback time
      this.currentPlaybackTime += stepDuration;
      if (this.currentPlaybackTime >= this.trackDuration) {
        this.currentPlaybackTime = 0;
        this.onEndedCallback?.();
      } else {
        this.onTimeUpdateCallback?.(this.currentPlaybackTime);
      }

      this.timerId = window.setTimeout(playChordStep, stepDuration * 1000);
    };

    playChordStep();
  }

  private stopSynthesizer() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.activeOscillators = [];
  }

  public getFrequencyData(array: Uint8Array<ArrayBufferLike>): void {
    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(array as unknown as Uint8Array<ArrayBuffer>);
    } else {
      array.fill(0);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public destroy() {
    this.pause();
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement = null;
    }
    if (this.ctx) {
      this.ctx.close().catch(() => {});
      this.ctx = null;
    }
  }
}

export const audioEngine = new LightweightAudioEngine();
