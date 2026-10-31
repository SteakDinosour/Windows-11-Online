import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WALLPAPERS, USER_AVATAR } from '../../config/wallpapers';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface SettingsProps {
  payload?: { tab?: string };
}

export const SettingsApp: React.FC<SettingsProps> = ({ payload }) => {
  const {
    settings,
    updateSettings,
    addNotification,
    windowsUpdate,
    startWindowsUpdate,
    restartForUpdate,
    checkWindowsUpdates,
  } = useOS();

  const [activeTab, setActiveTab] = useState<string>(payload?.tab || 'system');
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const navItems = [
    { id: 'system', label: 'System', icon: 'monitor' },
    { id: 'bluetooth', label: 'Bluetooth & devices', icon: 'sliders' },
    { id: 'network', label: 'Network & internet', icon: 'wifi' },
    { id: 'personalization', label: 'Personalization', icon: 'palette' },
    { id: 'apps', label: 'Apps', icon: 'folder' },
    { id: 'accounts', label: 'Accounts', icon: 'user' },
    { id: 'time', label: 'Time & language', icon: 'clock' },
    { id: 'gaming', label: 'Gaming', icon: 'presentation' },
    { id: 'accessibility', label: 'Accessibility', icon: 'user' },
    { id: 'security', label: 'Privacy & security', icon: 'shield-check' },
    { id: 'update', label: 'Windows Update', icon: 'refresh', badge: windowsUpdate.available ? '1' : undefined },
  ];

  const handleCheckUpdates = () => {
    soundManager.playClick();
    setIsUpdating(true);
    setUpdateStatus('Checking for updates...');

    setTimeout(() => {
      setIsUpdating(false);
      setUpdateStatus('You are up to date. Last checked: Just now');
      addNotification('Windows Update', 'Your system is running the latest Windows 11 build.', 'Windows Update');
    }, 2500);
  };

  const accentColors = [
    '#0078d4', '#0063b1', '#0099bc', '#2d7d9a',
    '#107c41', '#498205', '#10893e', '#744da9',
    '#8764b8', '#881798', '#b146c2', '#ea005e',
    '#c30052', '#e81123', '#d13438', '#ff8c00',
  ];

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#202020] text-slate-800 dark:text-slate-100 select-none">
      {/* Settings Navigation Sidebar */}
      <div className="w-60 p-3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 bg-neutral-50/70 dark:bg-[#1f1f1f]">
        <div>
          {/* User mini header */}
          <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50">
            <img
              src={USER_AVATAR}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-400/50"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-xs truncate">User Profile</span>
              <span className="text-[10px] text-neutral-400 truncate">user@windows.local</span>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="space-y-0.5">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(item.id);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                }`}
              >
                <WinIcon name={item.icon} size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Settings Page Viewport */}
      <div className="flex-1 overflow-y-auto p-8 max-w-4xl space-y-6">
        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">System</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Display, sound, storage, and device specifications</p>
            </div>

            {/* Display Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <div className="flex items-center gap-3 font-semibold text-sm">
                <WinIcon name="monitor" size={18} className="text-sky-500" />
                <span>Display & Brightness</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 font-medium">
                    <span>Brightness</span>
                    <span className="font-mono tabular-nums">{settings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={settings.brightness}
                    onChange={e => updateSettings({ brightness: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 rounded bg-neutral-200 dark:bg-neutral-700"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <span className="font-medium block">Night light</span>
                    <span className="text-[11px] text-neutral-400">Use warmer colors to help you sleep</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ nightLight: !settings.nightLight })}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      settings.nightLight ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {settings.nightLight ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sound Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <div className="flex items-center gap-3 font-semibold text-sm">
                <WinIcon name="volume-2" size={18} className="text-sky-500" />
                <span>Sound & Audio Output</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1.5 font-medium">
                    <span>Master Volume</span>
                    <span className="font-mono tabular-nums">{settings.volume}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.volume}
                    onChange={e => updateSettings({ volume: parseInt(e.target.value) })}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 rounded bg-neutral-200 dark:bg-neutral-700"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div>
                    <span className="font-medium block">System sound effects</span>
                    <span className="text-[11px] text-neutral-400">Play procedural audio chimes and click cues</span>
                  </div>
                  <button
                    onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      settings.soundEnabled ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {settings.soundEnabled ? 'On' : 'Off'}
                  </button>
                </div>
              </div>
            </div>

            {/* About PC Specs */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-3 text-xs">
              <h3 className="font-semibold text-sm">Device Specifications</h3>
              <div className="grid grid-cols-2 gap-2 text-neutral-600 dark:text-neutral-300">
                <div>Device Name: <span className="font-bold text-slate-900 dark:text-white">DESKTOP-WIN11-PRO</span></div>
                <div>Processor: <span className="font-bold text-slate-900 dark:text-white">Virtual Octa-Core @ 3.80 GHz</span></div>
                <div>Installed RAM: <span className="font-bold text-slate-900 dark:text-white">16.0 GB (15.8 GB usable)</span></div>
                <div>System type: <span className="font-bold text-slate-900 dark:text-white">64-bit operating system, ARM/x64</span></div>
                <div>Edition: <span className="font-bold text-slate-900 dark:text-white">Windows 11 Pro Online</span></div>
                <div>Version: <span className="font-bold text-slate-900 dark:text-white">24H2 (OS Build 26100.1742)</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Personalization Tab */}
        {activeTab === 'personalization' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Personalization</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Select background wallpaper, dark/light theme, and taskbar layout</p>
            </div>

            {/* Wallpaper Selection */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <h3 className="font-semibold text-sm">Choose Your Desktop Background</h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {WALLPAPERS.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => {
                      soundManager.playClick();
                      updateSettings({
                        wallpaper: wp.src,
                        theme: wp.themePreference,
                      });
                    }}
                    className={`flex flex-col items-center p-2 rounded-xl border text-xs transition-all ${
                      settings.wallpaper === wp.src
                        ? 'border-blue-600 ring-2 ring-blue-500 shadow-md'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <div
                      className="w-full h-24 rounded-lg bg-cover bg-center mb-2"
                      style={{
                        backgroundImage: wp.type === 'gradient' ? wp.src : `url('${wp.src}')`,
                      }}
                    />
                    <span className="font-medium truncate w-full text-center">{wp.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle & Accent Colors */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-4">
              <h3 className="font-semibold text-sm">Color Mode & Accent</h3>

              <div className="flex items-center justify-between text-xs">
                <span>Choose your mode</span>
                <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-200 dark:bg-neutral-700">
                  <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      settings.theme === 'light' ? 'bg-white text-slate-900 shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`px-3 py-1 rounded font-medium transition-colors ${
                      settings.theme === 'dark' ? 'bg-neutral-800 text-white shadow-sm' : 'text-neutral-500'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              {/* Accent Color Palettes */}
              <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-xs font-medium block mb-2">Accent color</span>
                <div className="flex flex-wrap gap-2">
                  {accentColors.map(c => (
                    <button
                      key={c}
                      onClick={() => updateSettings({ accentColor: c })}
                      className={`w-7 h-7 rounded-full border-2 border-white dark:border-neutral-700 transition-transform ${
                        settings.accentColor === c ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Taskbar Alignment Settings */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-3 text-xs">
              <h3 className="font-semibold text-sm">Taskbar Behaviors</h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium block">Taskbar alignment</span>
                  <span className="text-[11px] text-neutral-400">Position Start and app icons in the center or left</span>
                </div>
                <select
                  value={settings.taskbarAlignment}
                  onChange={e => updateSettings({ taskbarAlignment: e.target.value as any })}
                  className="px-3 py-1.5 rounded-lg bg-neutral-200 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 outline-none text-xs font-medium cursor-pointer"
                >
                  <option value="center">Center</option>
                  <option value="left">Left</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Accessibility Tab */}
        {activeTab === 'accessibility' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Accessibility</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Vision, hearing, speech reader, and interaction options</p>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-4 text-xs">
              {/* Narrator TTS */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm block">Narrator (Screen Reader)</span>
                  <span className="text-neutral-400">Read desktop events and item titles using speech synthesis</span>
                </div>
                <button
                  onClick={() => updateSettings({ narratorEnabled: !settings.narratorEnabled })}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    settings.narratorEnabled ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                >
                  {settings.narratorEnabled ? 'On' : 'Off'}
                </button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="font-semibold text-sm block">Animation Effects</span>
                  <span className="text-neutral-400">Smooth window and menu transitions</span>
                </div>
                <button
                  onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                  className={`px-3 py-1 rounded-full font-medium transition-colors ${
                    !settings.reducedMotion ? 'bg-blue-600 text-white' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}
                >
                  {!settings.reducedMotion ? 'On' : 'Off'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Windows Update Tab */}
        {activeTab === 'update' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Windows Update</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Check for security updates, driver packages, and feature packs</p>
            </div>

            <div className="p-6 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <WinIcon name="refresh" size={24} className={isUpdating ? 'animate-spin' : ''} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{updateStatus}</h3>
                  <span className="text-xs text-neutral-400">Windows 11 Online Security Definition v2.4</span>
                </div>
              </div>

              <button
                onClick={handleCheckUpdates}
                disabled={isUpdating}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                {isUpdating ? 'Checking...' : 'Check for updates'}
              </button>
            </div>
          </div>
        )}

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Accounts</h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Your profile, account photo, and sign-in options</p>
            </div>

            {/* Profile Photo Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 shadow-sm space-y-4">
              <div className="flex items-center gap-5">
                <img
                  src={USER_AVATAR}
                  alt="User Avatar"
                  className="w-20 h-20 rounded-full object-cover ring-4 ring-sky-500/30 shadow-md"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">User Profile</h3>
                  <p className="text-xs text-neutral-400">Local Account · Administrator</p>
                  <p className="text-xs text-sky-500 mt-1">Windows 11 Authenticated</p>
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                <span className="font-semibold block mb-2">Available Profile Photos</span>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={USER_AVATAR}
                      alt="Active Avatar"
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-sky-500 shadow cursor-pointer"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 space-y-3 text-xs">
              <h4 className="font-semibold text-sm">Sign-in options</h4>
              <div className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <span className="font-medium block">PIN (Windows Hello)</span>
                  <span className="text-neutral-400">Sign in with your quick PIN</span>
                </div>
                <span className="text-emerald-500 font-medium">Configured</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-medium block">Password</span>
                  <span className="text-neutral-400">Sign in with your account password</span>
                </div>
                <span className="text-neutral-400 font-medium">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {!['system', 'personalization', 'accessibility', 'update', 'accounts'].includes(activeTab) && (
          <div className="p-6 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80 text-xs space-y-2">
            <h3 className="font-bold text-base capitalize">{activeTab} Settings</h3>
            <p className="text-neutral-400">All configurations for this section are active and operating under standard Windows 11 policy.</p>
          </div>
        )}
      </div>
    </div>
  );
};
