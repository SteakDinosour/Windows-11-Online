import React from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const ClipboardHistory: React.FC = () => {
  const { isClipboardOpen, toggleClipboard, clipboardHistory, copyToClipboard, addNotification } = useOS();

  if (!isClipboardOpen) return null;

  const emojis = ['👍', '🎉', '💻', '🚀', '🔥', '✨', '📎', '❤️', '😊', '💡', '✅', '☕'];

  return (
    <div
      className="fixed bottom-14 right-20 z-[10000] w-80 p-3 rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100 select-none animate-win11-open"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700 mb-2">
        <div className="flex items-center gap-2">
          <WinIcon name="clipboard" size={15} className="text-sky-500" />
          <span className="font-semibold text-xs">Clipboard History (Win + V)</span>
        </div>
        <button onClick={toggleClipboard} className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
          <WinIcon name="close" size={12} />
        </button>
      </div>

      {/* Quick Emojis strip */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-700">
        {emojis.map(emoji => (
          <button
            key={emoji}
            onClick={() => {
              copyToClipboard(emoji);
              addNotification('Clipboard', `Copied ${emoji} to clipboard`, 'Clipboard');
            }}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-sm"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* History Items */}
      <div className="space-y-1.5 max-h-56 overflow-y-auto text-xs">
        {clipboardHistory.length === 0 ? (
          <div className="text-center py-4 text-neutral-400">Your clipboard is empty</div>
        ) : (
          clipboardHistory.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                soundManager.playClick();
                copyToClipboard(item);
                addNotification('Clipboard', 'Item ready to paste', 'Clipboard');
                toggleClipboard();
              }}
              className="p-2.5 rounded-lg bg-white/70 dark:bg-[#252525] border border-neutral-200 dark:border-neutral-700 hover:border-sky-500 cursor-pointer transition-colors truncate font-mono text-[11px]"
            >
              {item}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
