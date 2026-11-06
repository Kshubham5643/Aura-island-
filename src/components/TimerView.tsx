import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Bell } from 'lucide-react';
import confetti from 'canvas-confetti';

export const TimerView: React.FC = () => {
  const [mode, setMode] = useState<'pomodoro' | 'quick' | 'stopwatch'>('pomodoro');
  const [totalSeconds, setTotalSeconds] = useState(25 * 60);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRunning) {
      if (mode === 'stopwatch') {
        const startTime = Date.now() - stopwatchMs;
        intervalRef.current = window.setInterval(() => {
          setStopwatchMs(Date.now() - startTime);
        }, 30);
      } else {
        intervalRef.current = window.setInterval(() => {
          setSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(intervalRef.current!);
              setIsRunning(false);
              triggerCompletion();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode]);

  const triggerCompletion = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.2 }
      });
    } catch {
      // ignore
    }
  };

  const handleSetPreset = (mins: number) => {
    setIsRunning(false);
    setTotalSeconds(mins * 60);
    setSecondsLeft(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setStopwatchMs(0);
      setLaps([]);
    } else {
      setSecondsLeft(totalSeconds);
    }
  };

  const handleLap = () => {
    if (mode === 'stopwatch' && isRunning) {
      setLaps(prev => [stopwatchMs, ...prev]);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'stopwatch' 
    ? (stopwatchMs % 60000) / 60000 
    : (totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0);

  return (
    <div className="w-full flex flex-col gap-3.5 text-slate-100">
      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
          <button
            onClick={() => { setMode('pomodoro'); handleSetPreset(25); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'pomodoro' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            25m Focus
          </button>
          <button
            onClick={() => { setMode('quick'); handleSetPreset(5); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'quick' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            5m Break
          </button>
          <button
            onClick={() => { setMode('stopwatch'); setIsRunning(false); }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              mode === 'stopwatch' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stopwatch
          </button>
        </div>

        {mode !== 'stopwatch' && (
          <div className="flex items-center gap-1">
            {[10, 15, 45].map(mins => (
              <button
                key={mins}
                onClick={() => handleSetPreset(mins)}
                className="px-2 py-0.5 rounded text-[11px] font-mono text-slate-400 hover:text-cyan-300 hover:bg-white/5"
              >
                {mins}m
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Display: Circular Progress with Digits */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-4">
          {/* Circular SVG Ring */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-white/10"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-300"
                strokeDasharray={`${progress * 100}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <Bell className={`w-4 h-4 absolute ${isRunning ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono tracking-tight text-white tabular-nums">
              {mode === 'stopwatch' ? formatStopwatch(stopwatchMs) : formatCountdown(secondsLeft)}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {mode === 'pomodoro' ? 'Pomodoro Session Active' : mode === 'quick' ? 'Short Recovery Interval' : 'Precision Stopwatch'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {mode === 'stopwatch' && isRunning && (
            <button
              onClick={handleLap}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-colors"
            >
              Lap
            </button>
          )}

          <button
            onClick={() => setIsRunning(!isRunning)}
            className="w-10 h-10 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 flex items-center justify-center font-semibold shadow-md shadow-cyan-500/20 transition-all"
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          </button>

          <button
            onClick={handleReset}
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Laps List for stopwatch */}
      {mode === 'stopwatch' && laps.length > 0 && (
        <div className="max-h-24 overflow-y-auto no-scrollbar flex flex-col gap-1 pr-1">
          {laps.slice(0, 4).map((lapTime, i) => (
            <div key={i} className="flex justify-between items-center text-xs font-mono text-slate-400 py-0.5 px-2 rounded bg-white/5">
              <span>Lap {laps.length - i}</span>
              <span className="text-slate-200 tabular-nums">{formatStopwatch(lapTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
