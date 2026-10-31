import React, { useState, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const SnippingToolApp: React.FC = () => {
  const { addNotification, copyToClipboard } = useOS();

  const [hasSnip, setHasSnip] = useState<boolean>(false);
  const [delaySecs, setDelaySecs] = useState<number>(0);
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCapture = () => {
    soundManager.playClick();
    setTimeout(() => {
      soundManager.playShutter();
      setHasSnip(true);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw simulated desktop snip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(40, 40, canvas.width - 80, 40);

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.fillText('Windows 11 Captured Screen Snapshot', 60, 65);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(40, 80, canvas.width - 80, canvas.height - 120);
    }, delaySecs * 1000);
  };

  const handleSave = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const fileName = `Screenshot_${Date.now()}.png`;

    fileSystem.createItem(fileName, 'file', 'pictures', dataUrl, 'png');
    addNotification('Snipping Tool', `Screenshot saved to Pictures: ${fileName}`, 'Snipping Tool');
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#202020] text-slate-800 dark:text-slate-100 select-none">
      {/* Top Action Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#282828] text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCapture}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <WinIcon name="crop" size={14} />
            <span>New Snip</span>
          </button>

          <select
            value={delaySecs}
            onChange={e => setDelaySecs(parseInt(e.target.value))}
            className="px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-700 border-none outline-none font-medium cursor-pointer"
          >
            <option value="0">No delay</option>
            <option value="3">3s delay</option>
            <option value="5">5s delay</option>
          </select>
        </div>

        {hasSnip && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
            >
              <WinIcon name="download" size={14} />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 p-6 flex items-center justify-center bg-neutral-200/60 dark:bg-[#181818] overflow-auto">
        <canvas
          ref={canvasRef}
          width={580}
          height={320}
          className={`bg-white rounded-lg shadow-md border border-neutral-300 dark:border-neutral-700 ${hasSnip ? 'block' : 'hidden'}`}
        />

        {!hasSnip && (
          <div className="text-center text-neutral-400 text-xs">
            <WinIcon name="crop" size={40} className="mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-sm">Select "New Snip" to capture a screen area</p>
            <p className="mt-1">Press Win + Shift + S anytime to snip</p>
          </div>
        )}
      </div>
    </div>
  );
};
