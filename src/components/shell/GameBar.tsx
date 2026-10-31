import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const GameBar: React.FC = () => {
  const { isGameBarOpen, toggleGameBar, addNotification } = useOS();

  const [fps, setFps] = useState<number>(144);
  const [gpu, setGpu] = useState<number>(32);

  useEffect(() => {
    if (!isGameBarOpen) return;
    const interval = setInterval(() => {
      setFps(140 + Math.floor(Math.random() * 5));
      setGpu(28 + Math.floor(Math.random() * 8));
    }, 800);
    return () => clearInterval(interval);
  }, [isGameBarOpen]);

  if (!isGameBarOpen) return null;

  const handleScreenshot = () => {
    soundManager.playShutter();
    addNotification('Xbox Game Bar', 'Game clip / screenshot saved to Videos\\Captures', 'Game Bar');
  };

  return (
    <div
      className="fixed inset-0 z-[14000] bg-black/40 backdrop-blur-sm p-6 select-none animate-win11-open"
      onClick={toggleGameBar}
    >
      {/* Top Controller Bar */}
      <div
        className="max-w-md mx-auto p-2 rounded-2xl bg-neutral-900/90 border border-neutral-700/80 win11-window-shadow text-white flex items-center justify-between"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-3 py-1 font-bold text-xs">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black font-extrabold text-[11px]">
            X
          </div>
          <span>Xbox Game Bar</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleScreenshot}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Take screenshot (Win + Alt + PrtScn)"
          >
            <WinIcon name="camera" size={16} />
          </button>
          <button
            onClick={handleScreenshot}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Record that (Win + Alt + G)"
          >
            <WinIcon name="play-circle" size={16} />
          </button>
          <button
            onClick={toggleGameBar}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-white"
          >
            <WinIcon name="close" size={14} />
          </button>
        </div>
      </div>

      {/* Performance Telemetry Floating Widget */}
      <div
        className="absolute top-24 left-8 w-60 p-4 rounded-xl bg-neutral-900/90 border border-neutral-700/80 win11-window-shadow text-white text-xs space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-400">Performance</span>
          <span className="text-[10px] text-emerald-400 font-semibold font-mono">144Hz DISPLAY</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-neutral-400">FPS</span>
          <span className="text-xl font-bold font-mono tabular-nums text-emerald-400">{fps}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-neutral-400">GPU</span>
          <span className="font-bold font-mono tabular-nums">{gpu}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-neutral-400">CPU</span>
          <span className="font-bold font-mono tabular-nums">18%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-neutral-400">VRAM</span>
          <span className="font-bold font-mono tabular-nums">4.2 / 12 GB</span>
        </div>
      </div>
    </div>
  );
};
