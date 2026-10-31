import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { soundManager } from '../../services/soundEffects';
import { WinIcon } from '../common/WinIcon';
import { FileSystemItem } from '../../types/os';

interface ExcelProps {
  payload?: {
    fileId?: string;
    fileName?: string;
    content?: string;
  };
}

const DEFAULT_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const TEMPLATES: Record<string, string[][]> = {
  budget: [
    ['Department', 'Q1 Target', 'Q1 Actual', 'Variance'],
    ['Engineering', '150000', '142000', '=B2-C2'],
    ['Design', '45000', '43200', '=B3-C3'],
    ['Marketing', '80000', '86400', '=B4-C4'],
    ['Operations', '35000', '31000', '=B5-C5'],
    ['Total', '=SUM(B2:B5)', '=SUM(C2:C5)', '=SUM(D2:D5)'],
  ],
  invoice: [
    ['Description', 'Hours', 'Rate ($)', 'Amount ($)'],
    ['Frontend Architecture', '40', '125', '=B2*C2'],
    ['UI/UX Design Systems', '25', '95', '=B3*C3'],
    ['QA & System Hardening', '15', '85', '=B4*C4'],
    ['Deployment & CI/CD', '10', '110', '=B5*C5'],
    ['Subtotal', '', '', '=SUM(D2:D5)'],
    ['Tax (10%)', '', '', '=D6*0.1'],
    ['Total Due', '', '', '=D6+D7'],
  ],
  blank: [
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
  ],
};

function padGrid(data: string[][], minRows = 20, minCols = 10): string[][] {
  const result = data.map(row => {
    const copy = [...row];
    while (copy.length < minCols) copy.push('');
    return copy;
  });
  while (result.length < minRows) {
    result.push(Array(minCols).fill(''));
  }
  return result;
}

