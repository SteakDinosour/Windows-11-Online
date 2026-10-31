/**
 * Windows 11 Online - Master Application Entry Point
 * @license Apache-2.0
 */

import React, { useEffect } from 'react';
import { OSProvider } from './context/OSContext';
import { Desktop } from './components/desktop/Desktop';
import { Taskbar } from './components/taskbar/Taskbar';
import { StartMenu } from './components/start/StartMenu';
import { WindowsSearch } from './components/search/WindowsSearch';
import { WidgetsBoard } from './components/widgets/WidgetsBoard';
import { QuickSettingsPanel } from './components/quicksettings/QuickSettingsPanel';
import { NotificationCalendarPanel } from './components/notifications/NotificationCalendarPanel';
import { WindowManager } from './components/window/WindowManager';
import { AltTabSwitcher } from './components/shell/AltTabSwitcher';
import { TaskView } from './components/shell/TaskView';
import { RunDialog } from './components/shell/RunDialog';
import { ClipboardHistory } from './components/shell/ClipboardHistory';
import { GameBar } from './components/shell/GameBar';
import { OnScreenKeyboard } from './components/shell/OnScreenKeyboard';
import { LockScreen } from './components/shell/LockScreen';
import { CrashScreen } from './components/shell/CrashScreen';
import { soundManager } from './services/soundEffects';

const OSContent: React.FC = () => {
  // Play startup sound on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      soundManager.playStartup();
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-black text-slate-100 font-sans">
      {/* Desktop Canvas & Virtual Filesystem Grid */}
      <Desktop />

      {/* Floating Windows Manager */}
      <WindowManager />

      {/* Taskbar */}
      <Taskbar />

      {/* Windows Shell Panels & Menus */}
      <StartMenu />
      <WindowsSearch />
      <WidgetsBoard />
      <QuickSettingsPanel />
      <NotificationCalendarPanel />

      {/* Utility Overlays */}
      <AltTabSwitcher />
      <TaskView />
      <RunDialog />
      <ClipboardHistory />
      <GameBar />
      <OnScreenKeyboard />

      {/* Lock, Sleep & Power Screen Overlays */}
      <LockScreen />

      {/* Blue Screen of Death (BSOD) & Recovery Screen */}
      <CrashScreen />
    </div>
  );
};

export default function App() {
  return (
    <OSProvider>
      <OSContent />
    </OSProvider>
  );
}
