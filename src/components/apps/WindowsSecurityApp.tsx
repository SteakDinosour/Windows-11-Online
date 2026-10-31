import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const WindowsSecurityApp: React.FC = () => {
  const { addNotification } = useOS();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scannedFilesCount, setScannedFilesCount] = useState<number>(0);
  const [lastScanTime, setLastScanTime] = useState<string>('Today at 9:15 AM');

  const handleStartScan = () => {
    soundManager.playClick();
    setIsScanning(true);
    setScanProgress(0);
    setScannedFilesCount(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setLastScanTime('Just now');
          soundManager.playNotification();
          addNotification('Windows Security', 'Quick scan complete. 0 threats found.', 'Windows Security');
          return 100;
        }
        setScannedFilesCount(c => c + Math.floor(Math.random() * 250) + 180);
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Sidebar */}
      <div className="w-56 p-3 border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525] text-xs font-semibold space-y-1">
        <div className="flex items-center gap-2 px-3 py-2 mb-2 text-sky-500 font-bold">
          <WinIcon name="shield-check" size={18} />
          <span>Security at a glance</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold">Virus & threat protection</h2>
          <p className="text-xs text-neutral-400">Current threats and automated Defender telemetry</p>
        </div>

        {/* Protection Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-500">
              <WinIcon name="shield-check" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm">No current threats</h3>
              <p className="text-xs text-neutral-400">Last scan: {lastScanTime} (Quick scan)</p>
            </div>
          </div>

          {isScanning ? (
            <div className="p-4 rounded-xl bg-neutral-100 dark:bg-[#202020] space-y-2 text-xs">
              <div className="flex justify-between font-medium">
                <span>Scanning system files...</span>
                <span className="font-mono tabular-nums">{scanProgress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <div className="text-[11px] text-neutral-400 font-mono tabular-nums">
                Files scanned: {scannedFilesCount.toLocaleString()}
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartScan}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              Quick scan
            </button>
          )}
        </div>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          {[
            { title: 'Firewall & network protection', desc: 'Domain, private, and public networks active', icon: 'wifi' },
            { title: 'App & browser control', desc: 'Reputation-based SmartScreen enabled', icon: 'globe' },
            { title: 'Device security', desc: 'Core isolation & TPM 2.0 active', icon: 'monitor' },
            { title: 'Device performance & health', desc: 'Storage capacity and apps report nominal', icon: 'activity' },
          ].map(item => (
            <div
              key={item.title}
              className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                <WinIcon name="shield-check" size={16} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{item.title}</h4>
                <p className="text-[11px] text-neutral-400 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
