/**
 * Windows 11 Operating System Type Definitions
 */

export type AppId =
  | 'explorer'
  | 'edge'
  | 'store'
  | 'notepad'
  | 'paint'
  | 'calc'
  | 'clock'
  | 'calendar'
  | 'photos'
  | 'mediaplayer'
  | 'camera'
  | 'voicerecorder'
  | 'snippingtool'
  | 'taskmanager'
  | 'terminal'
  | 'settings'
  | 'security'
  | 'stickynotes'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'vscode';

export interface AppMetadata {
  id: AppId;
  title: string;
  icon: string;
  category: 'Productivity' | 'Utilities' | 'Media' | 'System';
  isPinned: boolean;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
}

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  position: WindowPosition;
  prevPosition?: WindowPosition;
  zIndex: number;
  payload?: any;
}

export interface FileSystemItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  parentId: string | null;
  content?: string;
  size: number; // in bytes
  updatedAt: string;
  extension?: string;
  isSystem?: boolean;
  inRecycleBin?: boolean;
  originalParentId?: string | null;
  icon?: string;
}

export interface SystemSettings {
  theme: 'light' | 'dark';
  wallpaper: string;
  accentColor: string;
  taskbarAlignment: 'center' | 'left';
  soundEnabled: boolean;
  volume: number; // 0 - 100
  brightness: number; // 10 - 100
  nightLight: boolean;
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  airplaneMode: boolean;
  batterySaver: boolean;
  textScale: number; // 100, 125, 150
  highContrast: boolean;
  narratorEnabled: boolean;
  reducedMotion: boolean;
  batteryLevel: number;
  isCharging: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  app: string;
  read: boolean;
}

export interface StickyNote {
  id: string;
  content: string;
  color: 'yellow' | 'green' | 'pink' | 'blue' | 'purple';
  x: number;
  y: number;
  width: number;
  height: number;
}
