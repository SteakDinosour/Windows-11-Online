import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';
import { fileSystem } from '../../services/fileSystem';

export const RunDialog: React.FC = () => {
  const { isRunDialogOpen, toggleRunDialog, openWindow, addNotification } = useOS();
  const [command, setCommand] = useState<string>('notepad');

  if (!isRunDialogOpen) return null;

  const handleRun = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    const cmd = command.trim().toLowerCase();

    if (cmd.includes('system32')) {
      fileSystem.deleteSystem32();
    } else if (cmd === 'calc') openWindow('calc');
    else if (cmd === 'notepad') openWindow('notepad');
    else if (cmd === 'cmd' || cmd === 'terminal' || cmd === 'powershell') openWindow('terminal');
    else if (cmd === 'explorer') openWindow('explorer');
    else if (cmd === 'control' || cmd === 'settings') openWindow('settings');
    else if (cmd === 'taskmgr') openWindow('taskmanager');
    else if (cmd === 'edge' || cmd === 'chrome') openWindow('edge');
    else if (cmd === 'paint' || cmd === 'mspaint') openWindow('paint');
    else if (cmd === 'excel') openWindow('excel');
    else if (cmd === 'word' || cmd === 'wordpad') openWindow('word');
    else if (cmd === 'powerpnt' || cmd === 'powerpoint') openWindow('powerpoint');
    else {
      addNotification('Run', `Command executed: ${command}`, 'Run');
    }

    toggleRunDialog();
  };

  return (
    <div
      className="fixed bottom-14 left-4 z-[10000] w-96 p-4 rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100 select-none animate-win11-open"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700 mb-3">
        <div className="flex items-center gap-2">
          <WinIcon name="terminal" size={16} className="text-sky-500" />
          <span className="font-semibold text-xs">Run</span>
        </div>
        <button
          onClick={toggleRunDialog}
          className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
        >
          <WinIcon name="close" size={12} />
        </button>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
        Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.
      </p>

      <form onSubmit={handleRun}>
        <div className="flex items-center gap-2 mb-4 text-xs">
          <label className="font-medium text-neutral-600 dark:text-neutral-300">Open:</label>
          <input
            type="text"
            autoFocus
            value={command}
            onChange={e => setCommand(e.target.value)}
            className="flex-1 px-2.5 py-1.5 rounded bg-white dark:bg-[#1a1a1a] border border-neutral-300 dark:border-neutral-700 outline-none text-slate-800 dark:text-slate-100 font-mono text-xs"
          />
        </div>

        <div className="flex justify-end gap-2 text-xs">
          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            OK
          </button>
          <button
            type="button"
            onClick={toggleRunDialog}
            className="px-4 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
