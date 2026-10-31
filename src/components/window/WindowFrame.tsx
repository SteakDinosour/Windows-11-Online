import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useOS } from '../../context/OSContext';
import { WindowState, WindowPosition } from '../../types/os';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ window: win, children }) => {
  const {
    activeWindowId,
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    updateWindowPosition,
    snapWindow,
  } = useOS();

  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    pos: WindowPosition;
  }>({ mouseX: 0, mouseY: 0, pos: win.position });

  const [showSnapFlyout, setShowSnapFlyout] = useState(false);
  const snapTimeoutRef = useRef<any>(null);

  const isActive = activeWindowId === win.id;

  // Window Drag handling
  const handleTitleBarMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-control-btn')) return;
    if (win.isMaximized) return;

    focusWindow(win.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - win.position.x,
      y: e.clientY - win.position.y,
    });
  };

  // Resize handle mouse down
  const handleResizeMouseDown = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (win.isMaximized) return;

    focusWindow(win.id);
    setIsResizing(direction);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      pos: { ...win.position },
    });
  };

  // Global mouse move and up for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(-win.position.width + 100, Math.min(e.clientX - dragOffset.x, window.innerWidth - 60));
        const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 80));
        updateWindowPosition(win.id, {
          ...win.position,
          x: newX,
          y: newY,
        });
      } else if (isResizing) {
        const dx = e.clientX - resizeStart.mouseX;
        const dy = e.clientY - resizeStart.mouseY;
        const minW = 340;
        const minH = 220;
        let { x, y, width, height } = resizeStart.pos;

        if (isResizing.includes('e')) {
          width = Math.max(minW, resizeStart.pos.width + dx);
        }
        if (isResizing.includes('s')) {
          height = Math.max(minH, resizeStart.pos.height + dy);
        }
        if (isResizing.includes('w')) {
          const proposedW = resizeStart.pos.width - dx;
          if (proposedW >= minW) {
            width = proposedW;
            x = resizeStart.pos.x + dx;
          }
        }
        if (isResizing.includes('n')) {
          const proposedH = resizeStart.pos.height - dy;
          if (proposedH >= minH) {
            height = proposedH;
            y = resizeStart.pos.y + dy;
          }
        }

        updateWindowPosition(win.id, { x, y, width, height });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, resizeStart, win.id, win.position, updateWindowPosition]);

  if (win.isMinimized) return null;

  return (
    <div
      onClick={() => focusWindow(win.id)}
      style={{
        left: win.position.x,
        top: win.position.y,
        width: win.position.width,
        height: win.position.height,
        zIndex: win.zIndex,
      }}
      className={`fixed flex flex-col overflow-hidden transition-all duration-75 select-none ${
        win.isMaximized ? 'rounded-none' : 'rounded-xl win11-window-shadow'
      } ${
        isActive
          ? 'ring-1 ring-white/20 dark:ring-white/10'
          : 'opacity-95 ring-1 ring-black/5 dark:ring-white/5'
      } bg-white dark:bg-[#202020] text-slate-800 dark:text-slate-100`}
    >
      {/* Window Title Bar */}
      <div
        onMouseDown={handleTitleBarMouseDown}
        onDoubleClick={() => maximizeWindow(win.id)}
        className={`h-9 flex items-center justify-between px-3 shrink-0 cursor-default border-b ${
          isActive
            ? 'bg-neutral-100 dark:bg-[#2c2c2c] border-neutral-200 dark:border-neutral-700/60'
            : 'bg-neutral-50 dark:bg-[#242424] border-neutral-200/50 dark:border-neutral-800'
        }`}
      >
        {/* Title & Icon */}
        <div className="flex items-center gap-2 min-w-0 max-w-[60%] pointer-events-none">
          <WinIcon name={win.icon} size={15} />
          <span className="text-xs font-semibold truncate tracking-tight text-slate-700 dark:text-slate-200">
            {win.title}
          </span>
        </div>

        {/* Window Control Buttons (Minimize, Maximize / Snap, Close) */}
        <div className="flex items-center h-full -mr-3 window-controls">
          {/* Minimize */}
          <button
            onClick={() => minimizeWindow(win.id)}
            className="window-control-btn w-11 h-full flex items-center justify-center hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition-colors"
            title="Minimize"
          >
            <WinIcon name="minus" size={12} />
          </button>

          {/* Maximize / Snap Button */}
          <div
            className="relative h-full"
            onMouseEnter={() => {
              snapTimeoutRef.current = setTimeout(() => setShowSnapFlyout(true), 350);
            }}
            onMouseLeave={() => {
              clearTimeout(snapTimeoutRef.current);
              setShowSnapFlyout(false);
            }}
          >
            <button
              onClick={() => maximizeWindow(win.id)}
              className="window-control-btn w-11 h-full flex items-center justify-center hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 transition-colors"
              title={win.isMaximized ? 'Restore' : 'Maximize'}
            >
              <WinIcon name={win.isMaximized ? 'minimize' : 'maximize'} size={11} />
            </button>

            {/* Snap Layouts Flyout Menu (Windows 11 iconic feature) */}
            {showSnapFlyout && (
              <div
                className="absolute top-9 right-0 p-3 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow z-[9999] w-64 animate-win11-open"
                onClick={e => e.stopPropagation()}
              >
                <div className="text-[10px] font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                  Snap Window
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Left / Right split */}
                  <div className="flex gap-1 p-1 rounded border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 transition-colors cursor-pointer bg-neutral-200/40 dark:bg-neutral-800/40 h-16">
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'left');
                        setShowSnapFlyout(false);
                      }}
                      className="flex-1 rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Snap Left"
                    />
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'right');
                        setShowSnapFlyout(false);
                      }}
                      className="flex-1 rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Snap Right"
                    />
                  </div>

                  {/* 4 Quadrants split */}
                  <div className="grid grid-cols-2 gap-1 p-1 rounded border border-neutral-300 dark:border-neutral-700 hover:border-blue-500 transition-colors cursor-pointer bg-neutral-200/40 dark:bg-neutral-800/40 h-16">
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'top-left');
                        setShowSnapFlyout(false);
                      }}
                      className="rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Top Left"
                    />
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'top-right');
                        setShowSnapFlyout(false);
                      }}
                      className="rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Top Right"
                    />
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'bottom-left');
                        setShowSnapFlyout(false);
                      }}
                      className="rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Bottom Left"
                    />
                    <button
                      onClick={() => {
                        snapWindow(win.id, 'bottom-right');
                        setShowSnapFlyout(false);
                      }}
                      className="rounded bg-blue-500/20 hover:bg-blue-500/50 transition-colors"
                      title="Bottom Right"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Close */}
          <button
            onClick={() => closeWindow(win.id)}
            className="window-control-btn w-12 h-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors"
            title="Close"
          >
            <WinIcon name="close" size={13} />
          </button>
        </div>
      </div>

      {/* Window Body (Application Content Viewport) */}
      <div className="flex-1 overflow-auto relative bg-neutral-50 dark:bg-[#1f1f1f]">
        {children}
      </div>

      {/* Resize Handles (8 directions) */}
      {!win.isMaximized && (
        <>
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'n')}
            className="absolute top-0 left-0 right-0 h-1.5 cursor-ns-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 's')}
            className="absolute bottom-0 left-0 right-0 h-1.5 cursor-ns-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'w')}
            className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'e')}
            className="absolute top-0 bottom-0 right-0 w-1.5 cursor-ew-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'nw')}
            className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'ne')}
            className="absolute top-0 right-0 w-3 h-3 cursor-nesw-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'sw')}
            className="absolute bottom-0 left-0 w-3 h-3 cursor-nesw-resize"
          />
          <div
            onMouseDown={e => handleResizeMouseDown(e, 'se')}
            className="absolute bottom-0 right-0 w-3 h-3 cursor-nwse-resize"
          />
        </>
      )}
    </div>
  );
};
