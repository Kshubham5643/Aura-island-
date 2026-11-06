import React, { useState } from 'react';
import { Headphones, Mouse, Keyboard, Bluetooth, Check, RefreshCw } from 'lucide-react';
import { PeripheralDevice } from '../types/widget';

export const PeripheralsView: React.FC = () => {
  const [devices, setDevices] = useState<PeripheralDevice[]>([
    {
      id: 'dev-1',
      name: 'Surface Headphones 2',
      type: 'headphones',
      battery: 86,
      connected: true,
      model: 'Bluetooth 5.2 · LDAC Active'
    },
    {
      id: 'dev-2',
      name: 'MX Master 3S',
      type: 'mouse',
      battery: 92,
      connected: true,
      model: 'Logi Bolt 2.4GHz · 8000 DPI'
    },
    {
      id: 'dev-3',
      name: 'Keychron Q1 Pro',
      type: 'keyboard',
      battery: 74,
      connected: true,
      model: 'Wireless ANSI · 1000Hz Polling'
    }
  ]);

  const [isScanning, setIsScanning] = useState(false);

  const toggleConnect = (id: string) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, connected: !d.connected };
      }
      return d;
    }));
  };

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1200);
  };

  const getDeviceIcon = (type: PeripheralDevice['type']) => {
    switch (type) {
      case 'headphones':
        return <Headphones className="w-4 h-4 text-cyan-400" />;
      case 'mouse':
        return <Mouse className="w-4 h-4 text-emerald-400" />;
      case 'keyboard':
        return <Keyboard className="w-4 h-4 text-indigo-400" />;
      default:
        return <Bluetooth className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <div className="w-full flex flex-col gap-3 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Bluetooth className="w-3.5 h-3.5 text-cyan-400" />
          <span>Connected Laptop Peripherals</span>
        </div>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
          <span>{isScanning ? 'Scanning...' : 'Scan'}</span>
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/15 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                {getDeviceIcon(device.type)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{device.name}</span>
                  {device.connected ? (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                      <Check className="w-2.5 h-2.5" /> Paired
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">Disconnected</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {device.model}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
                  {device.battery}%
                </span>
                <div className="w-10 h-1.5 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      device.battery > 30 ? 'bg-emerald-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${device.battery}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => toggleConnect(device.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  device.connected
                    ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
                    : 'text-cyan-300 bg-cyan-500/20 hover:bg-cyan-500/30'
                }`}
              >
                {device.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
