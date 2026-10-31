import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const OnScreenKeyboard: React.FC = () => {
  const { isOnScreenKeyboardOpen, toggleOnScreenKeyboard, copyToClipboard } = useOS();
  const [shift, setShift] = useState(false);
  const [typed, setTyped] = useState('');

  if (!isOnScreenKeyboardOpen) return null;

  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ];

  const handleKey = (key: string) => {
    soundManager.playClick();
    if (key === 'Backspace') {
      setTyped(t => t.slice(0, -1));
    } else if (key === 'Enter') {
      setTyped(t => t + '\n');
    } else if (key === 'Tab') {
      setTyped(t => t + '  ');
    } else if (key === 'Shift' || key === 'Caps') {
      setShift(!shift);
    } else {
      setTyped(t => t + (shift ? key.toUpperCase() : key));
    }
  };

  return (
    <div
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[13000] p-3 rounded-2xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100 select-none animate-win11-open max-w-2xl w-full"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700 mb-2">
        <span className="font-semibold text-xs">On-Screen Keyboard</span>
        <button onClick={toggleOnScreenKeyboard} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
          <WinIcon name="close" size={14} />
        </button>
      </div>

      {typed && (
        <div className="mb-2 p-2 rounded bg-white/50 dark:bg-black/30 font-mono text-xs truncate">
          {typed}
        </div>
      )}

      <div className="space-y-1 text-xs font-semibold">
        {rows.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 justify-center">
            {row.map(k => (
              <button
                key={k}
                onClick={() => handleKey(k)}
                className={`py-2 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors ${
                  k === 'Backspace' || k === 'Enter' || k === 'Shift' || k === 'Tab' || k === 'Caps'
                    ? 'px-3 bg-neutral-200 dark:bg-neutral-800'
                    : 'w-10 bg-white dark:bg-neutral-750 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {shift && k.length === 1 ? k.toUpperCase() : k}
              </button>
            ))}
          </div>
        ))}
        <div className="flex justify-center pt-1">
          <button
            onClick={() => handleKey(' ')}
            className="w-72 py-2 rounded-md bg-white dark:bg-neutral-750 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100"
          >
            Space
          </button>
        </div>
      </div>
    </div>
  );
};