export const ExcelSheetApp: React.FC<ExcelProps> = ({ payload }) => {
  const { addNotification } = useOS();

  const [fileName, setFileName] = useState<string>(payload?.fileName || 'Quarterly Budget.xlsx');
  const [fileId, setFileId] = useState<string | null>(payload?.fileId || null);

  const [grid, setGrid] = useState<string[][]>(() => {
    if (payload?.content) {
      try {
        const parsed = JSON.parse(payload.content);
        if (Array.isArray(parsed) && parsed.length > 0) return padGrid(parsed);
      } catch {}
    }
    return padGrid(TEMPLATES.budget);
  });

  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'formulas'>('home');
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // File Modal States
  const [isOpenModalVisible, setIsOpenModalVisible] = useState<boolean>(false);
  const [isSaveAsModalVisible, setIsSaveAsModalVisible] = useState<boolean>(false);
  const [saveAsName, setSaveAsName] = useState<string>('My Spreadsheet.xlsx');
  const [saveAsFolder, setSaveAsFolder] = useState<string>('desktop');
  const [availableFiles, setAvailableFiles] = useState<FileSystemItem[]>([]);

  // Text formatting
  const [isBold, setIsBold] = useState<boolean>(false);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('left');

  const cellInputRef = useRef<HTMLInputElement>(null);

  // If payload changes externally (e.g. user opens another file from explorer)
  useEffect(() => {
    if (payload) {
      if (payload.fileName) setFileName(payload.fileName);
      if (payload.fileId) setFileId(payload.fileId);
      if (payload.content) {
        try {
          const parsed = JSON.parse(payload.content);
          if (Array.isArray(parsed)) setGrid(padGrid(parsed));
        } catch {}
      }
    }
  }, [payload]);

  // Sync formula input bar when selected cell changes
  useEffect(() => {
    const raw = grid[selectedCell.r]?.[selectedCell.c] || '';
    setFormulaInput(raw);
  }, [selectedCell, grid]);

  // Evaluate cell expression (SUM, AVERAGE, MIN, MAX, COUNT, arithmetic)
  const evaluateCell = useCallback(
    (val: string, r: number, c: number, depth = 0): string => {
      if (!val || typeof val !== 'string' || !val.startsWith('=')) return val;
      if (depth > 10) return '#CIRCULAR!';

      try {
        const expression = val.substring(1).trim().toUpperCase();

        // Helper for range resolution (e.g. "B2:B5")
        const resolveRangeValues = (rangeStr: string): number[] => {
          const [start, end] = rangeStr.split(':');
          if (!start || !end) return [];
          const startCol = start.charCodeAt(0) - 65;
          const startRow = parseInt(start.substring(1)) - 1;
          const endCol = end.charCodeAt(0) - 65;
          const endRow = parseInt(end.substring(1)) - 1;

          const values: number[] = [];
          for (let row = Math.min(startRow, endRow); row <= Math.max(startRow, endRow); row++) {
            for (let col = Math.min(startCol, endCol); col <= Math.max(startCol, endCol); col++) {
              const cellRaw = grid[row]?.[col] || '0';
              const evaluated = evaluateCell(cellRaw, row, col, depth + 1);
              const num = parseFloat(evaluated);
              if (!isNaN(num)) values.push(num);
            }
          }
          return values;
        };

        // SUM
        if (expression.startsWith('SUM(') && expression.endsWith(')')) {
          const range = expression.slice(4, -1);
          const vals = resolveRangeValues(range);
          const sum = vals.reduce((a, b) => a + b, 0);
          return sum.toLocaleString();
        }

        // AVERAGE
        if (expression.startsWith('AVERAGE(') && expression.endsWith(')')) {
          const range = expression.slice(8, -1);
          const vals = resolveRangeValues(range);
          if (vals.length === 0) return '0';
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          return avg.toFixed(1);
        }

        // MIN
        if (expression.startsWith('MIN(') && expression.endsWith(')')) {
          const range = expression.slice(4, -1);
          const vals = resolveRangeValues(range);
          return (vals.length > 0 ? Math.min(...vals) : 0).toString();
        }

        // MAX
        if (expression.startsWith('MAX(') && expression.endsWith(')')) {
          const range = expression.slice(4, -1);
          const vals = resolveRangeValues(range);
          return (vals.length > 0 ? Math.max(...vals) : 0).toString();
        }

        // COUNT
        if (expression.startsWith('COUNT(') && expression.endsWith(')')) {
          const range = expression.slice(6, -1);
          const vals = resolveRangeValues(range);
          return vals.length.toString();
        }

        // Resolve cell coordinates like B2, C3, A10 to numeric values
        const resolved = expression.replace(/([A-Z])([0-9]+)/g, (_, colLetter, rowNum) => {
          const colIdx = colLetter.charCodeAt(0) - 65;
          const rowIdx = parseInt(rowNum) - 1;
          const cellRaw = grid[rowIdx]?.[colIdx] || '0';
          const evalRaw = evaluateCell(cellRaw, rowIdx, colIdx, depth + 1);
          const cleanNum = evalRaw.replace(/[^0-9.-]/g, '');
          return cleanNum || '0';
        });

        // Evaluate standard arithmetic (+ - * /) safely
        if (/^[\d.\s+\-*/()]+$/.test(resolved)) {
          // eslint-disable-next-line no-eval
          const result = Function(`"use strict"; return (${resolved})`)();
          if (typeof result === 'number' && !isNaN(result)) {
            return Number.isInteger(result) ? result.toString() : result.toFixed(2);
          }
        }

        return '#VALUE!';
      } catch {
        return '#ERROR!';
      }
    },
    [grid]
  );

  const handleCellChange = (r: number, c: number, val: string) => {
    setIsSaved(false);
    setGrid(prev => {
      const next = prev.map((row, rowIdx) =>
        rowIdx === r ? row.map((cell, colIdx) => (colIdx === c ? val : cell)) : [...row]
      );
      return next;
    });
  };

  // Direct save to current file
  const handleSave = () => {
    soundManager.playClick();
    const dataStr = JSON.stringify(grid);
    if (fileId) {
      fileSystem.updateFileContent(fileId, dataStr);
      setIsSaved(true);
      addNotification('Excel', `Saved changes to ${fileName}`, 'Excel');
    } else {
      setIsSaveAsModalVisible(true);
    }
  };

  // Save As commit
  const handleSaveAsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundManager.playClick();
    let name = saveAsName.trim();
    if (!name.endsWith('.xlsx')) name += '.xlsx';

    const dataStr = JSON.stringify(grid);
    const newItem = fileSystem.createItem(name, 'file', saveAsFolder, dataStr, 'xlsx');
    setFileId(newItem.id);
    setFileName(name);
    setIsSaved(true);
    setIsSaveAsModalVisible(false);
    addNotification('Excel', `Created and saved "${name}"`, 'Excel');
  };

  // Open modal loader
  const handleOpenClick = () => {
    soundManager.playClick();
    const all = fileSystem.getAllItems();
    const sheets = all.filter(
      item => item.type === 'file' && (item.extension === 'xlsx' || item.extension === 'csv' || item.name.endsWith('.xlsx'))
    );
    setAvailableFiles(sheets);
    setIsOpenModalVisible(true);
  };

  const handleLoadFile = (item: FileSystemItem) => {
    soundManager.playClick();
    try {
      if (item.content) {
        const parsed = JSON.parse(item.content);
        if (Array.isArray(parsed)) {
          setGrid(padGrid(parsed));
        } else {
          setGrid(padGrid(TEMPLATES.blank));
        }
      } else {
        setGrid(padGrid(TEMPLATES.blank));
      }
    } catch {
      // In case it's plain CSV text
      if (item.content) {
        const rows = item.content.split('\n').map(r => r.split(','));
        setGrid(padGrid(rows));
      } else {
        setGrid(padGrid(TEMPLATES.blank));
      }
    }
    setFileId(item.id);
    setFileName(item.name);
    setIsSaved(true);
    setIsOpenModalVisible(false);
    addNotification('Excel', `Opened "${item.name}"`, 'Excel');
  };

  // Grid editing operations
  const insertRow = () => {
    const newRow = Array(grid[0]?.length || 10).fill('');
    const next = [...grid];
    next.splice(selectedCell.r + 1, 0, newRow);
    setGrid(next);
    setIsSaved(false);
  };

  const deleteRow = () => {
    if (grid.length <= 1) return;
    const next = grid.filter((_, idx) => idx !== selectedCell.r);
    setGrid(next);
    setIsSaved(false);
  };

  const insertCol = () => {
    const next = grid.map(row => {
      const copy = [...row];
      copy.splice(selectedCell.c + 1, 0, '');
      return copy;
    });
    setGrid(next);
    setIsSaved(false);
  };

  const deleteCol = () => {
    if (grid[0]?.length <= 1) return;
    const next = grid.map(row => row.filter((_, idx) => idx !== selectedCell.c));
    setGrid(next);
    setIsSaved(false);
  };

  const clearSheet = () => {
    setGrid(padGrid(TEMPLATES.blank));
    setIsSaved(false);
  };

  const loadTemplate = (name: 'budget' | 'invoice') => {
    setGrid(padGrid(TEMPLATES[name]));
    setFileName(name === 'budget' ? 'Quarterly Budget.xlsx' : 'Invoice Template.xlsx');
    setFileId(null);
    setIsSaved(false);
  };

  // Export to CSV download simulation
  const exportCsv = () => {
    soundManager.playClick();
    const csvContent = grid
      .map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName.replace('.xlsx', '.csv'));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification('Excel', `Exported ${fileName} to CSV`, 'Excel');
  };

  const selectedColLetter = DEFAULT_COLS[selectedCell.c] || `C${selectedCell.c + 1}`;
  const cellCoord = `${selectedColLetter}${selectedCell.r + 1}`;

  // Quick stats calculation for status bar
  const stats = useMemo(() => {
    const curVal = grid[selectedCell.r]?.[selectedCell.c] || '';
    const evaluated = evaluateCell(curVal, selectedCell.r, selectedCell.c);
    const num = parseFloat(evaluated);
    return {
      hasNum: !isNaN(num),
      value: evaluated,
    };
  }, [grid, selectedCell, evaluateCell]);

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none overflow-hidden font-sans">
      {/* Top Office Title Bar */}
      <div className="h-10 px-3 bg-[#107c41] text-white flex items-center justify-between shadow-sm select-none">
        <div className="flex items-center gap-3">
          <WinIcon name="excel" size={20} className="drop-shadow-sm" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-tight">{fileName}</span>
            <span className="text-[10px] text-emerald-200 bg-emerald-800/60 px-1.5 py-0.5 rounded">
              {isSaved ? 'Saved' : 'Edited'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSave}
            title="Save (Ctrl+S)"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
          >
            <WinIcon name="save" size={13} />
            <span>Save</span>
          </button>
          <button
            onClick={handleOpenClick}
            title="Open File"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
          >
            <WinIcon name="folder" size={13} />
            <span>Open</span>
          </button>
          <button
            onClick={() => setIsSaveAsModalVisible(true)}
            title="Save As"
            className="px-2 py-1 rounded hover:bg-emerald-600/70 text-white text-xs transition-colors"
          >
            Save As
          </button>
        </div>
      </div>

      {/* Office Ribbon Navigation Tabs */}
      <div className="bg-[#f3f3f3] dark:bg-[#252525] border-b border-neutral-300 dark:border-neutral-700">
        <div className="flex items-center gap-1 px-2 pt-1 border-b border-neutral-200 dark:border-neutral-800 text-xs">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-3 py-1 font-medium rounded-t transition-colors ${
              activeTab === 'home'
                ? 'bg-white dark:bg-[#1e1e1e] text-[#107c41] dark:text-emerald-400 border-t-2 border-[#107c41] font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('insert')}
            className={`px-3 py-1 font-medium rounded-t transition-colors ${
              activeTab === 'insert'
                ? 'bg-white dark:bg-[#1e1e1e] text-[#107c41] dark:text-emerald-400 border-t-2 border-[#107c41] font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`px-3 py-1 font-medium rounded-t transition-colors ${
              activeTab === 'formulas'
                ? 'bg-white dark:bg-[#1e1e1e] text-[#107c41] dark:text-emerald-400 border-t-2 border-[#107c41] font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            Formulas
          </button>
        </div>

        {/* Ribbon Tools Shelf */}
        <div className="h-14 px-3 flex items-center gap-4 bg-white dark:bg-[#1e1e1e] text-xs overflow-x-auto">
          {activeTab === 'home' && (
            <>
              {/* File / Template quick actions */}
              <div className="flex items-center gap-1 pr-3 border-r border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => loadTemplate('budget')}
                  className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[10px]"
                >
                  <WinIcon name="table" size={14} className="text-emerald-600 mb-0.5" />
                  <span>Budget</span>
                </button>
                <button
                  onClick={() => loadTemplate('invoice')}
                  className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[10px]"
                >
                  <WinIcon name="file-text" size={14} className="text-blue-600 mb-0.5" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={clearSheet}
                  className="flex flex-col items-center px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[10px] text-red-500"
                >
                  <WinIcon name="trash-2" size={14} className="mb-0.5" />
                  <span>Clear</span>
                </button>
              </div>

              {/* Formatting */}
              <div className="flex items-center gap-1 pr-3 border-r border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setIsBold(!isBold)}
                  className={`w-7 h-7 rounded flex items-center justify-center font-bold font-serif ${
                    isBold ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => setIsItalic(!isItalic)}
                  className={`w-7 h-7 rounded flex items-center justify-center italic font-serif ${
                    isItalic ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  title="Italic"
                >
                  I
                </button>
              </div>

              {/* Alignment */}
              <div className="flex items-center gap-1 pr-3 border-r border-neutral-200 dark:border-neutral-800">
                <button
                  onClick={() => setTextAlign('left')}
                  className={`px-2 py-1 text-[11px] rounded ${textAlign === 'left' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  Left
                </button>
                <button
                  onClick={() => setTextAlign('center')}
                  className={`px-2 py-1 text-[11px] rounded ${textAlign === 'center' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  Center
                </button>
                <button
                  onClick={() => setTextAlign('right')}
                  className={`px-2 py-1 text-[11px] rounded ${textAlign === 'right' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
                >
                  Right
                </button>
              </div>

              {/* Quick Number Formats */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    const current = grid[selectedCell.r]?.[selectedCell.c] || '';
                    if (current && !current.startsWith('$')) {
                      handleCellChange(selectedCell.r, selectedCell.c, `$${current}`);
                    }
                  }}
                  className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono text-xs font-bold text-emerald-600"
                  title="Format as Currency"
                >
                  $
                </button>
                <button
                  onClick={() => {
                    const current = grid[selectedCell.r]?.[selectedCell.c] || '';
                    if (current && !current.endsWith('%')) {
                      handleCellChange(selectedCell.r, selectedCell.c, `${current}%`);
                    }
                  }}
                  className="px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 font-mono text-xs font-bold"
                  title="Percent Style"
                >
                  %
                </button>
                <button
                  onClick={exportCsv}
                  className="flex items-center gap-1 px-2.5 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px] text-neutral-600 dark:text-neutral-300 ml-2"
                >
                  <WinIcon name="download" size={13} />
                  <span>CSV</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'insert' && (
            <div className="flex items-center gap-2">
              <button
                onClick={insertRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                <WinIcon name="plus" size={13} className="text-emerald-600" />
                <span>Insert Row</span>
              </button>
              <button
                onClick={insertCol}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                <WinIcon name="plus" size={13} className="text-emerald-600" />
                <span>Insert Column</span>
              </button>
              <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800" />
              <button
                onClick={deleteRow}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-red-600"
              >
                <WinIcon name="trash-2" size={13} />
                <span>Delete Row</span>
              </button>
              <button
                onClick={deleteCol}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs text-red-600"
              >
                <WinIcon name="trash-2" size={13} />
                <span>Delete Column</span>
              </button>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const formula = `=SUM(A1:${selectedColLetter}${selectedCell.r})`;
                  handleCellChange(selectedCell.r, selectedCell.c, formula);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs border border-emerald-300 dark:border-emerald-800"
              >
                <span>∑ AutoSum</span>
              </button>
              <button
                onClick={() => {
                  const formula = `=AVERAGE(A1:${selectedColLetter}${selectedCell.r})`;
                  handleCellChange(selectedCell.r, selectedCell.c, formula);
                }}
                className="px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Average
              </button>
              <button
                onClick={() => {
                  const formula = `=MAX(A1:${selectedColLetter}${selectedCell.r})`;
                  handleCellChange(selectedCell.r, selectedCell.c, formula);
                }}
                className="px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Max
              </button>
              <button
                onClick={() => {
                  const formula = `=MIN(A1:${selectedColLetter}${selectedCell.r})`;
                  handleCellChange(selectedCell.r, selectedCell.c, formula);
                }}
                className="px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Min
              </button>
              <button
                onClick={() => {
                  const formula = `=COUNT(A1:${selectedColLetter}${selectedCell.r})`;
                  handleCellChange(selectedCell.r, selectedCell.c, formula);
                }}
                className="px-2.5 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Count
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Formula Bar */}
      <div className="h-9 px-3 flex items-center gap-2 border-b border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#202020] text-xs">
        <div className="w-14 font-mono font-bold text-center py-1 bg-neutral-100 dark:bg-[#2b2b2b] rounded border border-neutral-300 dark:border-neutral-700 text-slate-800 dark:text-slate-200">
          {cellCoord}
        </div>
        <span className="font-serif italic font-bold text-neutral-400">fx</span>
        <input
          type="text"
          value={formulaInput}
          placeholder="Enter a value or formula (e.g. =SUM(B2:B5) or =B2-C2)"
          onChange={e => {
            setFormulaInput(e.target.value);
            handleCellChange(selectedCell.r, selectedCell.c, e.target.value);
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              setSelectedCell(prev => ({ ...prev, r: Math.min(grid.length - 1, prev.r + 1) }));
            }
          }}
          className="flex-1 bg-transparent outline-none font-mono text-slate-800 dark:text-slate-100 text-xs"
        />
      </div>

      {/* Spreadsheet Grid */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#1a1a1a]">
        <table className="w-full border-collapse text-xs table-fixed">
          <thead>
            <tr className="bg-neutral-100 dark:bg-[#262626] border-b border-neutral-300 dark:border-neutral-700 sticky top-0 z-20">
              <th className="w-10 p-1 text-center font-mono font-semibold text-[11px] text-neutral-400 border-r border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-[#262626]">
                #
              </th>
              {grid[0]?.map((_, colIdx) => {
                const letter = DEFAULT_COLS[colIdx] || `C${colIdx + 1}`;
                const isCurrentCol = selectedCell.c === colIdx;
                return (
                  <th
                    key={colIdx}
                    className={`min-w-28 p-1.5 text-center font-mono text-xs font-semibold border-r border-neutral-300 dark:border-neutral-700 ${
                      isCurrentCol
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'text-neutral-600 dark:text-neutral-300'
                    }`}
                  >
                    {letter}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grid.map((row, rIdx) => {
              const isCurrentRow = selectedCell.r === rIdx;
              return (
                <tr key={rIdx} className="border-b border-neutral-200 dark:border-neutral-800">
                  <td
                    className={`w-10 p-1 text-center font-mono text-[11px] font-semibold border-r border-neutral-300 dark:border-neutral-700 sticky left-0 z-10 ${
                      isCurrentRow
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-neutral-50 dark:bg-[#222222] text-neutral-400'
                    }`}
                  >
                    {rIdx + 1}
                  </td>
                  {row.map((_, cIdx) => {
                    const rawVal = row[cIdx] || '';
                    const displayVal = evaluateCell(rawVal, rIdx, cIdx);
                    const isSelected = selectedCell.r === rIdx && selectedCell.c === cIdx;

                    return (
                      <td
                        key={cIdx}
                        onClick={() => {
                          setSelectedCell({ r: rIdx, c: cIdx });
                          setFormulaInput(rawVal);
                        }}
                        onDoubleClick={() => {
                          setSelectedCell({ r: rIdx, c: cIdx });
                          setIsEditing(true);
                        }}
                        className={`p-1 border-r border-neutral-200 dark:border-neutral-800 font-mono tabular-nums text-xs cursor-cell transition-colors relative ${
                          isSelected
                            ? 'ring-2 ring-emerald-600 bg-emerald-500/10 z-10'
                            : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
                        }`}
                      >
                        <input
                          ref={isSelected ? cellInputRef : null}
                          type="text"
                          value={isSelected && isEditing ? rawVal : displayVal}
                          style={{
                            fontWeight: isBold ? 'bold' : 'normal',
                            fontStyle: isItalic ? 'italic' : 'normal',
                            textAlign: textAlign,
                          }}
                          onFocus={() => {
                            setSelectedCell({ r: rIdx, c: cIdx });
                            setIsEditing(true);
                          }}
                          onBlur={() => {
                            setIsEditing(false);
                          }}
                          onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              setIsEditing(false);
                              setSelectedCell(prev => ({
                                ...prev,
                                r: Math.min(grid.length - 1, prev.r + 1),
                              }));
                            } else if (e.key === 'Tab') {
                              e.preventDefault();
                              setIsEditing(false);
                              setSelectedCell(prev => ({
                                ...prev,
                                c: Math.min(grid[0].length - 1, prev.c + 1),
                              }));
                            } else if (e.key === 'Escape') {
                              setIsEditing(false);
                            }
                          }}
                          className="w-full bg-transparent outline-none font-mono text-slate-800 dark:text-slate-100 text-xs px-1"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Status Bar */}
      <div className="h-7 px-3 flex items-center justify-between bg-neutral-200/80 dark:bg-[#1a1a1a] border-t border-neutral-300 dark:border-neutral-700 text-[11px] text-neutral-600 dark:text-neutral-400 select-none">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">Ready</span>
          <div className="flex items-center gap-1 bg-white dark:bg-[#282828] px-2 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-slate-700 dark:text-slate-200 font-medium">
            <span>Sheet1</span>
          </div>
        </div>

        <div className="flex items-center gap-4 font-mono text-[11px]">
          {stats.hasNum && (
            <span>
              Value: <strong className="text-slate-800 dark:text-white">{stats.value}</strong>
            </span>
          )}
          <span>Rows: {grid.length}</span>
          <span>Cols: {grid[0]?.length || 0}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Open Spreadsheet File Picker Modal */}
      {isOpenModalVisible && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-win11-open"
          onClick={() => setIsOpenModalVisible(false)}
        >
          <div
            className="w-[460px] p-5 rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <WinIcon name="excel" size={20} />
                <h3 className="font-bold text-sm">Open Spreadsheet</h3>
              </div>
              <button
                onClick={() => setIsOpenModalVisible(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <WinIcon name="x" size={14} />
              </button>
            </div>

            <p className="text-xs text-neutral-500 mb-3">
              Select a spreadsheet file from your virtual computer filesystem:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1 mb-4 pr-1">
              {availableFiles.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  No spreadsheet files found in virtual storage.
                </div>
              ) : (
                availableFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => handleLoadFile(file)}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded bg-emerald-600/10 flex items-center justify-center">
                        <WinIcon name="excel" size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 uppercase">
                          Location: {file.parentId} • {file.updatedAt || 'Recent'}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                onClick={() => setIsOpenModalVisible(false)}
                className="px-4 py-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save As Modal */}
      {isSaveAsModalVisible && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-win11-open"
          onClick={() => setIsSaveAsModalVisible(false)}
        >
          <form
            onSubmit={handleSaveAsSubmit}
            className="w-[420px] p-5 rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700 win11-window-shadow text-slate-800 dark:text-slate-100"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
              <div className="flex items-center gap-2">
                <WinIcon name="excel" size={20} />
                <h3 className="font-bold text-sm">Save As Spreadsheet</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaveAsModalVisible(false)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <WinIcon name="x" size={14} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={saveAsName}
                  onChange={e => setSaveAsName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#282828] text-xs outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1">Save In</label>
                <select
                  value={saveAsFolder}
                  onChange={e => setSaveAsFolder(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#282828] text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="desktop">Desktop</option>
                  <option value="documents">Documents</option>
                  <option value="downloads">Downloads</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setIsSaveAsModalVisible(false)}
                className="px-4 py-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
