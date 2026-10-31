import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';

export const CrashScreen: React.FC = () => {
  const { isBsod, bsodProgress, isRepairing, isRecovery, recoverSystem } = useOS();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // 1. Windows 11 Blue Screen of Death (BSOD)
  if (isBsod) {
    return (
      <div className="fixed inset-0 z-[60000] bg-[#0078d7] text-white select-none p-12 md:p-24 flex flex-col justify-between font-sans">
        <div className="max-w-4xl space-y-8">
          {/* Sad Face Emoticon */}
          <div className="text-8xl md:text-9xl font-light tracking-tighter leading-none select-none">
            :(
          </div>

          {/* Crash Explanation */}
          <h1 className="text-2xl md:text-3xl font-light leading-snug">
            Your PC ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.
          </h1>

          {/* Progress Percent */}
          <div className="text-xl md:text-2xl font-light font-mono tabular-nums">
            {bsodProgress}% complete
          </div>
        </div>

        {/* Bottom Technical Section with QR Code */}
        <div className="flex items-start gap-6 max-w-3xl pt-8">
          {/* QR Code SVG */}
          <div className="w-28 h-28 bg-white p-2 shrink-0 rounded shadow-md flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="#0078d7">
              {/* Outer corners */}
              <rect x="5" y="5" width="30" height="30" rx="4" />
              <rect x="10" y="10" width="20" height="20" fill="white" />
              <rect x="15" y="15" width="10" height="10" />

              <rect x="65" y="5" width="30" height="30" rx="4" />
              <rect x="70" y="10" width="20" height="20" fill="white" />
              <rect x="75" y="15" width="10" height="10" />

              <rect x="5" y="65" width="30" height="30" rx="4" />
              <rect x="10" y="70" width="20" height="20" fill="white" />
              <rect x="15" y="75" width="10" height="10" />

              {/* Data dots */}
              <rect x="42" y="10" width="6" height="6" />
              <rect x="52" y="15" width="6" height="6" />
              <rect x="42" y="25" width="6" height="6" />
              <rect x="52" y="35" width="6" height="6" />
              <rect x="15" y="45" width="6" height="6" />
              <rect x="25" y="50" width="6" height="6" />
              <rect x="45" y="45" width="10" height="10" />
              <rect x="65" y="45" width="6" height="6" />
              <rect x="75" y="55" width="6" height="6" />
              <rect x="45" y="65" width="6" height="6" />
              <rect x="55" y="75" width="6" height="6" />
              <rect x="70" y="70" width="6" height="6" />
              <rect x="85" y="80" width="6" height="6" />
            </svg>
          </div>

          <div className="text-xs md:text-sm space-y-2 font-light">
            <p className="leading-relaxed">
              For more information about this issue and possible fixes, visit <span className="font-semibold underline cursor-pointer">https://windows.com/stopcode</span>
            </p>
            <p className="leading-relaxed text-blue-100">
              If you call a support person, give them this info:
            </p>
            <div className="font-mono text-xs pt-1 space-y-0.5 text-blue-100">
              <p>Stop code: <strong className="text-white">CRITICAL_PROCESS_DIED</strong></p>
              <p>What failed: <strong className="text-white">System32 (Core System Component Deleted)</strong></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Windows Boot / Repairing Loader Screen
  if (isRepairing) {
    return (
      <div className="fixed inset-0 z-[60000] bg-black text-white flex flex-col items-center justify-center select-none">
        <div className="mb-12">
          <WinIcon name="windows" size={72} className="text-sky-500" />
        </div>

        <div className="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mb-6" />

        <h3 className="text-lg font-light tracking-wide text-neutral-300">
          Preparing Automatic Repair...
        </h3>
      </div>
    );
  }

  // 3. Windows Recovery Environment Screen (Automatic Repair)
  if (isRecovery) {
    return (
      <div className="fixed inset-0 z-[60000] bg-[#004e8c] text-white select-none p-10 md:p-20 flex flex-col justify-between font-sans">
        <div className="max-w-2xl space-y-6">
          <h1 className="text-3xl md:text-4xl font-light">
            Automatic Repair
          </h1>

          <div className="p-4 rounded-xl bg-white/10 border border-white/20 space-y-2 text-sm">
            <p className="font-semibold text-base text-red-200">
              Your PC did not start correctly
            </p>
            <p className="text-neutral-200 leading-relaxed text-xs md:text-sm">
              Critical system files in <strong>C:\Windows\System32</strong> were missing or deleted. Press "Restart" to restore essential operating system files and boot back into Windows 11.
            </p>
          </div>

          {showAdvanced && (
            <div className="p-4 rounded-xl bg-black/20 border border-white/15 text-xs space-y-3">
              <h4 className="font-bold text-sm">Advanced Options</h4>
              <p className="text-neutral-300">
                • <strong>Startup Repair:</strong> Re-indexes system files and restores System32.
              </p>
              <p className="text-neutral-300">
                • <strong>Reset this PC:</strong> Reinstall default Windows 11 components while preserving desktop documents.
              </p>
              <button
                onClick={recoverSystem}
                className="px-4 py-2 rounded bg-sky-500 hover:bg-sky-400 text-black font-semibold text-xs transition-colors shadow"
              >
                Perform System Recovery & Reinstall System32
              </button>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-5 py-2.5 rounded-lg border border-white/40 hover:bg-white/10 text-white font-medium text-xs transition-colors"
          >
            {showAdvanced ? 'Hide advanced options' : 'Advanced options'}
          </button>
          <button
            onClick={recoverSystem}
            className="px-6 py-2.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-900 font-bold text-xs transition-colors shadow-lg"
          >
            Restart & Restore System
          </button>
        </div>
      </div>
    );
  }

  return null;
};
