import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error';
  text: string;
}

export const TerminalApp: React.FC = () => {
  const { openWindow } = useOS();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>('user-dir');
  const [inputVal, setInputVal] = useState<string>('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: '1', type: 'output', text: 'Windows PowerShell' },
    { id: '2', type: 'output', text: 'Copyright (C) Microsoft Corporation. All rights reserved.' },
    { id: '3', type: 'output', text: 'Install the latest PowerShell for new features and improvements! https://aka.ms/PSWindows' },
    { id: '4', type: 'output', text: '' },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const currentPathString = `C:\\Users\\User${currentFolderId && currentFolderId !== 'user-dir' ? `\\${fileSystem.getItemById(currentFolderId)?.name || ''}` : ''}`;

  const handleCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) {
      setLines(prev => [...prev, { id: Date.now().toString(), type: 'input', text: `PS ${currentPathString}> ` }]);
      return;
    }

    soundManager.playClick();
    setHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    const newLines: TerminalLine[] = [
      { id: Date.now().toString(), type: 'input', text: `PS ${currentPathString}> ${trimmed}` },
    ];

    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'cls':
      case 'clear':
        setLines([]);
        setInputVal('');
        return;

      case 'help':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          text: `Supported commands:
  dir, ls          List items in current virtual folder
  cd <dir>         Change folder (e.g. cd Desktop, cd ..)
  cat, type <file> Print file contents
  mkdir <name>     Create a new directory
  cls, clear       Clear terminal screen
  whoami           Display current user
  ver              Display Windows version
  systeminfo       Display device specs
  date, time       Show current timestamp
  calc, notepad    Launch GUI applications
  exit             Close terminal`,
        });
        break;

      case 'dir':
      case 'ls': {
        const items = fileSystem.getItems(currentFolderId);
        let out = '    Directory: ' + currentPathString + '\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n';
        items.forEach(item => {
          const mode = item.type === 'folder' ? 'd-----' : '-a----';
          out += `${mode}        ${item.updatedAt}           ${item.size.toString().padStart(6, ' ')} ${item.name}\n`;
        });
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: out });
        break;
      }

      case 'cd': {
        const target = args[0];
        if (!target || target === '~') {
          setCurrentFolderId('user-dir');
        } else if (target === '..') {
          if (currentFolderId && currentFolderId !== 'user-dir') {
            const curr = fileSystem.getItemById(currentFolderId);
            setCurrentFolderId(curr?.parentId || 'user-dir');
          }
        } else {
          const items = fileSystem.getItems(currentFolderId);
          const found = items.find(i => i.type === 'folder' && i.name.toLowerCase() === target.toLowerCase());
          if (found) {
            setCurrentFolderId(found.id);
          } else {
            newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: `Cannot find path '${target}' because it does not exist.` });
          }
        }
        break;
      }

      case 'cat':
      case 'type': {
        const fileName = args.join(' ');
        const items = fileSystem.getItems(currentFolderId);
        const file = items.find(i => i.name.toLowerCase() === fileName.toLowerCase());
        if (file) {
          newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: file.content || '(empty file)' });
        } else {
          newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: `File not found: ${fileName}` });
        }
        break;
      }

      case 'mkdir': {
        const dirName = args.join(' ');
        if (dirName) {
          fileSystem.createItem(dirName, 'folder', currentFolderId);
          newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: `Created directory: ${dirName}` });
        }
        break;
      }

      case 'del':
      case 'rm':
      case 'rmdir':
      case 'rd':
      case 'remove-item': {
        const fullArg = args.join(' ').toLowerCase();
        if (fullArg.includes('system32')) {
          newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: 'Deleting critical system component C:\\Windows\\System32...' });
          setTimeout(() => {
            fileSystem.deleteSystem32();
          }, 300);
        } else {
          const targetName = args.filter(a => !a.startsWith('/') && !a.startsWith('-')).join(' ');
          const items = fileSystem.getItems(currentFolderId);
          const found = items.find(i => i.name.toLowerCase() === targetName.toLowerCase());
          if (found) {
            fileSystem.deleteItem(found.id);
            newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: `Removed: ${found.name}` });
          } else {
            newLines.push({ id: (Date.now() + 1).toString(), type: 'error', text: `Cannot find path '${targetName}' because it does not exist.` });
          }
        }
        break;
      }

      case 'whoami':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'desktop-win11\\user' });
        break;

      case 'ver':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'Microsoft Windows [Version 10.0.26100.1742]' });
        break;

      case 'systeminfo':
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'output',
          text: `Host Name:                 DESKTOP-WIN11-PRO
OS Name:                   Microsoft Windows 11 Pro Online
OS Version:                10.0.26100 Build 26100
System Manufacturer:       Google AI Studio
System Model:              Virtual Machine Architecture
Total Physical Memory:     16,384 MB
Network Card(s):           1 NIC(s) Installed. [01]: Virtual Ethernet Adapter (Up)`,
        });
        break;

      case 'date':
      case 'time':
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: new Date().toString() });
        break;

      case 'calc':
        openWindow('calc');
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'Launched Calculator' });
        break;

      case 'notepad':
        openWindow('notepad');
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'Launched Notepad' });
        break;

      case 'explorer':
        openWindow('explorer', { pathId: currentFolderId });
        newLines.push({ id: (Date.now() + 1).toString(), type: 'output', text: 'Launched File Explorer' });
        break;

      default:
        newLines.push({
          id: (Date.now() + 1).toString(),
          type: 'error',
          text: `'${cmd}' is not recognized as the name of a cmdlet, function, script file, or operable program. Type 'help' for available commands.`,
        });
        break;
    }

    setLines(prev => [...prev, ...newLines]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(history[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0c0c0c] text-neutral-100 font-mono text-xs select-text">
      {/* Terminal Tab Header */}
      <div className="h-8 px-2 flex items-center gap-1 bg-[#181818] border-b border-neutral-800 text-neutral-400 select-none">
        <div className="flex items-center gap-2 px-3 py-1 rounded bg-[#0c0c0c] text-white border-t border-x border-neutral-700">
          <WinIcon name="terminal" size={13} className="text-sky-400" />
          <span className="text-xs">Windows PowerShell</span>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1">
        {lines.map(line => (
          <div
            key={line.id}
            className={`whitespace-pre-wrap leading-relaxed ${
              line.type === 'error'
                ? 'text-red-400'
                : line.type === 'input'
                ? 'text-neutral-200 font-semibold'
                : 'text-neutral-300'
            }`}
          >
            {line.text}
          </div>
        ))}

        {/* Live Input Prompt */}
        <div className="flex items-center gap-1 pt-1">
          <span className="text-neutral-400 select-none font-semibold">
            PS {currentPathString}&gt;
          </span>
          <input
            type="text"
            autoFocus
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white font-mono caret-white"
          />
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
};
