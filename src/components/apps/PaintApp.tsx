import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const PaintApp: React.FC = () => {
  const { addNotification } = useOS();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<'pencil' | 'brush' | 'eraser' | 'rectangle' | 'circle' | 'line'>('pencil');
  const [color, setColor] = useState<string>('#000000');
  const [lineWidth, setLineWidth] = useState<number>(4);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas with white background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const saveHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory(prev => [...prev.slice(-15), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop();
    const prevData = newHistory[newHistory.length - 1];
    ctx.putImageData(prevData, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveHistory();
  };

  const handleSaveToPictures = () => {
    soundManager.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const fileName = `Drawing_${Date.now()}.png`;

    fileSystem.createItem(fileName, 'file', 'pictures', dataUrl, 'png');
    addNotification('Paint', `Saved ${fileName} to Pictures`, 'Paint');
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPos({ x, y });

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'brush' ? lineWidth * 2 : lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pencil' || tool === 'brush' || tool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    if (tool === 'rectangle') {
      ctx.strokeRect(
        startPos.x,
        startPos.y,
        x - startPos.x,
        y - startPos.y
      );
    } else if (tool === 'circle') {
      const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
      ctx.beginPath();
      ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (tool === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPos.x, startPos.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    setIsDrawing(false);
    saveHistory();
  };

  const colors = [
    '#000000', '#ffffff', '#7f7f7f', '#c3c3c3',
    '#880015', '#b97a57', '#ed1c24', '#ffaec9',
    '#ff7f27', '#ffc90e', '#fff200', '#efe4b0',
    '#22b14c', '#b5e61d', '#00a2e8', '#99d9ea',
    '#3f48cc', '#7092be', '#a349a4', '#c8bfe7',
  ];

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#202020] text-slate-800 dark:text-slate-100 select-none">
      {/* Top Toolbar */}
      <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-[#282828] text-xs">
        {/* Tools */}
        <div className="flex items-center gap-1">
          {[
            { id: 'pencil', icon: 'crop', title: 'Pencil' },
            { id: 'brush', icon: 'palette', title: 'Brush' },
            { id: 'eraser', icon: 'scissors', title: 'Eraser' },
            { id: 'line', icon: 'minus', title: 'Line' },
            { id: 'rectangle', icon: 'table', title: 'Rectangle' },
            { id: 'circle', icon: 'play-circle', title: 'Circle' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playClick();
                setTool(t.id as any);
              }}
              className={`p-1.5 rounded-lg transition-colors font-medium ${
                tool === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
              title={t.title}
            >
              <WinIcon name={t.icon} size={15} />
            </button>
          ))}
        </div>

        {/* Thickness Slider */}
        <div className="flex items-center gap-2 px-2 border-x border-neutral-300 dark:border-neutral-700">
          <span className="text-[11px] text-neutral-400">Size:</span>
          <input
            type="range"
            min="1"
            max="24"
            value={lineWidth}
            onChange={e => setLineWidth(parseInt(e.target.value))}
            className="w-16 accent-blue-600 cursor-pointer h-1 rounded"
          />
          <span className="font-mono tabular-nums text-xs font-semibold">{lineWidth}px</span>
        </div>

        {/* Color Palette Grid */}
        <div className="flex items-center gap-1.5">
          <div
            className="w-7 h-7 rounded-full border-2 border-white dark:border-neutral-600 shadow-sm shrink-0"
            style={{ backgroundColor: color }}
            title="Active color"
          />
          <div className="grid grid-cols-10 gap-1">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full border border-black/20 ${color === c ? 'ring-2 ring-blue-500 scale-110' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 disabled:opacity-30"
            title="Undo (Ctrl+Z)"
          >
            <WinIcon name="rotate-ccw" size={14} />
          </button>
          <button
            onClick={handleClear}
            className="px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleSaveToPictures}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            Save to Pictures
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-neutral-200/80 dark:bg-[#181818]">
        <canvas
          ref={canvasRef}
          width={820}
          height={520}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          className="bg-white shadow-md rounded cursor-crosshair border border-neutral-300 dark:border-neutral-700"
        />
      </div>
    </div>
  );
};
