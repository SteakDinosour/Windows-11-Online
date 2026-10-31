import React, { useState } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const CalculatorApp: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (digit: string) => {
    soundManager.playClick();
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  const inputDot = () => {
    soundManager.playClick();
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const clearAll = () => {
    soundManager.playClick();
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearEntry = () => {
    soundManager.playClick();
    setDisplay('0');
  };

  const toggleSign = () => {
    soundManager.playClick();
    const value = parseFloat(display);
    setDisplay((value * -1).toString());
  };

  const inputPercent = () => {
    soundManager.playClick();
    const value = parseFloat(display);
    setDisplay((value / 100).toString());
  };

  const performOperation = (nextOp: string) => {
    soundManager.playClick();
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operation) {
      const currentVal = prevValue || 0;
      let result = 0;
      switch (operation) {
        case '+': result = currentVal + inputValue; break;
        case '-': result = currentVal - inputValue; break;
        case '×': result = currentVal * inputValue; break;
        case '÷': result = inputValue !== 0 ? currentVal / inputValue : 0; break;
        case '^': result = Math.pow(currentVal, inputValue); break;
        default: result = inputValue;
      }
      setHistory(h => [`${currentVal} ${operation} ${inputValue} = ${result}`, ...h.slice(0, 10)]);
      setDisplay(result.toString());
      setPrevValue(result);
    }

    setWaitingForOperand(true);
    setOperation(nextOp === '=' ? null : nextOp);
  };

  // Scientific special functions
  const performScientific = (fn: string) => {
    soundManager.playClick();
    const val = parseFloat(display);
    let result = 0;
    switch (fn) {
      case 'sin': result = Math.sin(val); break;
      case 'cos': result = Math.cos(val); break;
      case 'tan': result = Math.tan(val); break;
      case 'sqrt': result = Math.sqrt(val); break;
      case 'sqr': result = val * val; break;
      case 'inv': result = val !== 0 ? 1 / val : 0; break;
      case 'ln': result = Math.log(val); break;
      case 'log': result = Math.log10(val); break;
      case 'pi': result = Math.PI; break;
      case 'e': result = Math.E; break;
      default: break;
    }
    setDisplay(result.toString());
    setWaitingForOperand(true);
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#202020] text-slate-800 dark:text-slate-100 select-none p-3">
      {/* Mode Bar */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode(mode === 'standard' ? 'scientific' : 'standard')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold"
          >
            <WinIcon name="calculator" size={14} />
            <span className="capitalize">{mode}</span>
          </button>
        </div>
      </div>

      {/* Screen Display */}
      <div className="p-3 mb-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-neutral-200 dark:border-neutral-800 text-right">
        <div className="text-[11px] text-neutral-400 font-mono tabular-nums h-4">
          {prevValue !== null && operation ? `${prevValue} ${operation}` : ''}
        </div>
        <div className="text-3xl font-extrabold font-mono tabular-nums tracking-tight truncate">
          {display}
        </div>
      </div>

      {/* Memory Controls */}
      <div className="grid grid-cols-5 gap-1 mb-2 text-xs font-semibold text-neutral-500">
        <button onClick={() => setMemory(0)} className="py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">MC</button>
        <button onClick={() => setDisplay(memory.toString())} className="py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">MR</button>
        <button onClick={() => setMemory(m => m + parseFloat(display))} className="py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">M+</button>
        <button onClick={() => setMemory(m => m - parseFloat(display))} className="py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">M-</button>
        <button onClick={() => setMemory(parseFloat(display))} className="py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">MS</button>
      </div>

      {/* Scientific Rows (if scientific mode) */}
      {mode === 'scientific' && (
        <div className="grid grid-cols-5 gap-1.5 mb-1.5 text-xs font-semibold">
          <button onClick={() => performScientific('sin')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">sin</button>
          <button onClick={() => performScientific('cos')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">cos</button>
          <button onClick={() => performScientific('tan')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">tan</button>
          <button onClick={() => performScientific('pi')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">π</button>
          <button onClick={() => performScientific('e')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">e</button>
          <button onClick={() => performScientific('ln')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">ln</button>
          <button onClick={() => performScientific('log')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">log</button>
          <button onClick={() => performOperation('^')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">x^y</button>
          <button onClick={() => performScientific('sqr')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">x²</button>
          <button onClick={() => performScientific('sqrt')} className="py-2 rounded bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">√</button>
        </div>
      )}

      {/* Main Standard Keypad (4 columns) */}
      <div className="grid grid-cols-4 gap-1.5 flex-1 text-sm font-semibold">
        <button onClick={inputPercent} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">%</button>
        <button onClick={clearEntry} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">CE</button>
        <button onClick={clearAll} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">C</button>
        <button onClick={() => performOperation('÷')} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">÷</button>

        <button onClick={() => inputDigit('7')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">7</button>
        <button onClick={() => inputDigit('8')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">8</button>
        <button onClick={() => inputDigit('9')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">9</button>
        <button onClick={() => performOperation('×')} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">×</button>

        <button onClick={() => inputDigit('4')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">4</button>
        <button onClick={() => inputDigit('5')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">5</button>
        <button onClick={() => inputDigit('6')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">6</button>
        <button onClick={() => performOperation('-')} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">-</button>

        <button onClick={() => inputDigit('1')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">1</button>
        <button onClick={() => inputDigit('2')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">2</button>
        <button onClick={() => inputDigit('3')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">3</button>
        <button onClick={() => performOperation('+')} className="py-2.5 rounded-lg bg-neutral-200/50 dark:bg-neutral-800/60 hover:bg-neutral-300 dark:hover:bg-neutral-700">+</button>

        <button onClick={toggleSign} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">±</button>
        <button onClick={() => inputDigit('0')} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">0</button>
        <button onClick={inputDot} className="py-2.5 rounded-lg bg-white dark:bg-[#2b2b2b] hover:bg-neutral-200 dark:hover:bg-neutral-700 shadow-sm">.</button>
        <button onClick={() => performOperation('=')} className="py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-bold">=</button>
      </div>
    </div>
  );
};
