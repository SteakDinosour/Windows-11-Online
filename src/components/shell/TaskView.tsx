import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const TaskView: React.FC = () => {
  const { isTaskViewOpen, toggleTaskView, windows, focusWindow } = useOS();

  const [desktops, setDesktops] = useState<string[]>(['Desktop 1', 'Desktop 2']);
  const [activeDesktopIndex, setActiveDesktopIndex] = useState<number>(0);

  if (!isTaskViewOpen) return null;

  const handleAddDesktop = () => {
    soundManager.playClick();
    setDesktops(prev => [...prev, `Desktop ${prev.length + 1}`]);
  };

  return (
    <div
      className="fixed inset-0 z-[12000] bg-black/60 backdrop-blur-xl flex flex-col justify-between p-8 select-none animate-win11-open"
      onClick={toggleTaskView}
    >
      {/* Top Desktops Bar */}
      <div
        className="flex items-center justify-center gap-4 py-4"
        onClick={e => e.stopPropagation()}
      >
        {desktops.map((d, idx) => (
          <button
            key={d}
            onClick={() => setActiveDesktopIndex(idx)}
            className={`w-44 h-24 p-2 rounded-xl border flex flex-col justify-between transition-all ${
              idx === activeDesktopIndex
                ? 'border-blue-500 ring-2 ring-blue-500 bg-blue-500/10'
                : 'border-white/20 bg-white/5 hover:border-white/40'
            }`}
          >
            <span className="text-xs font-semibold text-white">{d}</span>
            <div className="w-full h-12 rounded bg-white/10 flex items-center justify-center text-[10px] text-neutral-400">
              Workspace
            </div>
          </button>
        ))}

        <button
          onClick={handleAddDesktop}
          className="w-32 h-24 rounded-xl border border-dashed border-white/20 hover:border-white/40 bg-white/5 flex flex-col items-center justify-center gap-1.5 text-neutral-300 hover:text-white transition-colors"
        >
          <WinIcon name="plus" size={18} />
          <span className="text-xs font-medium">New desktop</span>
        </button>
      </div>

      {/* Open Windows Grid */}
      <div
        className="flex-1 flex flex-wrap items-center justify-center gap-6 p-6 overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {windows.length === 0 ? (
          <div className="text-neutral-400 text-sm">No open windows on this desktop</div>
        ) : (
          windows.map(win => (
            <div
              key={win.id}
              onClick={() => {
                focusWindow(win.id);
                toggleTaskView();
              }}
              className="w-72 h-48 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:border-sky-500 shadow-2xl p-3 flex flex-col justify-between cursor-pointer transition-transform hover:scale-105 group"
            >
              <div className="flex items-center gap-2 text-white">
                <WinIcon name={win.icon} size={16} />
                <span className="text-xs font-semibold truncate">{win.title}</span>
              </div>

              <div className="w-full h-32 rounded-lg bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 group-hover:bg-neutral-750">
                Window Viewport
              </div>
            </div>
          ))
        )}
      </div>

      <div className="text-center text-neutral-400 text-xs py-2">
        Click a window to switch to it, or click the background to return to desktop
      </div>
    </div>
  );
};
