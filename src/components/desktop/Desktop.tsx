import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { FileSystemItem } from '../../types/os';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface DesktopShortcut {
  id: string;
  name: string;
  icon: string;
  action: () => void;
  isSystem?: boolean;
  fileItem?: FileSystemItem;
}

export const Desktop: React.FC = () => {
  const {
    settings,
    openWindow,
    closeAllPopups,
    updateSettings,
    speakText,
    copyToClipboard,
    lockSystem,
  } = useOS();

  const [desktopFiles, setDesktopFiles] = useState<FileSystemItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [propertiesItem, setPropertiesItem] = useState<FileSystemItem | null>(null);

  // Reload desktop files from filesystem
  const reloadFiles = useCallback(() => {
    setDesktopFiles(fileSystem.getDesktopItems());
  }, []);

  useEffect(() => {
    reloadFiles();
    const interval = setInterval(reloadFiles, 1500);
    return () => clearInterval(interval);
  }, [reloadFiles]);

  // System shortcuts
  const systemShortcuts: DesktopShortcut[] = [
    {
      id: 'sys-this-pc',
      name: 'This PC',
      icon: 'monitor',
      action: () => openWindow('explorer', { pathId: null }),
      isSystem: true,
    },
    {
      id: 'sys-recycle-bin',
      name: 'Recycle Bin',
      icon: 'recycle-bin',
      action: () => openWindow('explorer', { pathId: 'recycle-bin' }),
      isSystem: true,
    },
    {
      id: 'sys-user',
      name: 'User Files',
      icon: 'user',
      action: () => openWindow('explorer', { pathId: 'user-dir' }),
      isSystem: true,
    },
    {
      id: 'sys-edge',
      name: 'Microsoft Edge',
      icon: 'edge',
      action: () => openWindow('edge'),
      isSystem: true,
    },
    {
      id: 'sys-store',
      name: 'Microsoft Store',
      icon: 'shopping-bag',
      action: () => openWindow('store'),
      isSystem: true,
    },
  ];

  // Map file items to shortcuts
  const fileShortcuts: DesktopShortcut[] = desktopFiles.map(file => ({
    id: file.id,
    name: file.name,
    icon:
      file.type === 'folder'
        ? 'folder'
        : file.extension === 'txt'
        ? 'file-text'
        : file.extension === 'docx'
        ? 'word'
        : file.extension === 'xlsx'
        ? 'excel'
        : file.extension === 'pptx'
        ? 'powerpoint'
        : 'file',
    action: () => {
      if (file.type === 'folder') {
        openWindow('explorer', { pathId: file.id });
      } else if (file.extension === 'txt') {
        openWindow('notepad', { fileId: file.id, content: file.content, fileName: file.name });
      } else if (file.extension === 'docx') {
        openWindow('word', { fileId: file.id, content: file.content, fileName: file.name });
      } else if (file.extension === 'xlsx') {
        openWindow('excel', { fileId: file.id, content: file.content, fileName: file.name });
      } else if (file.extension === 'pptx') {
        openWindow('powerpoint', { fileId: file.id, content: file.content, fileName: file.name });
      } else {
        openWindow('notepad', { fileId: file.id, content: file.content, fileName: file.name });
      }
    },
    fileItem: file,
  }));

  const allShortcuts = [...systemShortcuts, ...fileShortcuts];

  // Free-moving icon positions state
  const [iconPositions, setIconPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    try {
      const saved = localStorage.getItem('win11_desktop_icon_positions_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const draggingRef = useRef<{ id: string; startX: number; startY: number; initialX: number; initialY: number } | null>(null);

  // Initialize missing icon positions in default grid columns
  useEffect(() => {
    const posMap = { ...iconPositions };
    let changed = false;
    allShortcuts.forEach((item, index) => {
      if (!posMap[item.id]) {
        const col = Math.floor(index / 6);
        const row = index % 6;
        posMap[item.id] = {
          x: 24 + col * 92,
          y: 24 + row * 96,
        };
        changed = true;
      }
    });
    if (changed) {
      setIconPositions(posMap);
      try {
        localStorage.setItem('win11_desktop_icon_positions_v1', JSON.stringify(posMap));
      } catch {}
    }
  }, [allShortcuts.length]);

  const handleIconMouseDown = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    const currentPos = iconPositions[id] || { x: 24, y: 24 };
    draggingRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos.x,
      initialY: currentPos.y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = moveEvent.clientX - draggingRef.current.startX;
      const dy = moveEvent.clientY - draggingRef.current.startY;
      const newX = Math.max(10, Math.min(window.innerWidth - 90, draggingRef.current.initialX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 120, draggingRef.current.initialY + dy));

      setIconPositions(prev => {
        const next = { ...prev, [draggingRef.current!.id]: { x: newX, y: newY } };
        try {
          localStorage.setItem('win11_desktop_icon_positions_v1', JSON.stringify(next));
        } catch {}
        return next;
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    targetItem?: DesktopShortcut;
  }>({ visible: false, x: 0, y: 0 });

  // Rubber-band selection state
  const [selectionBox, setSelectionBox] = useState<{
    active: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({ active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 });

  const desktopRef = useRef<HTMLDivElement>(null);

  // Right-click desktop or item handler
  const handleContextMenu = (e: React.MouseEvent, item?: DesktopShortcut) => {
    e.preventDefault();
    e.stopPropagation();
    closeAllPopups();

    const mouseX = Math.min(e.clientX, window.innerWidth - 240);
    const mouseY = Math.min(e.clientY, window.innerHeight - 300);

    setContextMenu({
      visible: true,
      x: mouseX,
      y: mouseY,
      targetItem: item,
    });

    if (item && !selectedIds.includes(item.id)) {
      setSelectedIds([item.id]);
    }
  };

  const handleDesktopClick = (e: React.MouseEvent) => {
    // Only deselect if clicked directly on background
    if (e.target === desktopRef.current || (e.target as HTMLElement).id === 'desktop-bg') {
      setSelectedIds([]);
      setRenamingId(null);
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
    closeAllPopups();
  };

  // Rubber-band selection mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.target !== desktopRef.current && (e.target as HTMLElement).id !== 'desktop-bg') return;

    setSelectionBox({
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    });
    setSelectedIds([]);
    setRenamingId(null);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectionBox.active) return;
    setSelectionBox(prev => ({
      ...prev,
      currentX: e.clientX,
      currentY: e.clientY,
    }));
  };

  const handleMouseUp = () => {
    if (!selectionBox.active) return;
    setSelectionBox(prev => ({ ...prev, active: false }));
  };

  // Create new folder
  const handleCreateFolder = () => {
    const newFolder = fileSystem.createItem('New folder', 'folder', 'desktop');
    reloadFiles();
    setSelectedIds([newFolder.id]);
    setRenamingId(newFolder.id);
    setRenameValue(newFolder.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Create new text document
  const handleCreateTextDoc = () => {
    const newDoc = fileSystem.createItem('New Text Document.txt', 'file', 'desktop', '', 'txt');
    reloadFiles();
    setSelectedIds([newDoc.id]);
    setRenamingId(newDoc.id);
    setRenameValue(newDoc.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Create new Excel spreadsheet
  const handleCreateExcel = () => {
    const defaultGrid: string[][] = [
      ['Item', 'Qty', 'Unit Price', 'Total'],
      ['Item 1', '10', '15', '=B2*C2'],
      ['Item 2', '5', '30', '=B3*C3'],
      ['Item 3', '20', '8', '=B4*C4'],
      ['Grand Total', '', '', '=SUM(D2:D4)'],
    ];
    while (defaultGrid.length < 16) {
      defaultGrid.push(Array(8).fill(''));
    }
    const newDoc = fileSystem.createItem(
      'New Worksheet.xlsx',
      'file',
      'desktop',
      JSON.stringify(defaultGrid),
      'xlsx'
    );
    reloadFiles();
    setSelectedIds([newDoc.id]);
    setRenamingId(newDoc.id);
    setRenameValue(newDoc.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Create new Word document
  const handleCreateWord = () => {
    const newDoc = fileSystem.createItem(
      'New Document.docx',
      'file',
      'desktop',
      '# New Document\n\nStart typing your content here...',
      'docx'
    );
    reloadFiles();
    setSelectedIds([newDoc.id]);
    setRenamingId(newDoc.id);
    setRenameValue(newDoc.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Create new PowerPoint presentation
  const handleCreatePpt = () => {
    const defaultSlides = [
      { id: '1', title: 'New Presentation', subtitle: 'Click to add subtitle', theme: 'modern' },
      { id: '2', title: 'Agenda', subtitle: '1. Overview\n2. Key Metrics\n3. Next Steps', theme: 'modern' }
    ];
    const newDoc = fileSystem.createItem(
      'New Presentation.pptx',
      'file',
      'desktop',
      JSON.stringify(defaultSlides),
      'pptx'
    );
    reloadFiles();
    setSelectedIds([newDoc.id]);
    setRenamingId(newDoc.id);
    setRenameValue(newDoc.name);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Rename commit
  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      fileSystem.renameItem(id, renameValue.trim());
      reloadFiles();
    }
    setRenamingId(null);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    fileSystem.deleteItem(id);
    reloadFiles();
    setSelectedIds([]);
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  return (
    <div
      ref={desktopRef}
      id="desktop-bg"
      className="relative w-screen h-screen overflow-hidden select-none bg-cover bg-center transition-all duration-300"
      style={{
        backgroundImage: settings.wallpaper.startsWith('linear') || settings.wallpaper.startsWith('radial') ? settings.wallpaper : `url('${settings.wallpaper}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={handleDesktopClick}
      onContextMenu={e => handleContextMenu(e)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Night Light warm tone overlay */}
      {settings.nightLight && (
        <div
          className="absolute inset-0 pointer-events-none z-[1] bg-amber-600/18 mix-blend-color transition-opacity duration-500"
        />
      )}

      {/* Brightness dimming filter */}
      <div
        className="absolute inset-0 pointer-events-none z-[2] transition-colors duration-200"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${((100 - settings.brightness) / 100) * 0.75})`,
        }}
      />

      {/* Desktop Draggable Icons */}
      <div className="absolute inset-0 z-[10] pointer-events-none">
        {allShortcuts.map(item => {
          const isSelected = selectedIds.includes(item.id);
          const isRenaming = renamingId === item.id;
          const pos = iconPositions[item.id] || { x: 24, y: 24 };

          return (
            <div
              key={item.id}
              className={`absolute group w-20 p-2 flex flex-col items-center justify-start rounded-md transition-shadow cursor-pointer pointer-events-auto ${
                isSelected
                  ? 'bg-blue-500/25 ring-1 ring-blue-400/50 shadow-sm z-20'
                  : 'hover:bg-white/15 dark:hover:bg-white/10'
              }`}
              style={{
                left: `${pos.x}px`,
                top: `${pos.y}px`,
              }}
              onMouseDown={e => handleIconMouseDown(e, item.id)}
              onClick={e => {
                e.stopPropagation();
                if (e.ctrlKey) {
                  setSelectedIds(prev =>
                    prev.includes(item.id) ? prev.filter(x => x !== item.id) : [...prev, item.id]
                  );
                } else {
                  setSelectedIds([item.id]);
                }
                setRenamingId(null);
                setContextMenu({ visible: false, x: 0, y: 0 });
                speakText(item.name);
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                item.action();
              }}
              onContextMenu={e => handleContextMenu(e, item)}
            >
              {/* Icon Container */}
              <div className="w-11 h-11 flex items-center justify-center drop-shadow-md transition-transform group-active:scale-95">
                <WinIcon name={item.icon} size={36} className="text-white" />
              </div>

              {/* Title / Renaming input */}
              {isRenaming ? (
                <input
                  type="text"
                  autoFocus
                  className="mt-1 w-full text-center text-xs px-1 py-0.5 rounded bg-white text-slate-900 outline-none ring-1 ring-blue-500"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(item.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit(item.id);
                    if (e.key === 'Escape') setRenamingId(null);
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <span
                  className="mt-1 text-center text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] line-clamp-2 px-1 break-words font-medium tracking-tight"
                >
                  {item.name}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Rubber-band Multi-Selection Box */}
      {selectionBox.active && (
        <div
          className="absolute border border-blue-400/80 bg-blue-500/20 z-[40] pointer-events-none"
          style={{
            left: Math.min(selectionBox.startX, selectionBox.currentX),
            top: Math.min(selectionBox.startY, selectionBox.currentY),
            width: Math.abs(selectionBox.currentX - selectionBox.startX),
            height: Math.abs(selectionBox.currentY - selectionBox.startY),
          }}
        />
      )}

      {/* Right Click Context Menu */}
      {contextMenu.visible && (
        <div
          className="absolute z-[9999] min-w-56 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow text-xs text-slate-800 dark:text-slate-100 animate-win11-open"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {contextMenu.targetItem ? (
            // Context menu for specific Desktop item
            <>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left font-medium"
                onClick={() => {
                  contextMenu.targetItem?.action();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <WinIcon name="folder" size={14} />
                <span>Open</span>
              </button>

              {contextMenu.targetItem.id === 'sys-recycle-bin' && (
                <button
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left text-red-500 dark:text-red-400"
                  onClick={() => {
                    fileSystem.emptyRecycleBin();
                    setContextMenu({ visible: false, x: 0, y: 0 });
                  }}
                >
                  <WinIcon name="trash-2" size={14} />
                  <span>Empty Recycle Bin</span>
                </button>
              )}

              {contextMenu.targetItem.fileItem && (
                <>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                    onClick={() => {
                      copyToClipboard(contextMenu.targetItem?.fileItem?.content || contextMenu.targetItem?.name || '');
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}
                  >
                    <WinIcon name="copy" size={14} />
                    <span>Copy</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                    onClick={() => {
                      setRenamingId(contextMenu.targetItem!.id);
                      setRenameValue(contextMenu.targetItem!.name);
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}
                  >
                    <WinIcon name="file-text" size={14} />
                    <span>Rename (F2)</span>
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left text-red-500"
                    onClick={() => handleDeleteItem(contextMenu.targetItem!.id)}
                  >
                    <WinIcon name="trash-2" size={14} />
                    <span>Delete</span>
                  </button>
                  <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                    onClick={() => {
                      setPropertiesItem(contextMenu.targetItem!.fileItem!);
                      setContextMenu({ visible: false, x: 0, y: 0 });
                    }}
                  >
                    <WinIcon name="settings" size={14} />
                    <span>Properties</span>
                  </button>
                </>
              )}
            </>
          ) : (
            // General Desktop background right-click menu
            <>
              <button
                className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={() => {
                  soundManager.playClick();
                  reloadFiles();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <div className="flex items-center gap-2">
                  <WinIcon name="refresh" size={14} />
                  <span>Refresh</span>
                </div>
                <span className="text-[10px] text-neutral-400">F5</span>
              </button>

              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

              {/* New submenu */}
              <div className="px-3 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                New
              </div>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={handleCreateFolder}
              >
                <WinIcon name="folder-plus" size={14} className="text-amber-400" />
                <span>Folder</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={handleCreateTextDoc}
              >
                <WinIcon name="file-text" size={14} className="text-sky-400" />
                <span>Text Document</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={handleCreateExcel}
              >
                <WinIcon name="excel" size={14} className="text-emerald-500" />
                <span>Microsoft Excel Worksheet</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={handleCreateWord}
              >
                <WinIcon name="word" size={14} className="text-blue-500" />
                <span>Microsoft Word Document</span>
              </button>
              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={handleCreatePpt}
              >
                <WinIcon name="powerpoint" size={14} className="text-orange-500" />
                <span>Microsoft PowerPoint Presentation</span>
              </button>

              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={() => {
                  openWindow('terminal');
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <WinIcon name="terminal" size={14} />
                <span>Open in Terminal</span>
              </button>

              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={() => {
                  openWindow('settings', { tab: 'display' });
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <WinIcon name="monitor" size={14} />
                <span>Display settings</span>
              </button>

              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={() => {
                  openWindow('settings', { tab: 'personalization' });
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <WinIcon name="palette" size={14} />
                <span>Personalize</span>
              </button>

              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />

              <button
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
                onClick={() => {
                  lockSystem();
                  setContextMenu({ visible: false, x: 0, y: 0 });
                }}
              >
                <WinIcon name="lock" size={14} />
                <span>Lock Screen (Win + L)</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* File Properties Modal */}
      {propertiesItem && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
          onClick={() => setPropertiesItem(null)}
        >
          <div
            className="w-80 p-4 rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <WinIcon name={propertiesItem.icon || 'file'} size={20} />
                <h3 className="font-semibold text-sm truncate max-w-[180px]">{propertiesItem.name}</h3>
              </div>
              <button
                onClick={() => setPropertiesItem(null)}
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                <WinIcon name="close" size={14} />
              </button>
            </div>

            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Type:</span>
                <span className="font-medium">{propertiesItem.type === 'folder' ? 'File folder' : `${propertiesItem.extension?.toUpperCase()} File`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Location:</span>
                <span className="font-medium">C:\Users\User\Desktop</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Size:</span>
                <span className="font-medium font-mono tabular-nums">{propertiesItem.size} bytes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Modified:</span>
                <span className="font-medium font-mono tabular-nums">{propertiesItem.updatedAt}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex justify-end">
              <button
                onClick={() => setPropertiesItem(null)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
