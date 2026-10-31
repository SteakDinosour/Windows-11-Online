import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { soundManager } from '../../services/soundEffects';

interface NotepadProps {
  payload?: {
    fileId?: string;
    fileName?: string;
    content?: string;
  };
}

export const NotepadApp: React.FC<NotepadProps> = ({ payload }) => {
  const { addNotification, copyToClipboard } = useOS();

  const [content, setContent] = useState<string>(payload?.content || '');
  const [fileName, setFileName] = useState<string>(payload?.fileName || 'Untitled.txt');
  const [fileId, setFileId] = useState<string | null>(payload?.fileId || null);
  const [wordWrap, setWordWrap] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(100);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | null>(null);

  useEffect(() => {
    if (payload?.content !== undefined) {
      setContent(payload.content);
      setFileName(payload.fileName || 'Untitled.txt');
      setFileId(payload.fileId || null);
    }
  }, [payload]);

  const handleSave = () => {
    soundManager.playClick();
    if (fileId) {
      fileSystem.updateFileContent(fileId, content);
      setIsSaved(true);
      addNotification('Notepad', `Saved changes to ${fileName}`, 'Notepad');
    } else {
      const newItem = fileSystem.createItem(fileName, 'file', 'desktop', content, 'txt');
      setFileId(newItem.id);
      setIsSaved(true);
      addNotification('Notepad', `Saved ${fileName} to Desktop`, 'Notepad');
    }
    setActiveMenu(null);
  };

  const handleNew = () => {
    soundManager.playClick();
    setContent('');
    setFileName('Untitled.txt');
    setFileId(null);
    setIsSaved(true);
    setActiveMenu(null);
  };

  // Cursor positions calculation
  const lines = content.split('\n');
  const lineCount = lines.length;
  const charCount = content.length;

  return (
    <div
      className="flex flex-col h-full w-full bg-white dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none"
      onClick={() => setActiveMenu(null)}
    >
      {/* Menu Bar */}
      <div className="h-8 px-2 flex items-center gap-1 bg-neutral-100 dark:bg-[#282828] border-b border-neutral-200 dark:border-neutral-800 text-xs relative">
        {/* File Menu */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
            className={`px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium ${
              activeMenu === 'file' ? 'bg-neutral-200 dark:bg-neutral-700' : ''
            }`}
          >
            File
          </button>
          {activeMenu === 'file' && (
            <div className="absolute top-8 left-0 w-44 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs z-[10000]">
              <button
                onClick={handleNew}
                className="w-full flex justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left"
              >
                <span>New</span>
                <span className="text-neutral-400">Ctrl+N</span>
              </button>
              <button
                onClick={handleSave}
                className="w-full flex justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left font-medium text-sky-500"
              >
                <span>Save</span>
                <span className="text-neutral-400">Ctrl+S</span>
              </button>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            }}
            className={`px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium ${
              activeMenu === 'edit' ? 'bg-neutral-200 dark:bg-neutral-700' : ''
            }`}
          >
            Edit
          </button>
          {activeMenu === 'edit' && (
            <div className="absolute top-8 left-0 w-44 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs z-[10000]">
              <button
                onClick={() => {
                  copyToClipboard(content);
                  setActiveMenu(null);
                }}
                className="w-full flex justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left"
              >
                <span>Copy All</span>
                <span className="text-neutral-400">Ctrl+C</span>
              </button>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'view' ? null : 'view');
            }}
            className={`px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-medium ${
              activeMenu === 'view' ? 'bg-neutral-200 dark:bg-neutral-700' : ''
            }`}
          >
            View
          </button>
          {activeMenu === 'view' && (
            <div className="absolute top-8 left-0 w-44 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs z-[10000]">
              <button
                onClick={() => setZoom(z => Math.min(z + 10, 200))}
                className="w-full flex justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left"
              >
                <span>Zoom In</span>
                <span className="text-neutral-400">Ctrl++</span>
              </button>
              <button
                onClick={() => setZoom(z => Math.max(z - 10, 50))}
                className="w-full flex justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left"
              >
                <span>Zoom Out</span>
                <span className="text-neutral-400">Ctrl+-</span>
              </button>
              <button
                onClick={() => setWordWrap(!wordWrap)}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-left"
              >
                <span>Word Wrap</span>
                <span>{wordWrap ? '✓' : ''}</span>
              </button>
            </div>
          )}
        </div>

        <span className="ml-auto text-[11px] text-neutral-400 truncate max-w-48 font-mono">
          {fileName} {!isSaved && '*'}
        </span>
      </div>

      {/* Text Editor Area */}
      <textarea
        value={content}
        onChange={e => {
          setContent(e.target.value);
          setIsSaved(false);
        }}
        wrap={wordWrap ? 'soft' : 'off'}
        style={{ fontSize: `${(zoom / 100) * 14}px` }}
        className="flex-1 w-full p-4 bg-transparent resize-none outline-none font-mono text-slate-800 dark:text-slate-100 select-text"
        placeholder="Type here..."
      />

      {/* Bottom Status Bar */}
      <div className="h-6 px-4 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-[#252525] text-[11px] text-neutral-400 font-mono tabular-nums">
        <div className="flex items-center gap-6">
          <span>Ln {lineCount}, Col {content.length}</span>
          <span>{charCount} characters</span>
        </div>
        <div className="flex items-center gap-6">
          <span>{zoom}%</span>
          <span>Windows (CRLF)</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
};
