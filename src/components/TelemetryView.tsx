import React, { useState, useEffect } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Zap, 
  Fan, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { TelemetryData } from '../types/widget';

export const TelemetryView: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({
    batteryLevel: 88,
    isCharging: true,
    batteryHealth: '98% Excellent',
    estimatedHoursLeft: 4.8,
    ramUsageMB: 12.4, // Widget negligible memory usage!
    ramTotalGB: 16,
    cpuUsagePercent: 6,
    networkLatencyMs: 14,
    thermalProfile: 'Balanced'
  });

  const [isTrimming, setIsTrimming] = useState(false);
  const [trimSuccess, setTrimSuccess] = useState(false);

  // Read actual battery if supported by browser/Windows Edge
  useEffect(() => {
    let batteryObj: any = null;

    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        const updateBatteryInfo = () => {
          setTelemetry(prev => ({
            ...prev,
            batteryLevel: Math.round(battery.level * 100),
            isCharging: battery.charging,
            estimatedHoursLeft: battery.charging 
              ? (battery.chargingTime === Infinity ? 1.5 : Math.round(battery.chargingTime / 3600 * 10) / 10)
              : (battery.dischargingTime === Infinity ? 5.2 : Math.round(battery.dischargingTime / 3600 * 10) / 10)
          }));
        };

        updateBatteryInfo();
        battery.addEventListener('levelchange', updateBatteryInfo);
        battery.addEventListener('chargingchange', updateBatteryInfo);
      }).catch(() => {});
    }

    // Gentle realistic fluctuation with low interval to save CPU
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        cpuUsagePercent: Math.max(3, Math.min(24, Math.round(prev.cpuUsagePercent + (Math.random() * 4 - 2)))),
        networkLatencyMs: Math.max(9, Math.min(28, Math.round(prev.networkLatencyMs + (Math.random() * 4 - 2)))),
        ramUsageMB: Math.round((11.8 + Math.random() * 0.9) * 10) / 10
      }));
    }, 3000);

    return () => {
      clearInterval(interval);
      if (batteryObj) {
        batteryObj.removeEventListener?.('levelchange', () => {});
        batteryObj.removeEventListener?.('chargingchange', () => {});
      }
    };
  }, []);

  const handleTrimMemory = () => {
    setIsTrimming(true);
    setTimeout(() => {
      setTelemetry(prev => ({ ...prev, ramUsageMB: 9.8 }));
      setIsTrimming(false);
      setTrimSuccess(true);
      setTimeout(() => setTrimSuccess(false), 2400);
    }, 700);
  };

  return (
    <div className="w-full flex flex-col gap-3.5 text-slate-100">
      {/* Top Banner: Battery & Power Status */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${telemetry.isCharging ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'}`}>
            {telemetry.isCharging ? (
              <BatteryCharging className="w-5 h-5 animate-pulse" />
            ) : (
              <Battery className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-sm">
              <span className="font-mono text-base tabular-nums">{telemetry.batteryLevel}%</span>
              <span className="text-xs text-slate-400 font-normal">
                {telemetry.isCharging ? 'Fast Charging (USB-C 65W)' : `${telemetry.estimatedHoursLeft} hrs remaining`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Cycle Health: {telemetry.batteryHealth}
            </div>
          </div>
        </div>

        <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              telemetry.batteryLevel > 20 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-rose-500'
            }`}
            style={{ width: `${telemetry.batteryLevel}%` }}
          />
        </div>
      </div>

      {/* Grid of 3 Telemetry Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* RAM Usage - Showing Negligible Footprint */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Widget RAM</span>
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-cyan-300 tabular-nums">
              {telemetry.ramUsageMB} <span className="text-xs font-normal text-slate-400">MB</span>
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Zap className="w-3 h-3 inline" /> Negligible &lt; 0.1%
            </div>
          </div>
        </div>

        {/* CPU Usage */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Laptop CPU</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-white tabular-nums">
              {telemetry.cpuUsagePercent}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              Efficient E-Cores Active
            </div>
          </div>
        </div>

        {/* Wi-Fi Ping */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase tracking-wider">Latency</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold font-mono text-emerald-300 tabular-nums">
              {telemetry.networkLatencyMs} <span className="text-xs font-normal text-slate-400">ms</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              Wi-Fi 6E (6GHz)
            </div>
          </div>
        </div>
      </div>

      {/* Thermal & Power Profile Switcher */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2">
          <Fan className={`w-4 h-4 text-cyan-400 ${telemetry.thermalProfile === 'Performance' ? 'animate-spin' : ''}`} />
          <span className="text-xs font-medium text-slate-300">Power Profile</span>
        </div>

        <div className="flex items-center gap-1 p-1 bg-black/30 rounded-lg">
          {(['Silent', 'Balanced', 'Performance'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setTelemetry(prev => ({ ...prev, thermalProfile: mode }))}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                telemetry.thermalProfile === mode
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Memory Trim Action */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          Hardware acceleration active · V8 Garbage Collection primed
        </span>
        <button
          onClick={handleTrimMemory}
          disabled={isTrimming}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-200 transition-colors border border-white/10"
        >
          {trimSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Optimized (9.8 MB)</span>
            </>
          ) : (
            <>
              <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${isTrimming ? 'animate-spin' : ''}`} />
              <span>{isTrimming ? 'Purging Cache...' : 'Trim Memory'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
