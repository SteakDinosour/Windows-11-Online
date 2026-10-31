import React from 'react';
import {
  Folder,
  Globe,
  ShoppingBag,
  FileText,
  Palette,
  Calculator,
  Clock,
  Calendar,
  Image,
  PlayCircle,
  Camera,
  Mic,
  Crop,
  Activity,
  Terminal,
  Settings,
  ShieldCheck,
  StickyNote,
  Table,
  Presentation,
  Trash2,
  HardDrive,
  User,
  Monitor,
  Download,
  Music,
  Video,
  File,
  Search,
  LayoutGrid,
  Volume2,
  Wifi,
  Battery,
  Bell,
  Sun,
  Moon,
  Power,
  Lock,
  RotateCcw,
  Maximize2,
  Minimize2,
  X,
  Minus,
  Sliders,
  ChevronRight,
  ChevronDown,
  Plus,
  RefreshCw,
  FolderPlus,
  Copy,
  Scissors,
  Clipboard,
  ExternalLink,
  ChevronLeft,
  Gamepad2,
} from 'lucide-react';

interface WinIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const WinIcon: React.FC<WinIconProps> = ({ name, className = '', size = 20 }) => {
  // Custom branded icons for authentic Windows 11 styling
  if (name === 'windows') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 88 88"
        className={className}
        fill="currentColor"
      >
        <path d="M0 0h41.6v41.6H0zm46.4 0H88v41.6H46.4zM0 46.4h41.6V88H0zm46.4 0H88V88H46.4z" />
      </svg>
    );
  }

  if (name === 'edge') {
    return (
      <div
        className={`relative rounded-full flex items-center justify-center bg-gradient-to-tr from-sky-600 via-teal-400 to-emerald-400 text-white shadow-sm ${className}`}
        style={{ width: size, height: size }}
      >
        <Globe size={Math.floor(size * 0.65)} className="text-white" />
      </div>
    );
  }

  if (name === 'word' || name === 'docx') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="20" y="8" width="60" height="80" rx="8" fill="#185ABD" />
        <path d="M52 24H72M52 36H72M52 48H72M52 60H72M52 72H64" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
        <rect x="8" y="24" width="48" height="48" rx="8" fill="#103F91" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
        <path d="M19 36H24.5L28 53L32 36H36L40 53L43.5 36H49L44 60H39L34 44L29 60H24L19 36Z" fill="#ffffff" />
      </svg>
    );
  }

  if (name === 'excel' || name === 'xlsx' || name === 'table') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="20" y="8" width="60" height="80" rx="8" fill="#107C41" />
        <rect x="48" y="24" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="62" y="24" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="48" y="38" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="62" y="38" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="48" y="52" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="62" y="52" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="48" y="66" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="62" y="66" width="10" height="10" rx="2" fill="#ffffff" opacity="0.8" />
        <rect x="8" y="24" width="48" height="48" rx="8" fill="#0E5C2F" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
        <path d="M21 36H28.5L34 46L39.5 36H47L38 50L47.5 60H40L34 52L28 60H20.5L30 49L21 36Z" fill="#ffffff" />
      </svg>
    );
  }

  if (name === 'powerpoint' || name === 'pptx' || name === 'ppt' || name === 'presentation') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="20" y="8" width="60" height="80" rx="8" fill="#D83B01" />
        {/* Pie chart graphic */}
        <circle cx="60" cy="48" r="16" fill="#FFA500" opacity="0.9" />
        <path d="M60 48L60 32A16 16 0 0 1 76 48Z" fill="#ffffff" opacity="0.9" />
        <rect x="8" y="24" width="48" height="48" rx="8" fill="#A82A00" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))" />
        <path d="M22 36H35C40 36 44 39.5 44 44.5C44 49.5 40 53 35 53H29V60H22V36ZM29 42V47H34.5C36.5 47 38 46 38 44.5C38 43 36.5 42 34.5 42H29Z" fill="#ffffff" />
      </svg>
    );
  }

  if (name === 'vscode' || name === 'code') {
    return (
      <svg width={size} height={size} viewBox="0 0 100 100" className={className} fill="none">
        <path d="M72.5 94.5L95.5 83.5V16.5L72.5 5.5L34.5 35L15.5 20.5L4.5 26.5L22.5 50L4.5 73.5L15.5 79.5L34.5 65L72.5 94.5Z" fill="#0065A9" />
        <path d="M72.5 94.5L34.5 65L15.5 79.5L4.5 73.5L22.5 50L72.5 94.5Z" fill="#007ACC" />
        <path d="M72.5 5.5L34.5 35L15.5 20.5L4.5 26.5L22.5 50L72.5 5.5Z" fill="#1F9CF0" />
        <path d="M72.5 5.5V94.5L95.5 83.5V16.5L72.5 5.5Z" fill="#0065A9" />
      </svg>
    );
  }

  if (name === 'py' || name === 'python') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#3776AB" />
        <path d="M48 20C40 20 40 24 40 24V28H48V29H34C28 29 28 36 28 36V44C28 50 34 50 34 50H37V46C37 42 41 42 41 42H49C54 42 54 37 54 37V30C54 20 48 20 48 20ZM44 24C45.1 24 46 24.9 46 26C46 27.1 45.1 28 44 28C42.9 28 42 27.1 42 26C42 24.9 42.9 24 44 24Z" fill="#FFE873" />
        <path d="M48 76C56 76 56 72 56 72V68H48V67H62C68 67 68 60 68 60V52C68 46 62 46 62 46H59V50C59 54 55 54 55 54H47C42 54 42 59 42 59V66C42 76 48 76 48 76ZM52 72C50.9 72 50 71.1 50 70C50 68.9 50.9 68 52 68C53.1 68 54 68.9 54 70C54 71.1 53.1 72 52 72Z" fill="#306998" />
        <rect x="10" y="58" width="36" height="24" rx="4" fill="#FFE873" />
        <text x="14" y="74" fill="#306998" fontSize="12" fontWeight="bold" fontFamily="monospace">.PY</text>
      </svg>
    );
  }

  if (name === 'cpp' || name === 'c') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#00599C" />
        <circle cx="48" cy="48" r="22" stroke="#ffffff" strokeWidth="6" fill="none" strokeDasharray="100 35" />
        <text x="64" y="44" fill="#659AD2" fontSize="18" fontWeight="bold" fontFamily="monospace">+</text>
        <text x="74" y="44" fill="#659AD2" fontSize="18" fontWeight="bold" fontFamily="monospace">+</text>
        <rect x="10" y="58" width="38" height="24" rx="4" fill="#ffffff" />
        <text x="13" y="74" fill="#00599C" fontSize="11" fontWeight="bold" fontFamily="monospace">{name === 'c' ? '.C' : '.CPP'}</text>
      </svg>
    );
  }

  if (name === 'html' || name === 'htm') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#E34F26" />
        <path d="M30 26L34 68L48 72L62 68L66 26H30Z" fill="#EF652A" opacity="0.4" />
        <path d="M42 40L34 48L42 56M54 40L62 48L54 56" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="10" y="58" width="40" height="24" rx="4" fill="#ffffff" />
        <text x="13" y="74" fill="#E34F26" fontSize="11" fontWeight="bold" fontFamily="monospace">HTML</text>
      </svg>
    );
  }

  if (name === 'css') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#1572B6" />
        <text x="36" y="52" fill="#ffffff" fontSize="28" fontWeight="bold" fontFamily="monospace">#</text>
        <rect x="10" y="58" width="38" height="24" rx="4" fill="#ffffff" />
        <text x="14" y="74" fill="#1572B6" fontSize="11" fontWeight="bold" fontFamily="monospace">.CSS</text>
      </svg>
    );
  }

  if (name === 'js' || name === 'javascript') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#F7DF1E" />
        <text x="40" y="60" fill="#000000" fontSize="36" fontWeight="bold" fontFamily="monospace">JS</text>
        <rect x="10" y="58" width="36" height="24" rx="4" fill="#000000" />
        <text x="15" y="74" fill="#F7DF1E" fontSize="12" fontWeight="bold" fontFamily="monospace">.JS</text>
      </svg>
    );
  }

  if (name === 'ino' || name === 'arduino') {
    return (
      <svg width={size} height={size} viewBox="0 0 96 96" className={className} fill="none">
        <rect x="16" y="8" width="64" height="80" rx="6" fill="#00979C" />
        <circle cx="38" cy="46" r="12" stroke="#ffffff" strokeWidth="4" fill="none" />
        <circle cx="58" cy="46" r="12" stroke="#ffffff" strokeWidth="4" fill="none" />
        <text x="34" y="49" fill="#ffffff" fontSize="12" fontWeight="bold">-</text>
        <text x="54" y="50" fill="#ffffff" fontSize="12" fontWeight="bold">+</text>
        <rect x="10" y="58" width="38" height="24" rx="4" fill="#ffffff" />
        <text x="13" y="74" fill="#00979C" fontSize="11" fontWeight="bold" fontFamily="monospace">.INO</text>
      </svg>
    );
  }

  if (name === 'folder') {
    return <Folder size={size} className={`text-amber-400 fill-amber-400/20 ${className}`} />;
  }

  if (name === 'recycle-bin' || name === 'trash-2') {
    return <Trash2 size={size} className={`text-slate-300 dark:text-slate-300 ${className}`} />;
  }

  const map: Record<string, React.FC<any>> = {
    globe: Globe,
    'shopping-bag': ShoppingBag,
    'file-text': FileText,
    palette: Palette,
    calculator: Calculator,
    clock: Clock,
    calendar: Calendar,
    image: Image,
    'play-circle': PlayCircle,
    camera: Camera,
    mic: Mic,
    crop: Crop,
    activity: Activity,
    terminal: Terminal,
    settings: Settings,
    'shield-check': ShieldCheck,
    'sticky-note': StickyNote,
    table: Table,
    presentation: Presentation,
    'hard-drive': HardDrive,
    user: User,
    monitor: Monitor,
    download: Download,
    music: Music,
    video: Video,
    file: File,
    search: Search,
    'layout-grid': LayoutGrid,
    'volume-2': Volume2,
    wifi: Wifi,
    battery: Battery,
    bell: Bell,
    sun: Sun,
    moon: Moon,
    power: Power,
    lock: Lock,
    'rotate-ccw': RotateCcw,
    maximize: Maximize2,
    minimize: Minimize2,
    close: X,
    minus: Minus,
    sliders: Sliders,
    'chevron-right': ChevronRight,
    'chevron-left': ChevronLeft,
    'chevron-down': ChevronDown,
    plus: Plus,
    refresh: RefreshCw,
    'folder-plus': FolderPlus,
    copy: Copy,
    scissors: Scissors,
    clipboard: Clipboard,
    'external-link': ExternalLink,
    gamepad: Gamepad2,
    joystick: Gamepad2,
    gaming: Gamepad2,
  };

  const Component = map[name] || File;
  return <Component size={size} className={className} />;
};
