import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { saveToComputer, pickFilesFromComputer } from '../../services/diskIO';
import { soundManager } from '../../services/soundEffects';
import { WinIcon } from '../common/WinIcon';
import { FileSystemItem } from '../../types/os';

interface VSCodeProps {
  payload?: {
    fileId?: string;
    fileName?: string;
    content?: string;
  };
}

interface OpenTab {
  id: string; // fileId or tempId
  name: string;
  extension: string;
  content: string;
  isDirty: boolean;
  fileItem?: FileSystemItem;
}

export const VSCodeApp: React.FC<VSCodeProps> = ({ payload }) => {
  const { addNotification } = useOS();

  const [openTabs, setOpenTabs] = useState<OpenTab[]>(() => {
    if (payload?.fileName && payload?.content !== undefined) {
      const ext = payload.fileName.split('.').pop()?.toLowerCase() || 'txt';
      return [
        {
          id: payload.fileId || `temp-${Date.now()}`,
          name: payload.fileName,
          extension: ext,
          content: payload.content,
          isDirty: false,
        },
      ];
    }
    // Default initial file
    const docPy = fileSystem.getAllItems().find(i => i.name === 'main.py');
    if (docPy) {
      return [
        {
          id: docPy.id,
          name: docPy.name,
          extension: 'py',
          content: docPy.content || '',
          isDirty: false,
          fileItem: docPy,
        },
      ];
    }
    return [
      {
        id: 'new-1',
        name: 'untitled.py',
        extension: 'py',
        content: '# Write Python or Arduino code here\ndef main():\n    print("Hello from VS Code!")\n\nif __name__ == "__main__":\n    main()\n',
        isDirty: false,
      },
    ];
  });

  const [activeTabId, setActiveTabId] = useState<string>(openTabs[0]?.id || '');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [activeSidebarView, setActiveSidebarView] = useState<'explorer' | 'search' | 'git' | 'debug'>('explorer');
  const [isChooseFileOpen, setIsChooseFileOpen] = useState<boolean>(false);
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('script.py');
  const [cursorPos, setCursorPos] = useState<{ line: number; col: number }>({ line: 1, col: 1 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeTab = useMemo(() => {
    return openTabs.find(t => t.id === activeTabId) || openTabs[0];
  }, [openTabs, activeTabId]);

  // When payload changes externally
  useEffect(() => {
    if (payload?.fileName && payload?.content !== undefined) {
      const ext = payload.fileName.split('.').pop()?.toLowerCase() || 'txt';
      const existing = openTabs.find(t => t.id === payload.fileId || t.name === payload.fileName);
      if (existing) {
        setActiveTabId(existing.id);
      } else {
        const newTab: OpenTab = {
          id: payload.fileId || `file-${Date.now()}`,
          name: payload.fileName,
          extension: ext,
          content: payload.content,
          isDirty: false,
        };
        setOpenTabs(prev => [...prev, newTab]);
        setActiveTabId(newTab.id);
      }
    }
  }, [payload]);

  // Keyboard shortcut Ctrl+S, Ctrl+O
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveCurrentFile();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setIsChooseFileOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const handleOpenFile = (item: FileSystemItem) => {
    soundManager.playClick();
    const ext = item.name.split('.').pop()?.toLowerCase() || 'txt';
    const existing = openTabs.find(t => t.id === item.id);
    if (existing) {
      setActiveTabId(existing.id);
    } else {
      const newTab: OpenTab = {
        id: item.id,
        name: item.name,
        extension: ext,
        content: item.content || '',
        isDirty: false,
        fileItem: item,
      };
      setOpenTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
    setIsChooseFileOpen(false);
  };

  // Open one or more files from the user's real PC (native "Choose file" dialog)
  const handleOpenFromPC = async () => {
    soundManager.playClick();
    const picked = await pickFilesFromComputer();
    if (picked.length === 0) return;
    picked.forEach(f => {
      const ext = f.name.split('.').pop()?.toLowerCase() || 'txt';
      const created = fileSystem.createItem(f.name, 'file', 'documents', f.content, ext);
      handleOpenFile(created);
      addNotification('Visual Studio Code', `Opened ${f.name} from your PC`, 'VS Code');
    });
  };

  // Save the current tab to the virtual disk AND download it to the real PC
  const handleSaveToPC = () => {
    if (!activeTab) return;
    handleSaveCurrentFile();
    saveToComputer(activeTab.name, activeTab.content);
    addNotification('Visual Studio Code', `Downloaded ${activeTab.name} to your PC`, 'VS Code');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundManager.playClick();
    const remaining = openTabs.filter(t => t.id !== id);
    if (remaining.length === 0) {
      setOpenTabs([
        {
          id: `new-${Date.now()}`,
          name: 'untitled.txt',
          extension: 'txt',
          content: '',
          isDirty: false,
        },
      ]);
      setActiveTabId(`new-${Date.now()}`);
    } else {
      setOpenTabs(remaining);
      if (activeTabId === id) {
        setActiveTabId(remaining[remaining.length - 1].id);
      }
    }
  };

  const handleContentChange = (newVal: string) => {
    if (!activeTab) return;
    setOpenTabs(prev =>
      prev.map(t => (t.id === activeTab.id ? { ...t, content: newVal, isDirty: true } : t))
    );
  };

  const handleSaveCurrentFile = () => {
    if (!activeTab) return;
    soundManager.playClick();
    if (activeTab.fileItem) {
      fileSystem.updateFileContent(activeTab.fileItem.id, activeTab.content);
      setOpenTabs(prev =>
        prev.map(t => (t.id === activeTab.id ? { ...t, isDirty: false } : t))
      );
      addNotification('Visual Studio Code', `Saved ${activeTab.name}`, 'VS Code');
    } else {
      // Create new file in Documents
      const ext = activeTab.name.split('.').pop() || 'txt';
      const created = fileSystem.createItem(activeTab.name, 'file', 'documents', activeTab.content, ext);
      setOpenTabs(prev =>
        prev.map(t =>
          t.id === activeTab.id
            ? { ...t, id: created.id, fileItem: created, isDirty: false }
            : t
        )
      );
      setActiveTabId(created.id);
      addNotification('Visual Studio Code', `Created and saved ${activeTab.name} in Documents`, 'VS Code');
    }
  };

  const handleCreateNewFile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    const name = newFileName.trim() || 'script.py';
    const ext = name.split('.').pop()?.toLowerCase() || 'py';
    const newItem = fileSystem.createItem(name, 'file', 'documents', '', ext);
    const newTab: OpenTab = {
      id: newItem.id,
      name: newItem.name,
      extension: ext,
      content: '',
      isDirty: false,
      fileItem: newItem,
    };
    setOpenTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setIsNewFileModalOpen(false);
    addNotification('Visual Studio Code', `Created ${name} in Documents`, 'VS Code');
  };

  // Cursor tracking for status bar
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBefore = target.value.substring(0, target.selectionStart);
    const lines = textBefore.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1,
    });
  };

  // Quick Run / Simulation
  const handleRunCode = () => {
    soundManager.playClick();
    if (!activeTab) return;
    const ext = activeTab.extension;
    if (ext === 'py') {
      setRunOutput(`[Python 3.12.1 Interactive Terminal]\n$ python ${activeTab.name}\n>>> Dataset Statistics: {'mean': 63.83, 'std_dev': 38.62, 'count': 6, 'total': 383.0}\n[Process completed with exit code 0]`);
    } else if (ext === 'cpp' || ext === 'c') {
      setRunOutput(`[g++ / Clang++ Terminal]\n$ g++ ${activeTab.name} -o output.exe && ./output.exe\nWindows 11 C++ High Performance Engine\nExecution Time: 0.0014s | Exit code 0`);
    } else if (ext === 'ino') {
      setRunOutput(`[Arduino AVR Compiler & Serial Monitor (COM3 - 9600 baud)]\nCompiling sketch: ${activeTab.name}...\nSketch uses 1,428 bytes (4%) of program storage space.\nGlobal variables use 182 bytes (8%) of dynamic memory.\nUploading to I/O Board...\nDone uploading.\n[SERIAL]: Arduino Hardware Initialized.\n[SERIAL]: Sensor Value: 724 (LED: HIGH)`);
    } else if (ext === 'html' || ext === 'htm') {
      setRunOutput(`[Live Server Preview]\nServing ${activeTab.name} on http://127.0.0.1:5500\nGET / 200 OK (text/html)\nGET /styles.css 200 OK (text/css)\nGET /app.js 200 OK (application/javascript)`);
    } else if (ext === 'js') {
      setRunOutput(`[Node.js v20.11.0]\n$ node ${activeTab.name}\nStarting VS Code Demo v1.0.0\nDOM ready. System online.\n[Finished in 0.082s]`);
    } else {
      setRunOutput(`[Code Output: ${activeTab.name}]\nFile validated. Syntax check OK.`);
    }
  };

  // Language display name
  const getLanguageLabel = (ext: string) => {
    switch (ext) {
      case 'py':
        return 'Python';
      case 'cpp':
        return 'C++';
      case 'c':
        return 'C';
      case 'css':
        return 'CSS';
      case 'html':
      case 'htm':
        return 'HTML';
      case 'js':
        return 'JavaScript';
      case 'ino':
        return 'Arduino (.ino)';
      case 'json':
        return 'JSON';
      default:
        return ext.toUpperCase();
    }
  };

  // Tokenize & Syntax Highlight generator
  const highlightedCode = useMemo(() => {
    if (!activeTab) return null;
    const content = activeTab.content;
    const ext = activeTab.extension;

    // Split into lines
    const lines = content.split('\n');

    return lines.map((line, lineIdx) => {
      // 1. Python (.py)
      if (ext === 'py') {
        const parts = line.split(/(#.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:def|class|import|from|return|if|else|elif|for|while|in|try|except|with|as|lambda|pass|break|continue|None|True|False|is|not|and|or)\b|\b(?:print|len|sum|round|range|int|str|float|list|dict|set|max|min)\b|\b\d+(?:\.\d+)?\b)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('#')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('"') || token.startsWith("'")) return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                if (/^(def|class|import|from|return|if|else|elif|for|while|in|try|except|with|as|lambda|pass|break|continue|None|True|False|is|not|and|or)$/.test(token)) {
                  return <span key={tIdx} className="text-[#C586C0] font-semibold">{token}</span>;
                }
                if (/^(print|len|sum|round|range|int|str|float|list|dict|set|max|min)$/.test(token)) {
                  return <span key={tIdx} className="text-[#DCDCAA]">{token}</span>;
                }
                if (/^\d+(\.\d+)?$/.test(token)) return <span key={tIdx} className="text-[#B5CEA8]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // 2. C / C++ (.c, .cpp)
      if (ext === 'cpp' || ext === 'c') {
        const parts = line.split(/(\/\/.*|#include\s+<[^>]+>|#define\s+\w+|"(?:\\.|[^"\\])*"|\b(?:int|void|char|float|double|bool|long|size_t|auto|vector|string|class|struct)\b|\b(?:return|if|else|for|while|switch|case|break|public|private|namespace|using|std|new|delete)\b|\b(?:cout|cin|endl|swap|sort|partition)\b|\b\d+\b)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('//')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('#')) return <span key={tIdx} className="text-[#C586C0] font-semibold">{token}</span>;
                if (token.startsWith('"')) return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                if (/^(int|void|char|float|double|bool|long|size_t|auto|vector|string|class|struct)$/.test(token)) {
                  return <span key={tIdx} className="text-[#4EC9B0]">{token}</span>;
                }
                if (/^(return|if|else|for|while|switch|case|break|public|private|namespace|using|std|new|delete)$/.test(token)) {
                  return <span key={tIdx} className="text-[#569CD6] font-semibold">{token}</span>;
                }
                if (/^(cout|cin|endl|swap|sort|partition)$/.test(token)) {
                  return <span key={tIdx} className="text-[#DCDCAA]">{token}</span>;
                }
                if (/^\d+$/.test(token)) return <span key={tIdx} className="text-[#B5CEA8]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // 3. Arduino (.ino)
      if (ext === 'ino') {
        const parts = line.split(/(\/\/.*|#define\s+\w+|#include\s+<[^>]+>|"(?:\\.|[^"\\])*"|\b(?:setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|delayMicroseconds|millis)\b|\b(?:HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN)\b|\b(?:Serial|begin|print|println|available|read)\b|\b(?:void|int|long|boolean|byte|float)\b|\b\d+\b)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('//')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('#')) return <span key={tIdx} className="text-[#C586C0] font-semibold">{token}</span>;
                if (token.startsWith('"')) return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                if (/^(setup|loop|pinMode|digitalWrite|digitalRead|analogRead|analogWrite|delay|delayMicroseconds|millis)$/.test(token)) {
                  return <span key={tIdx} className="text-[#4EC9B0] font-semibold">{token}</span>;
                }
                if (/^(HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|LED_BUILTIN)$/.test(token)) {
                  return <span key={tIdx} className="text-[#4FC1FF] font-bold">{token}</span>;
                }
                if (/^(Serial|begin|print|println|available|read)$/.test(token)) {
                  return <span key={tIdx} className="text-[#DCDCAA]">{token}</span>;
                }
                if (/^(void|int|long|boolean|byte|float)$/.test(token)) {
                  return <span key={tIdx} className="text-[#569CD6]">{token}</span>;
                }
                if (/^\d+$/.test(token)) return <span key={tIdx} className="text-[#B5CEA8]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // 4. CSS (.css)
      if (ext === 'css') {
        const parts = line.split(/(\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|#[0-9a-fA-F]{3,8}|:[a-z-]+|\b(?:color|background|background-color|display|flex|flex-direction|margin|padding|border|border-radius|font-family|font-size|width|height|box-shadow|backdrop-filter)\b|\b\d+(?:px|rem|%|vh|vw|s|ms)?\b)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('/*')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('#')) return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                if (/^(color|background|background-color|display|flex|flex-direction|margin|padding|border|border-radius|font-family|font-size|width|height|box-shadow|backdrop-filter)$/.test(token)) {
                  return <span key={tIdx} className="text-[#9CDCFE]">{token}</span>;
                }
                if (/^\d+(?:px|rem|%|vh|vw|s|ms)?$/.test(token)) return <span key={tIdx} className="text-[#B5CEA8]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // 5. HTML (.html, .htm)
      if (ext === 'html' || ext === 'htm') {
        const parts = line.split(/(<!--[\s\S]*?-->|"(?:\\.|[^"\\])*"|<\/?[a-zA-Z0-9]+|\b(?:class|id|href|src|rel|style|type)=|>|\/>)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('<!--')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('<') || token === '>' || token === '/>') {
                  return <span key={tIdx} className="text-[#569CD6] font-semibold">{token}</span>;
                }
                if (token.startsWith('"')) return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                if (token.endsWith('=')) return <span key={tIdx} className="text-[#9CDCFE]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // 6. JavaScript (.js)
      if (ext === 'js') {
        const parts = line.split(/(\/\/.*|`[^`]*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:const|let|var|function|return|import|export|from|class|new|this|if|else|for|while|async|await|constructor)\b|\b(?:console|log|document|addEventListener|start)\b|\b\d+\b)/g);
        return (
          <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
            <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
              {lineIdx + 1}
            </span>
            <span className="table-cell font-mono text-xs whitespace-pre">
              {parts.map((token, tIdx) => {
                if (token.startsWith('//')) return <span key={tIdx} className="text-[#6A9955] italic">{token}</span>;
                if (token.startsWith('`') || token.startsWith('"') || token.startsWith("'")) {
                  return <span key={tIdx} className="text-[#CE9178]">{token}</span>;
                }
                if (/^(const|let|var|function|return|import|export|from|class|new|this|if|else|for|while|async|await|constructor)$/.test(token)) {
                  return <span key={tIdx} className="text-[#C586C0] font-semibold">{token}</span>;
                }
                if (/^(console|log|document|addEventListener|start)$/.test(token)) {
                  return <span key={tIdx} className="text-[#DCDCAA]">{token}</span>;
                }
                if (/^\d+$/.test(token)) return <span key={tIdx} className="text-[#B5CEA8]">{token}</span>;
                return <span key={tIdx} className="text-[#D4D4D4]">{token}</span>;
              })}
            </span>
          </div>
        );
      }

      // Default generic code
      return (
        <div key={lineIdx} className="table-row leading-5 hover:bg-[#2a2d2e]/40">
          <span className="table-cell pr-4 text-right text-[#858585] select-none text-xs font-mono w-10">
            {lineIdx + 1}
          </span>
          <span className="table-cell font-mono text-xs whitespace-pre text-[#D4D4D4]">
            {line}
          </span>
        </div>
      );
    });
  }, [activeTab]);

  const allDiskFiles = fileSystem.getAllItems().filter(i => i.type === 'file');

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] text-[#cccccc] font-sans select-none overflow-hidden text-xs">
      {/* Top VS Code Window Menu Bar */}
      <div className="h-8 px-2 bg-[#323233] border-b border-[#252526] flex items-center justify-between text-[11px] text-[#cccccc] select-none shrink-0">
        <div className="flex items-center gap-1">
          <div className="px-2 py-1 text-sky-400 font-bold flex items-center gap-1.5">
            <WinIcon name="vscode" size={16} />
            <span className="text-white font-semibold">Visual Studio Code</span>
          </div>
          <button
            onClick={() => setIsChooseFileOpen(true)}
            className="px-2.5 py-1 rounded hover:bg-[#3c3c3d] text-[#cccccc] hover:text-white transition-colors"
          >
            File
          </button>
          <button
            onClick={() => setIsNewFileModalOpen(true)}
            className="px-2.5 py-1 rounded hover:bg-[#3c3c3d] text-[#cccccc] hover:text-white transition-colors"
          >
            New File
          </button>
          <button
            onClick={handleSaveCurrentFile}
            className="px-2.5 py-1 rounded hover:bg-[#3c3c3d] text-[#cccccc] hover:text-white transition-colors font-semibold text-sky-400"
          >
            Save (Ctrl+S)</button><button onClick={handleSaveToPC} className="px-2.5 py-1 rounded hover:bg-[#3c3c3d] text-[#cccccc] hover:text-white transition-colors font-semibold text-emerald-400">Save to PC
          </button>
          <button
            onClick={handleRunCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white transition-colors font-medium ml-2"
          >
            <WinIcon name="play-circle" size={12} />
            <span>Run Code</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          <span className="text-[11px] text-[#858585] font-mono">
            {activeTab?.name} — Windows 11 Workspace
          </span>
        </div>
      </div>

      {/* Main App Work Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Leftmost Activity Bar */}
        <div className="w-12 bg-[#333333] flex flex-col justify-between items-center py-2 shrink-0 border-r border-[#252526]">
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => {
                setActiveSidebarView('explorer');
                setSidebarOpen(true);
              }}
              title="Explorer"
              className={`p-2 w-full flex justify-center border-l-2 transition-colors ${
                sidebarOpen && activeSidebarView === 'explorer'
                  ? 'border-white text-white'
                  : 'border-transparent text-[#858585] hover:text-white'
              }`}
            >
              <WinIcon name="folder" size={20} />
            </button>
            <button
              onClick={() => {
                setActiveSidebarView('search');
                setSidebarOpen(true);
              }}
              title="Search"
              className={`p-2 w-full flex justify-center border-l-2 transition-colors ${
                sidebarOpen && activeSidebarView === 'search'
                  ? 'border-white text-white'
                  : 'border-transparent text-[#858585] hover:text-white'
              }`}
            >
              <WinIcon name="search" size={20} />
            </button>
            <button
              onClick={() => setIsChooseFileOpen(true)}
              title="Choose File to Open"
              className="p-2 w-full flex justify-center text-[#858585] hover:text-white transition-colors"
            >
              <WinIcon name="file" size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Primary Sidebar"
              className="p-2 text-[#858585] hover:text-white"
            >
              <WinIcon name="layout-grid" size={18} />
            </button>
            <button title="Settings" className="p-2 text-[#858585] hover:text-white">
              <WinIcon name="settings" size={18} />
            </button>
          </div>
        </div>

        {/* Primary Sidebar */}
        {sidebarOpen && (
          <div className="w-56 bg-[#252526] border-r border-[#1e1e1e] flex flex-col shrink-0 text-xs">
            <div className="h-9 px-3 flex items-center justify-between font-bold text-[11px] text-[#bbbbbb] tracking-wider uppercase border-b border-[#1e1e1e]">
              <span>Explorer: Workspace</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsNewFileModalOpen(true)}
                  title="New File"
                  className="p-1 rounded hover:bg-[#3c3c3d]"
                >
                  <WinIcon name="plus" size={13} />
                </button>
                <button
                  onClick={() => setIsChooseFileOpen(true)}
                  title="Choose File"
                  className="p-1 rounded hover:bg-[#3c3c3d]"
                >
                  <WinIcon name="folder" size={13} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <div className="text-[10px] uppercase font-bold text-[#6f6f6f] px-2 py-1">
                Open Editors
              </div>
              {openTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-left transition-colors ${
                    activeTabId === tab.id ? 'bg-[#37373d] text-white' : 'hover:bg-[#2a2d2e] text-[#cccccc]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <WinIcon name={tab.extension} size={14} />
                    <span className="truncate">{tab.name}</span>
                  </div>
                  {tab.isDirty && <span className="w-2 h-2 rounded-full bg-white ml-1 shrink-0" />}
                </button>
              ))}

              <div className="text-[10px] uppercase font-bold text-[#6f6f6f] px-2 pt-4 pb-1">
                Workspace Files
              </div>
              {allDiskFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-[#2a2d2e] text-left text-[#cccccc] hover:text-white transition-colors"
                >
                  <WinIcon name={file.extension || 'file'} size={14} />
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-[#1e1e1e]">
              <button
                onClick={() => setIsChooseFileOpen(true)}
                className="w-full py-1.5 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white font-medium text-xs text-center transition-colors shadow"
              >
                Choose File...
              </button>
            </div>
          </div>
        )}

        {/* Main Editor Center */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* File Tabs Bar */}
          <div className="h-9 bg-[#252526] flex items-center overflow-x-auto border-b border-[#1e1e1e] select-none">
            {openTabs.map(tab => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  className={`group flex items-center gap-2 px-3 py-2 border-r border-[#1e1e1e] cursor-pointer text-xs font-mono transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white border-t-2 border-t-[#0078d4]'
                      : 'bg-[#2d2d2d] text-[#969696] hover:bg-[#2a2d2e]'
                  }`}
                >
                  <WinIcon name={tab.extension} size={14} />
                  <span>{tab.name}</span>
                  {tab.isDirty ? (
                    <span className="w-2 h-2 rounded-full bg-white ml-1" />
                  ) : (
                    <button
                      onClick={e => handleCloseTab(tab.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:bg-[#3c3c3d] rounded p-0.5"
                    >
                      <WinIcon name="close" size={10} />
                    </button>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setIsChooseFileOpen(true)}
              title="Open File Dialog"
              className="px-2 py-1 mx-2 rounded hover:bg-[#333333] text-[#858585] hover:text-white"
            >
              <WinIcon name="plus" size={14} />
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="h-6 px-4 bg-[#1e1e1e] flex items-center gap-2 text-[11px] text-[#858585] border-b border-[#252526] select-none">
            <span>workspace</span>
            <span>&gt;</span>
            <span className="text-[#cccccc]">{activeTab?.name}</span>
          </div>

          {/* Code Editor Body */}
          <div className="flex-1 relative overflow-auto bg-[#1e1e1e] p-2 flex">
            {/* Syntax Highlighted Line Rendering */}
            <div className="flex-1 table w-full pointer-events-none select-none z-0">
              {highlightedCode}
            </div>

            {/* Transparent Real Textarea for Interactive Typing and Editing */}
            <textarea
              ref={textareaRef}
              value={activeTab?.content || ''}
              onChange={e => handleContentChange(e.target.value)}
              onSelect={handleSelect}
              onKeyUp={handleSelect}
              onClick={handleSelect}
              spellCheck={false}
              autoCapitalize="none"
              autoComplete="off"
              className="absolute inset-0 w-full h-full p-2 pl-14 font-mono text-xs leading-5 bg-transparent text-transparent caret-white outline-none resize-none z-10 selection:bg-[#264f78]/60 cursor-text overflow-auto"
            />
          </div>

          {/* Terminal / Output Panel */}
          {runOutput && (
            <div className="h-36 bg-[#181818] border-t border-[#252526] flex flex-col shrink-0">
              <div className="h-7 px-3 bg-[#252526] flex items-center justify-between text-[11px] font-semibold text-[#cccccc]">
                <span>TERMINAL / RUN OUTPUT</span>
                <button
                  onClick={() => setRunOutput(null)}
                  className="hover:text-white"
                >
                  <WinIcon name="close" size={12} />
                </button>
              </div>
              <pre className="flex-1 p-3 font-mono text-xs text-[#4EC9B0] overflow-y-auto whitespace-pre-wrap select-text">
                {runOutput}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-6 px-3 bg-[#007acc] text-white flex items-center justify-between text-[11px] select-none shrink-0 font-sans">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <WinIcon name="refresh" size={11} />
            <span>main*</span>
          </div>
          <span>0 errors, 0 warnings</span>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>
            Ln {cursorPos.line}, Col {cursorPos.col}
          </span>
          <span>Spaces: 4</span>
          <span>UTF-8</span>
          <span>LF</span>
          <span className="font-sans font-semibold bg-white/20 px-2 py-0.5 rounded">
            {activeTab ? getLanguageLabel(activeTab.extension) : 'Plain Text'}
          </span>
        </div>
      </div>

      {/* "Choose File to Open" Popup Window Modal */}
      {isChooseFileOpen && (
        <div
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-[3px] animate-win11-open"
          onClick={() => setIsChooseFileOpen(false)}
        >
          <div
            className="w-[520px] p-5 rounded-xl bg-[#252526] border border-[#3c3c3d] text-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#3c3c3d] pb-2">
              <div className="flex items-center gap-2">
                <WinIcon name="vscode" size={20} />
                <h3 className="font-bold text-sm">Choose File to Open in VS Code</h3>
              </div>
              <button
                onClick={() => setIsChooseFileOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#3c3c3d]"
              >
                <WinIcon name="close" size={14} />
              </button>
            </div>

            <p className="text-xs text-[#969696] mb-3">
              Select any file from your virtual computer disk (.py, .cpp, .c, .css, .html, .js, .ino, etc.):
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1 mb-4 pr-1">
              <button onClick={handleOpenFromPC} className="w-full mb-3 flex items-center justify-center gap-2 px-3 py-2 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs font-medium"><WinIcon name="folder" size={14} />Open file from this PC…</button>
              {allDiskFiles.map(file => (
                <button
                  key={file.id}
                  onClick={() => handleOpenFile(file)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-[#094771] border border-transparent hover:border-[#007acc] text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded bg-[#1e1e1e] flex items-center justify-center">
                      <WinIcon name={file.extension || 'file'} size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-semibold text-white truncate">
                        {file.name}
                      </span>
                      <span className="text-[10px] text-[#858585] uppercase">
                        Path: {file.parentId} • {file.size} bytes • {file.updatedAt || 'Recent'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-sky-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Open in Editor →
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3c3c3d]">
              <button
                onClick={() => setIsChooseFileOpen(false)}
                className="px-4 py-1.5 rounded hover:bg-[#3c3c3d] text-xs font-medium text-[#cccccc]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New File Modal */}
      {isNewFileModalOpen && (
        <div
          className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/60 backdrop-blur-[3px] animate-win11-open"
          onClick={() => setIsNewFileModalOpen(false)}
        >
          <form
            onSubmit={handleCreateNewFile}
            className="w-[420px] p-5 rounded-xl bg-[#252526] border border-[#3c3c3d] text-white shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-[#3c3c3d] pb-2">
              <div className="flex items-center gap-2">
                <WinIcon name="vscode" size={20} />
                <h3 className="font-bold text-sm">New File in Workspace</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFileModalOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-[#3c3c3d]"
              >
                <WinIcon name="close" size={14} />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-xs text-[#969696] mb-1">
                File Name with extension (.py, .cpp, .c, .css, .html, .js, .ino):
              </label>
              <input
                type="text"
                required
                autoFocus
                value={newFileName}
                onChange={e => setNewFileName(e.target.value)}
                placeholder="e.g. script.py, main.cpp, hardware.ino"
                className="w-full px-3 py-2 rounded bg-[#3c3c3d] border border-[#555555] text-white text-xs outline-none focus:border-[#007acc] font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#3c3c3d]">
              <button
                type="button"
                onClick={() => setIsNewFileModalOpen(false)}
                className="px-4 py-1.5 rounded hover:bg-[#3c3c3d] text-xs font-medium text-[#cccccc]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#0e639c] hover:bg-[#1177bb] text-white text-xs font-semibold"
              >
                Create File
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
