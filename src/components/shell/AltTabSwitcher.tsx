import React from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';

export const AltTabSwitcher: React.FC = () => {
  const { isAltTabOpen, windows, altTabIndex } = useOS();

  if (!isAltTabOpen || windows.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[15000] flex items-center justify-center bg-black/50 backdrop-blur-md select-none pointer-events-none">
      <div className="p-4 rounded-2xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow max-w-4xl flex items-center gap-3 overflow-x-auto">
        {windows.map((win, idx) => {
          const isSelected = idx === altTabIndex;
          return (
            <div
              key={win.id}
              className={`w-40 h-28 p-3 rounded-xl flex flex-col justify-between border transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/20 ring-2 ring-blue-500 scale-105'
                  : 'border-neutral-300 dark:border-neutral-700 bg-white/40 dark:bg-black/30 opacity-70'
              }`}
            >
              <div className="flex items-center gap-2">
                <WinIcon name={win.icon} size={18} />
                <span className="text-xs font-semibold truncate text-slate-800 dark:text-slate-100">{win.title}</span>
              </div>
              <div className="w-full h-12 rounded bg-neutral-200/50 dark:bg-neutral-800/50 flex items-center justify-center text-[10px] text-neutral-400">
                Window Preview
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
