import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PropertiesDialog } from '../common/PropertiesDialog';
import { saveToComputer } from '../../services/diskIO';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { FileSystemItem } from '../../types/os';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface FileExplorerProps {
  payload?: { pathId?: string | null };
}

export const FileExplorerApp: React.FC<FileExplorerProps> = ({ payload }) => {
  const { openWindow, copyToClipboard } = useOS();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(
    payload?.pathId !== undefined ? payload.pathId : 'desktop'
  );
  const [history, setHistory] = useState<(string | null)[]>([currentFolderId]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'icons' | 'details' | 'list'>('icons');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [items, setItems] = useState<FileSystemItem[]>([]);
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; item: FileSystemItem | null } | null>(null);
  const [propsItem, setPropsItem] = useState<FileSystemItem | null>(null);

  useEffect(() => {
    const close = () => setCtxMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  // Reload current folder items
  const loadFolder = useCallback(() => {
    if (currentFolderId === 'recycle-bin') {
      setItems(fileSystem.getRecycleBinItems());
    } else {
      setItems(fileSystem.getItems(currentFolderId));
    }
  }, [currentFolderId]);

  useEffect(() => {
    loadFolder();
  }, [loadFolder]);

  // Support Delete key on selected items
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedIds.length > 0 && !renamingId) {
        handleDelete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIds, renamingId]);

  // Navigation handlers
  const navigateTo = (folderId: string | null) => {
    soundManager.playClick();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(folderId);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentFolderId(folderId);
    setSelectedIds([]);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      soundManager.playClick();
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setCurrentFolderId(history[newIdx]);
      setSelectedIds([]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      soundManager.playClick();
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setCurrentFolderId(history[newIdx]);
      setSelectedIds([]);
    }
  };

  const handleUp = () => {
    if (!currentFolderId) return;
    const curr = fileSystem.getItemById(currentFolderId);
    navigateTo(curr?.parentId || null);
  };

  // Item Open Handler
  const handleOpenItem = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo(item.id);
    } else {
      soundManager.playClick();
      if (item.extension === 'txt') {
        openWindow('notepad', { fileId: item.id, content: item.content, fileName: item.name });
      } else if (item.extension === 'docx') {
        openWindow('word', { fileId: item.id, content: item.content, fileName: item.name });
      } else if (item.extension === 'xlsx') {
        openWindow('excel', { fileId: item.id, content: item.content, fileName: item.name });
      } else if (item.extension === 'pptx') {
        openWindow('powerpoint', { fileId: item.id, content: item.content, fileName: item.name });
      } else {
        openWindow('notepad', { fileId: item.id, content: item.content, fileName: item.name });
      }
    }
  };

  // Create folder in current view
  const handleNewFolder = () => {
    const newFolder = fileSystem.createItem('New folder', 'folder', currentFolderId);
    loadFolder();
    setSelectedIds([newFolder.id]);
    setRenamingId(newFolder.id);
    setRenameValue(newFolder.name);
  };

  // Create text document
  const handleNewTextDoc = () => {
    const newDoc = fileSystem.createItem('New Text Document.txt', 'file', currentFolderId, '', 'txt');
    loadFolder();
    setSelectedIds([newDoc.id]);
    setRenamingId(newDoc.id);
    setRenameValue(newDoc.name);
  };

  // Delete selected
  const handleDelete = () => {
    selectedIds.forEach(id => fileSystem.deleteItem(id));
    loadFolder();
    setSelectedIds([]);
  };

  // Rename commit
  const handleRenameSubmit = (id: string) => {
    if (renameValue.trim()) {
      fileSystem.renameItem(id, renameValue.trim());
      loadFolder();
    }
    setRenamingId(null);
  };

  // Filtered items
  const displayItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    return items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [items, searchQuery]);

  const pathDisplay = fileSystem.getPath(currentFolderId);

  // Quick access tree shortcuts
  const quickAccessFolders = [
    { id: 'desktop', name: 'Desktop', icon: 'monitor' },
    { id: 'documents', name: 'Documents', icon: 'folder-text' },
    { id: 'downloads', name: 'Downloads', icon: 'download' },
    { id: 'pictures', name: 'Pictures', icon: 'image' },
    { id: 'music', name: 'Music', icon: 'music' },
    { id: 'videos', name: 'Videos', icon: 'video' },
  ];

  const inRecycle = currentFolderId === 'recycle-bin';
  const currentFolder = currentFolderId ? fileSystem.getItemById(currentFolderId) : null;
  const menuTarget = ctxMenu?.item ?? null;
  const menuItemClass = "w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left";
  const ctxOverlay = (
    <>
      {ctxMenu && (
        <div
          className="fixed z-[9999] min-w-56 p-1.5 rounded-lg bg-white dark:bg-[#2b2b2b] border border-neutral-300 dark:border-neutral-700 shadow-xl text-xs"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          {menuTarget ? (
            <>
              <button className={menuItemClass} onClick={() => { handleOpenItem(menuTarget); setCtxMenu(null); }}>
                <WinIcon name="folder" size={14} /><span>Open</span>
              </button>
              {inRecycle && (
                <button className={menuItemClass} onClick={() => { fileSystem.restoreItem(menuTarget.id); loadFolder(); setCtxMenu(null); }}>
                  <WinIcon name="refresh" size={14} /><span>Restore to original location</span>
                </button>
              )}
              {menuTarget.type === 'file' && (
                <button className={menuItemClass} onClick={() => { saveToComputer(menuTarget.name, menuTarget.content || ''); setCtxMenu(null); }}>
                  <WinIcon name="download" size={14} /><span>Save to my computer</span>
                </button>
              )}
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button className={menuItemClass} onClick={() => { setPropsItem(menuTarget); setCtxMenu(null); }}>
                <WinIcon name="settings" size={14} /><span>Properties</span>
              </button>
            </>
          ) : (
            <>
              <button className={menuItemClass} onClick={() => { loadFolder(); setCtxMenu(null); }}>
                <WinIcon name="refresh" size={14} /><span>Refresh</span>
              </button>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button className={menuItemClass} onClick={() => { setPropsItem(currentFolder ?? { id: 'this-pc', name: 'This PC', type: 'folder', parentId: null, size: 0, updatedAt: '', icon: 'folder' }); setCtxMenu(null); }}>
                <WinIcon name="settings" size={14} /><span>Properties</span>
              </button>
            </>
          )}
        </div>
      )}
      {propsItem && <PropertiesDialog item={propsItem} onClose={() => setPropsItem(null)} />}
    </>
  );

  return (
    <div className="flex flex-col h-full w-full bg-neutral-50 dark:bg-[#191919] text-slate-800 dark:text-slate-100 select-none" onContextMenu={e => { e.preventDefault(); setCtxMenu({ x: e.clientX, y: e.clientY, item: null }); }}>
      {ctxOverlay}
      {/* Top Tabs Bar */}
      <div className="h-9 px-3 flex items-center gap-1 bg-neutral-100 dark:bg-[#202020] border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-neutral-50 dark:bg-[#191919] border-t border-x border-neutral-200 dark:border-neutral-800 text-xs font-semibold max-w-44 truncate">
          <WinIcon name="folder" size={14} />
          <span className="truncate">{currentFolderId ? fileSystem.getItemById(currentFolderId)?.name || 'Folder' : 'This PC'}</span>
        </div>
      </div>

      {/* Navigation & Address Bar */}
      <div className="h-11 px-3 flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1e1e1e]">
        {/* History controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleBack}
            disabled={historyIndex === 0}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Back"
          >
            <WinIcon name="chevron-left" size={16} />
          </button>
          <button
            onClick={handleForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Forward"
          >
            <WinIcon name="chevron-right" size={16} />
          </button>
          <button
            onClick={handleUp}
            disabled={!currentFolderId}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Up"
          >
            <WinIcon name="minus" size={16} className="-rotate-90" />
          </button>
          <button
            onClick={loadFolder}
            className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Refresh"
          >
            <WinIcon name="refresh" size={14} />
          </button>
        </div>

        {/* Address Breadcrumb input */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-[#282828] border border-neutral-300 dark:border-neutral-700 text-xs">
          <WinIcon name="monitor" size={14} className="text-neutral-400" />
          <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{pathDisplay}</span>
        </div>

        {/* Search inside folder */}
        <div className="w-56 flex items-center gap-2 px-2.5 py-1 rounded-md bg-white dark:bg-[#282828] border border-neutral-300 dark:border-neutral-700 text-xs">
          <WinIcon name="search" size={14} className="text-neutral-400" />
          <input
            type="text"
            placeholder={`Search ${currentFolderId ? fileSystem.getItemById(currentFolderId)?.name || 'Folder' : 'This PC'}...`}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none w-full text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {/* Action Command Bar */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={handleNewFolder}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium"
          >
            <WinIcon name="folder-plus" size={14} className="text-amber-500" />
            <span>New folder</span>
          </button>
          <button
            onClick={handleNewTextDoc}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium"
          >
            <WinIcon name="file-text" size={14} className="text-sky-500" />
            <span>New text doc</span>
          </button>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <button
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium disabled:opacity-30 text-red-500"
          >
            <WinIcon name="trash-2" size={14} />
            <span>Delete</span>
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 text-neutral-500">
          <button
            onClick={() => setViewMode('icons')}
            className={`p-1 rounded ${viewMode === 'icons' ? 'bg-neutral-200 dark:bg-neutral-700 text-blue-500' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            title="Icons"
          >
            <WinIcon name="layout-grid" size={15} />
          </button>
          <button
            onClick={() => setViewMode('details')}
            className={`p-1 rounded ${viewMode === 'details' ? 'bg-neutral-200 dark:bg-neutral-700 text-blue-500' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
            title="Details"
          >
            <WinIcon name="file-text" size={15} />
          </button>
        </div>
      </div>

      {/* Main Split: Left Sidebar Tree + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <div className="w-48 p-2 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto space-y-4 text-xs shrink-0">
          {/* Quick Access */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Quick access
            </div>
            <div className="space-y-0.5">
              {quickAccessFolders.map(f => (
                <button
                  key={f.id}
                  onClick={() => navigateTo(f.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium ${
                    currentFolderId === f.id
                      ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  <WinIcon name={f.icon} size={15} />
                  <span>{f.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* This PC */}
          <div>
            <div className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              This PC
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => navigateTo(null)}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium ${
                  currentFolderId === null
                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                <WinIcon name="monitor" size={15} />
                <span>This PC</span>
              </button>
              <button
                onClick={() => navigateTo('c-drive')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium ${
                  currentFolderId === 'c-drive'
                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                <WinIcon name="hard-drive" size={15} />
                <span>Local Disk (C:)</span>
              </button>
              <button
                onClick={() => navigateTo('recycle-bin')}
                className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-left transition-colors font-medium ${
                  currentFolderId === 'recycle-bin'
                    ? 'bg-blue-600/15 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                <WinIcon name="trash-2" size={15} />
                <span>Recycle Bin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 p-4 overflow-y-auto">
          {displayItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
              <WinIcon name="folder" size={32} className="opacity-30 mb-2" />
              <span>This folder is empty.</span>
            </div>
          ) : viewMode === 'icons' ? (
            // Grid Icons View
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {displayItems.map(item => {
                const isSelected = selectedIds.includes(item.id);
                const isRenaming = renamingId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedIds([item.id])}
                    onDoubleClick={() => handleOpenItem(item)}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSelectedIds([item.id]); setCtxMenu({ x: e.clientX, y: e.clientY, item }); }}
                    className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-500/20 ring-1 ring-blue-500/50'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/60'
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center">
                      <WinIcon name={item.icon || (item.type === 'folder' ? 'folder' : 'file')} size={36} />
                    </div>

                    {isRenaming ? (
                      <input
                        type="text"
                        autoFocus
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => handleRenameSubmit(item.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit(item.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="mt-1 w-full text-center text-xs px-1 py-0.5 rounded bg-white text-slate-900 outline-none ring-1 ring-blue-500"
                      />
                    ) : (
                      <span className="mt-1 text-xs text-center font-medium truncate w-full">
                        {item.name}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // Details List View
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 pb-2">
                  <th className="pb-2 font-medium">Name</th>
                  <th className="pb-2 font-medium">Date modified</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium text-right">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
                {displayItems.map(item => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedIds([item.id])}
                      onDoubleClick={() => handleOpenItem(item)}
                    onContextMenu={e => { e.preventDefault(); e.stopPropagation(); setSelectedIds([item.id]); setCtxMenu({ x: e.clientX, y: e.clientY, item }); }}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-500/20'
                          : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                      }`}
                    >
                      <td className="py-2 flex items-center gap-2 font-medium">
                        <WinIcon name={item.icon || (item.type === 'folder' ? 'folder' : 'file')} size={16} />
                        <span>{item.name}</span>
                      </td>
                      <td className="py-2 text-neutral-400 font-mono tabular-nums">{item.updatedAt}</td>
                      <td className="py-2 text-neutral-400">{item.type === 'folder' ? 'File folder' : `${item.extension?.toUpperCase()} File`}</td>
                      <td className="py-2 text-right font-mono tabular-nums">{item.type === 'folder' ? '' : `${item.size} B`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-3 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 text-[11px] text-neutral-400">
        <span>{displayItems.length} items</span>
        <span className="font-mono tabular-nums">{selectedIds.length > 0 ? `${selectedIds.length} item selected` : ''}</span>
      </div>
    </div>
  );
};
