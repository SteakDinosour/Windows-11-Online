/**
 * Windows 11 Operating System Context & State Management
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppId, WindowPosition, WindowState, SystemSettings, NotificationItem } from '../types/os';
import { APPS_REGISTRY } from '../config/apps';
import { WALLPAPERS } from '../config/wallpapers';
import { soundManager } from '../services/soundEffects';
import { fileSystem } from '../services/fileSystem';

export interface WindowsUpdateInfo {
  available: boolean;
  title: string;
  kbNumber: string;
  status: 'available' | 'downloading' | 'installing' | 'pending_restart' | 'up_to_date';
  progress: number;
  size: string;
  description: string;
}

interface OSContextType {
  windows: WindowState[];
  activeWindowId: string | null;
  settings: SystemSettings;
  notifications: NotificationItem[];
  isLocked: boolean;
  isSleeping: boolean;
  isShutDown: boolean;
  isRestarting: boolean;
  isBsod: boolean;
  bsodProgress: number;
  isRepairing: boolean;
  isRecovery: boolean;
  isStartOpen: boolean;
  isSearchOpen: boolean;
  isWidgetsOpen: boolean;
  isQuickSettingsOpen: boolean;
  isCalendarOpen: boolean;
  isTaskViewOpen: boolean;
  isRunDialogOpen: boolean;
  isClipboardOpen: boolean;
  isGameBarOpen: boolean;
  isOnScreenKeyboardOpen: boolean;
  isAltTabOpen: boolean;
  altTabIndex: number;
  clipboardHistory: string[];
  
  // Real App Management
  installedAppIds: string[];
  installApp: (appId: string) => Promise<void>;
  uninstallApp: (appId: string) => void;
  isAppInstalled: (appId: string) => boolean;

  // Windows Update System
  windowsUpdate: WindowsUpdateInfo;
  startWindowsUpdate: () => void;
  restartForUpdate: () => void;
  checkWindowsUpdates: () => void;

  // Actions
  triggerBsod: (reason?: string) => void;
  recoverSystem: () => void;
  openWindow: (appId: AppId, payload?: any) => string;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: WindowPosition) => void;
  snapWindow: (id: string, layout: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'full') => void;
  toggleWindowMinimize: (appId: AppId) => void;
  updateSettings: (partial: Partial<SystemSettings>) => void;
  addNotification: (title: string, message: string, app?: string) => void;
  clearNotifications: () => void;
  markNotificationRead: (id: string) => void;
  lockSystem: () => void;
  unlockSystem: () => void;
  sleepSystem: () => void;
  wakeSystem: () => void;
  shutDownSystem: () => void;
  powerOnSystem: () => void;
  restartSystem: () => void;
  speakText: (text: string) => void;
  copyToClipboard: (text: string) => void;
  closeAllPopups: () => void;
  
  // Menu Toggles
  toggleStartMenu: () => void;
  toggleSearch: () => void;
  toggleWidgets: () => void;
  toggleQuickSettings: () => void;
  toggleCalendar: () => void;
  toggleTaskView: () => void;
  toggleRunDialog: () => void;
  toggleClipboard: () => void;
  toggleGameBar: () => void;
  toggleOnScreenKeyboard: () => void;
  showDesktop: () => void;
}

const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark',
  wallpaper: WALLPAPERS[0].src,
  accentColor: '#0078d4',
  taskbarAlignment: 'center',
  soundEnabled: true,
  volume: 75,
  brightness: 100,
  nightLight: false,
  wifiEnabled: true,
  bluetoothEnabled: true,
  airplaneMode: false,
  batterySaver: false,
  textScale: 100,
  highContrast: false,
  narratorEnabled: false,
  reducedMotion: false,
  batteryLevel: 94,
  isCharging: true,
};

const OSContext = createContext<OSContextType | null>(null);

export const OSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState<number>(100);

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('win11_settings_v2');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [installedAppIds, setInstalledAppIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('win11_installed_apps_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['vscode', 'vlc'];
  });

  const [windowsUpdate, setWindowsUpdate] = useState<WindowsUpdateInfo>(() => {
    try {
      const saved = localStorage.getItem('win11_update_state_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      available: true,
      title: '2026-10 Cumulative Update for Windows 11 Version 24H2 for x64-based Systems (KB5044284)',
      kbNumber: 'KB5044284',
      status: 'available',
      progress: 0,
      size: '482.4 MB',
      description: 'Resolves critical security vulnerabilities and delivers system performance enhancements for Windows 11.',
    };
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-update-1',
      title: 'Windows Update Available',
      message: '2026-10 Cumulative Update for Windows 11 Version 24H2 (KB5044284) is ready to install.',
      time: '10:30 AM',
      app: 'Windows Update',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'Microsoft Defender',
      message: 'Virus and threat scan completed. No active threats detected on your PC.',
      time: '09:15 AM',
      app: 'Windows Security',
      read: false,
    },
  ]);

  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isSleeping, setIsSleeping] = useState<boolean>(false);
  const [isShutDown, setIsShutDown] = useState<boolean>(false);
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [isBsod, setIsBsod] = useState<boolean>(false);
  const [bsodProgress, setBsodProgress] = useState<number>(0);
  const [isRepairing, setIsRepairing] = useState<boolean>(false);
  const [isRecovery, setIsRecovery] = useState<boolean>(false);

  // Shell panel states
  const [isStartOpen, setIsStartOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState<boolean>(false);
  const [isQuickSettingsOpen, setIsQuickSettingsOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isTaskViewOpen, setIsTaskViewOpen] = useState<boolean>(false);
  const [isRunDialogOpen, setIsRunDialogOpen] = useState<boolean>(false);
  const [isClipboardOpen, setIsClipboardOpen] = useState<boolean>(false);
  const [isGameBarOpen, setIsGameBarOpen] = useState<boolean>(false);
  const [isOnScreenKeyboardOpen, setIsOnScreenKeyboardOpen] = useState<boolean>(false);

  // Alt + Tab State
  const [isAltTabOpen, setIsAltTabOpen] = useState<boolean>(false);
  const [altTabIndex, setAltTabIndex] = useState<number>(0);

  // Clipboard history
  const [clipboardHistory, setClipboardHistory] = useState<string[]>([
    'https://learn.microsoft.com/windows/',
    'Windows 11 Fluent Design Architecture',
    'powershell.exe -ExecutionPolicy Bypass',
  ]);

  // Sync settings with localStorage & html class
  useEffect(() => {
    try {
      localStorage.setItem('win11_settings_v2', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }

    soundManager.setSoundEnabled(settings.soundEnabled);
  }, [settings]);

  // Narrator speech synthesis
  const speakText = useCallback((text: string) => {
    if (!settings.narratorEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Speech synthesis fallback
    }
  }, [settings.narratorEnabled]);

  const closeAllPopups = useCallback(() => {
    setIsStartOpen(false);
    setIsSearchOpen(false);
    setIsWidgetsOpen(false);
    setIsQuickSettingsOpen(false);
    setIsCalendarOpen(false);
    setIsTaskViewOpen(false);
    setIsClipboardOpen(false);
  }, []);

  const addNotification = useCallback((title: string, message: string, app: string = 'Windows') => {
    const id = `notif-${Date.now()}`;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [{ id, title, message, time, app, read: false }, ...prev]);
    soundManager.playNotification();
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const copyToClipboard = useCallback((text: string) => {
    if (!text) return;
    setClipboardHistory(prev => [text, ...prev.filter(t => t !== text)].slice(0, 20));
    try {
      navigator.clipboard.writeText(text);
    } catch {
      // Ignore fallback
    }
  }, []);

  const focusWindow = useCallback((id: string) => {
    setMaxZIndex(prev => {
      const nextZ = prev + 1;
      setWindows(curr => curr.map(w => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w)));
      return nextZ;
    });
    setActiveWindowId(id);
  }, []);

  const openWindow = useCallback((appId: AppId, payload?: any): string => {
    soundManager.playClick();
    closeAllPopups();

    // Check if an existing single-instance window is already open (except for explorer or notepad which can have multiple)
    if (appId !== 'explorer' && appId !== 'notepad') {
      const existing = windows.find(w => w.appId === appId);
      if (existing) {
        if (existing.isMinimized) {
          setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, isMinimized: false } : w));
        }
        focusWindow(existing.id);
        if (payload) {
          setWindows(prev => prev.map(w => w.id === existing.id ? { ...w, payload } : w));
        }
        return existing.id;
      }
    }

    const appMeta = APPS_REGISTRY[appId];
    const windowId = `win-${appId}-${Date.now()}`;
    const defaultW = Math.min(appMeta?.defaultWidth || 800, window.innerWidth - 40);
    const defaultH = Math.min(appMeta?.defaultHeight || 540, window.innerHeight - 80);

    // Stagger window positions
    const offset = (windows.length % 6) * 28 + 36;
    const x = Math.max(20, Math.min(offset, window.innerWidth - defaultW - 20));
    const y = Math.max(20, Math.min(offset, window.innerHeight - defaultH - 60));

    const newWindow: WindowState = {
      id: windowId,
      appId,
      title: payload?.title || appMeta?.title || 'Application',
      icon: appMeta?.icon || 'app',
      isMinimized: false,
      isMaximized: false,
      position: { x, y, width: defaultW, height: defaultH },
      zIndex: maxZIndex + 1,
      payload,
    };

    setMaxZIndex(z => z + 1);
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(windowId);

    speakText(`Opened ${newWindow.title}`);
    return windowId;
  }, [windows, maxZIndex, closeAllPopups, focusWindow, speakText]);

  const closeWindow = useCallback((id: string) => {
    soundManager.playClick();
    setWindows(prev => {
      const remaining = prev.filter(w => w.id !== id);
      if (activeWindowId === id) {
        const topRemaining = remaining
          .filter(w => !w.isMinimized)
          .sort((a, b) => b.zIndex - a.zIndex)[0];
        setActiveWindowId(topRemaining ? topRemaining.id : null);
      }
      return remaining;
    });
  }, [activeWindowId]);

  const minimizeWindow = useCallback((id: string) => {
    soundManager.playClick();
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
    if (activeWindowId === id) {
      const topRemaining = windows
        .filter(w => w.id !== id && !w.isMinimized)
        .sort((a, b) => b.zIndex - a.zIndex)[0];
      setActiveWindowId(topRemaining ? topRemaining.id : null);
    }
  }, [activeWindowId, windows]);

  const maximizeWindow = useCallback((id: string) => {
    soundManager.playClick();
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== id) return w;
        if (w.isMaximized) {
          // restore
          return {
            ...w,
            isMaximized: false,
            position: w.prevPosition || { x: 50, y: 50, width: 800, height: 500 },
          };
        } else {
          // maximize
          return {
            ...w,
            isMaximized: true,
            prevPosition: { ...w.position },
            position: { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 48 },
          };
        }
      })
    );
    focusWindow(id);
  }, [focusWindow]);

  const restoreWindow = useCallback((id: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.id !== id) return w;
        return {
          ...w,
          isMaximized: false,
          isMinimized: false,
          position: w.prevPosition || { x: 60, y: 60, width: 800, height: 500 },
        };
      })
    );
    focusWindow(id);
  }, [focusWindow]);

  const updateWindowPosition = useCallback((id: string, pos: WindowPosition) => {
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, position: pos, isMaximized: false } : w))
    );
  }, []);

  const snapWindow = useCallback(
    (
      id: string,
      layout: 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'full'
    ) => {
      soundManager.playClick();
      const taskbarHeight = 48;
      const screenW = window.innerWidth;
      const screenH = window.innerHeight - taskbarHeight;
      const halfW = Math.floor(screenW / 2);
      const halfH = Math.floor(screenH / 2);

      let newPos: WindowPosition;
      switch (layout) {
        case 'left':
          newPos = { x: 0, y: 0, width: halfW, height: screenH };
          break;
        case 'right':
          newPos = { x: halfW, y: 0, width: halfW, height: screenH };
          break;
        case 'top-left':
          newPos = { x: 0, y: 0, width: halfW, height: halfH };
          break;
        case 'top-right':
          newPos = { x: halfW, y: 0, width: halfW, height: halfH };
          break;
        case 'bottom-left':
          newPos = { x: 0, y: halfH, width: halfW, height: halfH };
          break;
        case 'bottom-right':
          newPos = { x: halfW, y: halfH, width: halfW, height: halfH };
          break;
        case 'full':
        default:
          newPos = { x: 0, y: 0, width: screenW, height: screenH };
          break;
      }

      setWindows(prev =>
        prev.map(w =>
          w.id === id
            ? { ...w, position: newPos, isMaximized: layout === 'full', prevPosition: w.position }
            : w
        )
      );
      focusWindow(id);
    },
    [focusWindow]
  );

  const toggleWindowMinimize = useCallback((appId: AppId) => {
    const wins = windows.filter(w => w.appId === appId);
    if (wins.length === 0) {
      openWindow(appId);
      return;
    }

    const currentWin = wins[0];
    if (currentWin.isMinimized) {
      setWindows(prev => prev.map(w => w.id === currentWin.id ? { ...w, isMinimized: false } : w));
      focusWindow(currentWin.id);
    } else if (activeWindowId === currentWin.id) {
      minimizeWindow(currentWin.id);
    } else {
      focusWindow(currentWin.id);
    }
  }, [windows, activeWindowId, openWindow, focusWindow, minimizeWindow]);

  const showDesktop = useCallback(() => {
    soundManager.playClick();
    const hasUnminimized = windows.some(w => !w.isMinimized);
    setWindows(prev => prev.map(w => ({ ...w, isMinimized: hasUnminimized })));
    closeAllPopups();
  }, [windows, closeAllPopups]);

  const updateSettings = useCallback((partial: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  }, []);

  // System Power / Lock state triggers
  const lockSystem = useCallback(() => {
    closeAllPopups();
    setIsLocked(true);
    soundManager.playClick();
  }, [closeAllPopups]);

  const unlockSystem = useCallback(() => {
    setIsLocked(false);
    soundManager.playStartup();
  }, []);

  const sleepSystem = useCallback(() => {
    closeAllPopups();
    setIsSleeping(true);
  }, [closeAllPopups]);

  const wakeSystem = useCallback(() => {
    setIsSleeping(false);
  }, []);

  const shutDownSystem = useCallback(() => {
    closeAllPopups();
    setIsShutDown(true);
  }, [closeAllPopups]);

  const powerOnSystem = useCallback(() => {
    setIsShutDown(false);
    soundManager.playStartup();
  }, []);

  const restartSystem = useCallback(() => {
    closeAllPopups();
    setIsRestarting(true);
    setTimeout(() => {
      setIsRestarting(false);
      soundManager.playStartup();
    }, 4500);
  }, [closeAllPopups]);

  // System32 Deletion Crash & BSOD sequence
  const triggerBsod = useCallback((_reason: string = 'CRITICAL_PROCESS_DIED: System32 was deleted') => {
    soundManager.playCrash();
    closeAllPopups();
    setIsBsod(true);
    setBsodProgress(0);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setBsodProgress(100);

        // After BSOD collection finishes, automatically restart into recovery
        setTimeout(() => {
          setIsBsod(false);
          setIsRepairing(true);

          setTimeout(() => {
            setIsRepairing(false);
            setIsRecovery(true);
          }, 3500);
        }, 1200);
      } else {
        setBsodProgress(currentProgress);
      }
    }, 600);
  }, [closeAllPopups]);

  const recoverSystem = useCallback(() => {
    soundManager.playClick();
    setIsRecovery(false);
    setIsRepairing(true);
    fileSystem.resetToDefault();

    setTimeout(() => {
      setIsRepairing(false);
      setWindows([]);
      soundManager.playStartup();
    }, 2800);
  }, []);

  // Real App Management
  const isAppInstalled = useCallback((appId: string) => {
    return installedAppIds.includes(appId);
  }, [installedAppIds]);

  const installApp = useCallback(async (appId: string) => {
    soundManager.playClick();
    const appMeta = APPS_REGISTRY[appId as AppId];
    const appTitle = appMeta?.title || appId;
    addNotification('Microsoft Store', `Downloading and installing ${appTitle}...`, 'Store');

    // Simulate install latency
    await new Promise(resolve => setTimeout(resolve, 1400));

    setInstalledAppIds(prev => {
      if (prev.includes(appId)) return prev;
      const next = [...prev, appId];
      try {
        localStorage.setItem('win11_installed_apps_v2', JSON.stringify(next));
      } catch {}
      return next;
    });

    soundManager.playNotification();
    addNotification('Microsoft Store', `${appTitle} was installed successfully.`, 'Store');
  }, [addNotification]);

  const uninstallApp = useCallback((appId: string) => {
    soundManager.playClick();
    setInstalledAppIds(prev => {
      const next = prev.filter(id => id !== appId);
      try {
        localStorage.setItem('win11_installed_apps_v2', JSON.stringify(next));
      } catch {}
      return next;
    });
    addNotification('Settings', `Uninstalled ${appId}`, 'Apps');
  }, [addNotification]);

  // Windows Update Engine
  const startWindowsUpdate = useCallback(() => {
    soundManager.playClick();
    setWindowsUpdate(prev => ({ ...prev, status: 'downloading', progress: 5 }));

    let p = 5;
    const interval = setInterval(() => {
      p += 18;
      if (p < 80) {
        setWindowsUpdate(prev => ({ ...prev, status: 'downloading', progress: p }));
      } else if (p < 100) {
        setWindowsUpdate(prev => ({ ...prev, status: 'installing', progress: p }));
      } else {
        clearInterval(interval);
        setWindowsUpdate(prev => {
          const updated: WindowsUpdateInfo = {
            ...prev,
            status: 'pending_restart',
            progress: 100,
          };
          try {
            localStorage.setItem('win11_update_state_v2', JSON.stringify(updated));
          } catch {}
          return updated;
        });
        soundManager.playNotification();
        addNotification('Windows Update', 'Restart required to complete update installation.', 'Windows Update');
      }
    }, 400);
  }, [addNotification]);

  const restartForUpdate = useCallback(() => {
    closeAllPopups();
    setIsRestarting(true);
    setTimeout(() => {
      setWindowsUpdate({
        available: false,
        title: 'You are up to date',
        kbNumber: 'KB5044284',
        status: 'up_to_date',
        progress: 100,
        size: '0 MB',
        description: 'Your device is running the latest security patches and Windows 11 build.',
      });
      try {
        localStorage.setItem('win11_update_state_v2', JSON.stringify({
          available: false,
          status: 'up_to_date',
        }));
      } catch {}
      setIsRestarting(false);
      soundManager.playStartup();
      addNotification('Windows Update', 'Updates successfully installed. Windows 11 is up to date.', 'Windows Update');
    }, 4500);
  }, [closeAllPopups, addNotification]);

  const checkWindowsUpdates = useCallback(() => {
    soundManager.playClick();
    if (windowsUpdate.status === 'up_to_date') {
      addNotification('Windows Update', 'Checking for updates... No new updates found. System is current.', 'Windows Update');
    }
  }, [windowsUpdate.status, addNotification]);

  // Listen to virtual filesystem crash triggers
  useEffect(() => {
    fileSystem.onCrash(() => {
      triggerBsod('CRITICAL_PROCESS_DIED: System32 was deleted');
    });
  }, [triggerBsod]);

  // Menu toggles
  const toggleStartMenu = useCallback(() => {
    soundManager.playClick();
    setIsStartOpen(prev => {
      const next = !prev;
      if (next) {
        setIsSearchOpen(false);
        setIsWidgetsOpen(false);
        setIsQuickSettingsOpen(false);
        setIsCalendarOpen(false);
      }
      return next;
    });
  }, []);

  const toggleSearch = useCallback(() => {
    soundManager.playClick();
    setIsSearchOpen(prev => {
      const next = !prev;
      if (next) {
        setIsStartOpen(false);
        setIsWidgetsOpen(false);
        setIsQuickSettingsOpen(false);
        setIsCalendarOpen(false);
      }
      return next;
    });
  }, []);

  const toggleWidgets = useCallback(() => {
    soundManager.playClick();
    setIsWidgetsOpen(prev => {
      const next = !prev;
      if (next) {
        setIsStartOpen(false);
        setIsSearchOpen(false);
        setIsQuickSettingsOpen(false);
        setIsCalendarOpen(false);
      }
      return next;
    });
  }, []);

  const toggleQuickSettings = useCallback(() => {
    soundManager.playClick();
    setIsQuickSettingsOpen(prev => {
      const next = !prev;
      if (next) {
        setIsStartOpen(false);
        setIsSearchOpen(false);
        setIsWidgetsOpen(false);
        setIsCalendarOpen(false);
      }
      return next;
    });
  }, []);

  const toggleCalendar = useCallback(() => {
    soundManager.playClick();
    setIsCalendarOpen(prev => {
      const next = !prev;
      if (next) {
        setIsStartOpen(false);
        setIsSearchOpen(false);
        setIsWidgetsOpen(false);
        setIsQuickSettingsOpen(false);
      }
      return next;
    });
  }, []);

  const toggleTaskView = useCallback(() => {
    soundManager.playClick();
    setIsTaskViewOpen(prev => !prev);
    closeAllPopups();
  }, [closeAllPopups]);

  const toggleRunDialog = useCallback(() => {
    soundManager.playClick();
    setIsRunDialogOpen(prev => !prev);
  }, []);

  const toggleClipboard = useCallback(() => {
    soundManager.playClick();
    setIsClipboardOpen(prev => !prev);
  }, []);

  const toggleGameBar = useCallback(() => {
    soundManager.playClick();
    setIsGameBarOpen(prev => !prev);
  }, []);

  const toggleOnScreenKeyboard = useCallback(() => {
    soundManager.playClick();
    setIsOnScreenKeyboardOpen(prev => !prev);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in standard inputs unless shortcut is Win key
      const isAlt = e.altKey;
      const isMeta = e.metaKey || (e as any).winKey;
      const isCtrl = e.ctrlKey;

      // Win key alone: Open Start Menu
      if (e.key === 'Meta' && !isAlt && !isCtrl) {
        toggleStartMenu();
        return;
      }

      // Win + E: File Explorer
      if (isMeta && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        openWindow('explorer');
        return;
      }

      // Win + I: Settings
      if (isMeta && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        openWindow('settings');
        return;
      }

      // Win + R: Run dialog
      if (isMeta && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        toggleRunDialog();
        return;
      }

      // Win + D: Show Desktop
      if (isMeta && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        showDesktop();
        return;
      }

      // Win + L: Lock
      if (isMeta && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        lockSystem();
        return;
      }

      // Win + S: Search
      if (isMeta && e.key.toLowerCase() === 's') {
        e.preventDefault();
        toggleSearch();
        return;
      }

      // Win + A: Quick Settings
      if (isMeta && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        toggleQuickSettings();
        return;
      }

      // Win + N: Notifications / Calendar
      if (isMeta && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        toggleCalendar();
        return;
      }

      // Win + V: Clipboard history
      if (isMeta && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        toggleClipboard();
        return;
      }

      // Win + G: Game Bar
      if (isMeta && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        toggleGameBar();
        return;
      }

      // Win + Tab: Task View
      if (isMeta && e.key === 'Tab') {
        e.preventDefault();
        toggleTaskView();
        return;
      }

      // Ctrl + Shift + Esc: Task Manager
      if (isCtrl && e.shiftKey && e.key === 'Escape') {
        e.preventDefault();
        openWindow('taskmanager');
        return;
      }

      // Alt + Tab Switcher
      if (isAlt && e.key === 'Tab') {
        e.preventDefault();
        if (windows.length > 0) {
          setIsAltTabOpen(true);
          setAltTabIndex(prev => (prev + 1) % windows.length);
        }
      }

      // Escape closes open flyouts
      if (e.key === 'Escape') {
        closeAllPopups();
        setIsRunDialogOpen(false);
        setIsGameBarOpen(false);
        setIsAltTabOpen(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && isAltTabOpen) {
        setIsAltTabOpen(false);
        if (windows[altTabIndex]) {
          focusWindow(windows[altTabIndex].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    toggleStartMenu,
    openWindow,
    toggleRunDialog,
    showDesktop,
    lockSystem,
    toggleSearch,
    toggleQuickSettings,
    toggleCalendar,
    toggleClipboard,
    toggleGameBar,
    toggleTaskView,
    isAltTabOpen,
    windows,
    altTabIndex,
    focusWindow,
    closeAllPopups,
  ]);

  return (
    <OSContext.Provider
      value={{
        windows,
        activeWindowId,
        settings,
        notifications,
        isLocked,
        isSleeping,
        isShutDown,
        isRestarting,
        isBsod,
        bsodProgress,
        isRepairing,
        isRecovery,
        triggerBsod,
        recoverSystem,
        isStartOpen,
        isSearchOpen,
        isWidgetsOpen,
        isQuickSettingsOpen,
        isCalendarOpen,
        isTaskViewOpen,
        isRunDialogOpen,
        isClipboardOpen,
        isGameBarOpen,
        isOnScreenKeyboardOpen,
        isAltTabOpen,
        altTabIndex,
        clipboardHistory,
        installedAppIds,
        installApp,
        uninstallApp,
        isAppInstalled,
        windowsUpdate,
        startWindowsUpdate,
        restartForUpdate,
        checkWindowsUpdates,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        updateWindowPosition,
        snapWindow,
        toggleWindowMinimize,
        updateSettings,
        addNotification,
        clearNotifications,
        markNotificationRead,
        lockSystem,
        unlockSystem,
        sleepSystem,
        wakeSystem,
        shutDownSystem,
        powerOnSystem,
        restartSystem,
        speakText,
        copyToClipboard,
        closeAllPopups,
        toggleStartMenu,
        toggleSearch,
        toggleWidgets,
        toggleQuickSettings,
        toggleCalendar,
        toggleTaskView,
        toggleRunDialog,
        toggleClipboard,
        toggleGameBar,
        toggleOnScreenKeyboard,
        showDesktop,
      }}
    >
      {children}
    </OSContext.Provider>
  );
};

export const useOS = (): OSContextType => {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
};
