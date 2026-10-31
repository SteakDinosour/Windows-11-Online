import React from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const QuickSettingsPanel: React.FC = () => {
  const { isQuickSettingsOpen, settings, updateSettings, openWindow, closeAllPopups } = useOS();

  if (!isQuickSettingsOpen) return null;

  const toggleWifi = () => {
    soundManager.playClick();
    updateSettings({ wifiEnabled: !settings.wifiEnabled });
  };

  const toggleBluetooth = () => {
    soundManager.playClick();
    updateSettings({ bluetoothEnabled: !settings.bluetoothEnabled });
  };

  const toggleAirplane = () => {
    soundManager.playClick();
    updateSettings({ airplaneMode: !settings.airplaneMode });
  };

  const toggleBatterySaver = () => {
    soundManager.playClick();
    updateSettings({ batterySaver: !settings.batterySaver });
  };

  const toggleNightLight = () => {
    soundManager.playClick();
    updateSettings({ nightLight: !settings.nightLight });
  };

  const toggleTheme = () => {
    soundManager.playClick();
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div
      className="fixed right-4 bottom-14 z-[9900] w-[360px] max-w-[94vw] rounded-2xl mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow flex flex-col p-4 animate-win11-start text-slate-800 dark:text-slate-100"
      onClick={e => e.stopPropagation()}
    >
      {/* Quick Toggle Tiles (2x3 grid) */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Wi-Fi */}
        <button
          onClick={toggleWifi}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.wifiEnabled && !settings.airplaneMode
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name="wifi" size={20} className="mb-1.5" />
          <span>Wi-Fi</span>
        </button>

        {/* Bluetooth */}
        <button
          onClick={toggleBluetooth}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.bluetoothEnabled
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name="sliders" size={20} className="mb-1.5" />
          <span>Bluetooth</span>
        </button>

        {/* Airplane Mode */}
        <button
          onClick={toggleAirplane}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.airplaneMode
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name="globe" size={20} className="mb-1.5" />
          <span>Airplane</span>
        </button>

        {/* Battery Saver */}
        <button
          onClick={toggleBatterySaver}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.batterySaver
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name="battery" size={20} className="mb-1.5" />
          <span>Battery Saver</span>
        </button>

        {/* Night Light */}
        <button
          onClick={toggleNightLight}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.nightLight
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name="moon" size={20} className="mb-1.5" />
          <span>Night light</span>
        </button>

        {/* Dark / Light Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-xs font-medium ${
            settings.theme === 'dark'
              ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
              : 'bg-neutral-200/50 dark:bg-neutral-800/50 border-neutral-300/80 dark:border-neutral-700/60 text-slate-700 dark:text-slate-300'
          }`}
        >
          <WinIcon name={settings.theme === 'dark' ? 'moon' : 'sun'} size={20} className="mb-1.5" />
          <span>{settings.theme === 'dark' ? 'Dark' : 'Light'}</span>
        </button>
      </div>

      {/* Sliders: Brightness & Volume */}
      <div className="space-y-4 py-2 border-t border-neutral-300/60 dark:border-neutral-700/60">
        {/* Brightness */}
        <div className="flex items-center gap-3">
          <WinIcon name="sun" size={18} className="text-neutral-500 dark:text-neutral-400" />
          <input
            type="range"
            min="10"
            max="100"
            value={settings.brightness}
            onChange={e => updateSettings({ brightness: parseInt(e.target.value) })}
            className="flex-1 accent-blue-600 cursor-pointer h-1.5 rounded-lg bg-neutral-300 dark:bg-neutral-700"
          />
          <span className="text-xs font-mono tabular-nums w-8 text-right font-medium">
            {settings.brightness}%
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <WinIcon name="volume-2" size={18} className="text-neutral-500 dark:text-neutral-400" />
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={e => updateSettings({ volume: parseInt(e.target.value) })}
            className="flex-1 accent-blue-600 cursor-pointer h-1.5 rounded-lg bg-neutral-300 dark:bg-neutral-700"
          />
          <span className="text-xs font-mono tabular-nums w-8 text-right font-medium">
            {settings.volume}%
          </span>
        </div>
      </div>

      {/* Footer Info: Battery & Settings Shortcut */}
      <div className="pt-3 mt-2 border-t border-neutral-300/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <WinIcon name="battery" size={16} className="text-emerald-500" />
          <span className="font-mono tabular-nums font-semibold">{settings.batteryLevel}% remaining</span>
        </div>

        <button
          onClick={() => {
            openWindow('settings');
            closeAllPopups();
          }}
          className="p-1.5 rounded-lg hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 transition-colors"
          title="All Settings"
        >
          <WinIcon name="settings" size={18} />
        </button>
      </div>
    </div>
  );
};
