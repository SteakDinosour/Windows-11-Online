import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS_REGISTRY } from '../../config/apps';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';
import { AppId } from '../../types/os';

export const Taskbar: React.FC = () => {
  const {
    windows,
    activeWindowId,
    settings,
    notifications,
    isStartOpen,
    isSearchOpen,
    isWidgetsOpen,
    isQuickSettingsOpen,
    isCalendarOpen,
    toggleStartMenu,
    toggleSearch,
    toggleWidgets,
    toggleQuickSettings,
    toggleCalendar,
    toggleTaskView,
    toggleWindowMinimize,
    openWindow,
    showDesktop,
  } = useOS();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [hoveredAppId, setHoveredAppId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time and date
  const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString([], { month: 'numeric', day: 'numeric', year: 'numeric' });

  // Default pinned apps (clean minimal Windows 11 taskbar)
  const pinnedAppIds: AppId[] = [
    'explorer',
    'edge',
    'store',
  ];

  // Also include apps that are running but not pinned
  const runningNonPinned = windows
    .filter(w => !pinnedAppIds.includes(w.appId))
    .map(w => w.appId)
    .filter((appId, index, self) => self.indexOf(appId) === index);

  const displayAppIds = [...pinnedAppIds, ...runningNonPinned];

  // Right click taskbar
  const handleTaskbarContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 200);
    setContextMenu({ visible: true, x, y: window.innerHeight - 100 });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 h-12 acrylic-taskbar z-[9000] flex items-center justify-between px-2 select-none"
        onContextMenu={handleTaskbarContextMenu}
        onClick={() => setContextMenu({ visible: false, x: 0, y: 0 })}
      >
        {/* Left Side: Widgets button (when center aligned) or Start cluster (when left aligned) */}
        <div className="flex items-center gap-1.5 h-full">
          {settings.taskbarAlignment === 'center' ? (
            <button
              onClick={toggleWidgets}
              className={`flex items-center gap-2 px-2.5 h-9 rounded-md transition-all ${
                isWidgetsOpen
                  ? 'bg-neutral-300/80 dark:bg-neutral-700/80 shadow-inner'
                  : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
              }`}
              title="Widgets (Win + W)"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-200">
                <WinIcon name="sun" size={16} className="text-amber-500 animate-spin-slow" />
                <span className="hidden sm:inline font-mono tabular-nums">72°F</span>
                <span className="hidden md:inline text-[11px] text-neutral-500 dark:text-neutral-400">Sunny</span>
              </div>
            </button>
          ) : (
            // Left-aligned mode: Start cluster sits on the left
            <div className="flex items-center gap-1 h-full">
              <button
                onClick={toggleStartMenu}
                className={`w-10 h-9 flex items-center justify-center rounded-md transition-all ${
                  isStartOpen
                    ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
                title="Start (Win)"
              >
                <WinIcon name="windows" size={20} className="text-sky-500 hover:text-sky-400 transition-colors" />
              </button>

              <button
                onClick={toggleSearch}
                className={`w-10 h-9 flex items-center justify-center rounded-md transition-all ${
                  isSearchOpen
                    ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
                title="Search (Win + S)"
              >
                <WinIcon name="search" size={17} className="text-slate-700 dark:text-slate-200" />
              </button>

              <button
                onClick={toggleTaskView}
                className="w-10 h-9 flex items-center justify-center rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all text-slate-700 dark:text-slate-200"
                title="Task View (Win + Tab)"
              >
                <WinIcon name="layout-grid" size={17} />
              </button>

              <button
                onClick={toggleWidgets}
                className={`w-10 h-9 flex items-center justify-center rounded-md transition-all ${
                  isWidgetsOpen
                    ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
                title="Widgets"
              >
                <WinIcon name="sun" size={17} className="text-amber-500" />
              </button>
            </div>
          )}
        </div>

        {/* Center Taskbar Icons (Centered or Left-Aligned flow) */}
        <div
          className={`flex items-center gap-1 h-full ${
            settings.taskbarAlignment === 'center' ? 'absolute left-1/2 -translate-x-1/2' : 'flex-1 ml-1'
          }`}
        >
          {settings.taskbarAlignment === 'center' && (
            <>
              {/* Start Button */}
              <button
                onClick={toggleStartMenu}
                className={`w-10 h-9 flex items-center justify-center rounded-md transition-all ${
                  isStartOpen
                    ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
                title="Start (Win)"
              >
                <WinIcon name="windows" size={20} className="text-sky-500 hover:text-sky-400 transition-colors" />
              </button>

              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className={`w-10 h-9 flex items-center justify-center rounded-md transition-all ${
                  isSearchOpen
                    ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                    : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                }`}
                title="Search (Win + S)"
              >
                <WinIcon name="search" size={17} className="text-slate-700 dark:text-slate-200" />
              </button>

              {/* Task View */}
              <button
                onClick={toggleTaskView}
                className="w-10 h-9 flex items-center justify-center rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60 transition-all text-slate-700 dark:text-slate-200"
                title="Task View (Win + Tab)"
              >
                <WinIcon name="layout-grid" size={17} />
              </button>
            </>
          )}

          {/* App Icons */}
          {displayAppIds.map(appId => {
            const meta = APPS_REGISTRY[appId];
            if (!meta) return null;

            const appWindows = windows.filter(w => w.appId === appId);
            const isRunning = appWindows.length > 0;
            const isActive = appWindows.some(w => w.id === activeWindowId && !w.isMinimized);

            return (
              <div
                key={appId}
                className="relative flex flex-col items-center justify-center"
                onMouseEnter={() => setHoveredAppId(appId)}
                onMouseLeave={() => setHoveredAppId(null)}
              >
                <button
                  onClick={() => toggleWindowMinimize(appId)}
                  className={`w-10 h-9 flex items-center justify-center rounded-md transition-all relative ${
                    isActive
                      ? 'bg-neutral-300/80 dark:bg-neutral-700/80 shadow-sm'
                      : isRunning
                      ? 'hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 bg-neutral-200/30 dark:bg-neutral-800/30'
                      : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  }`}
                  title={meta.title}
                >
                  <WinIcon name={meta.icon} size={20} />

                  {/* Running Indicator Bar */}
                  {isRunning && (
                    <div
                      className={`absolute bottom-0.5 rounded-full transition-all duration-200 ${
                        isActive
                          ? 'w-4 h-0.5 bg-sky-500'
                          : 'w-1.5 h-0.5 bg-neutral-400 dark:bg-neutral-500'
                      }`}
                    />
                  )}
                </button>

                {/* Hover App Thumbnail Preview */}
                {hoveredAppId === appId && isRunning && (
                  <div className="absolute bottom-12 mb-2 p-2 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs z-[10000] pointer-events-none min-w-36 animate-win11-open">
                    <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-100 truncate">
                      <WinIcon name={meta.icon} size={14} />
                      <span className="truncate">{appWindows[0]?.title || meta.title}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Side: System Tray */}
        <div className="flex items-center gap-1 h-full">
          {/* Quick Settings Combo Pill (Wi-Fi, Volume, Battery) */}
          <button
            onClick={toggleQuickSettings}
            className={`flex items-center gap-2 px-2.5 h-9 rounded-md transition-all text-slate-700 dark:text-slate-200 ${
              isQuickSettingsOpen
                ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
            title="Quick Settings (Win + A)"
          >
            <WinIcon
              name="wifi"
              size={15}
              className={settings.wifiEnabled && !settings.airplaneMode ? 'text-sky-500' : 'text-neutral-400'}
            />
            <WinIcon name="volume-2" size={15} />
            <div className="flex items-center gap-0.5">
              <WinIcon name="battery" size={15} className="text-emerald-500" />
              <span className="text-[10px] font-mono tabular-nums font-semibold hidden sm:inline">
                {settings.batteryLevel}%
              </span>
            </div>
          </button>

          {/* Clock & Date / Notification Bell Combo Pill */}
          <button
            onClick={toggleCalendar}
            className={`flex items-center gap-2 px-2.5 h-9 rounded-md transition-all text-right text-slate-700 dark:text-slate-200 ${
              isCalendarOpen
                ? 'bg-neutral-300/80 dark:bg-neutral-700/80'
                : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
            }`}
            title="Notification Center & Calendar (Win + N)"
          >
            <div className="flex flex-col items-end text-[11px] leading-tight font-medium">
              <span className="font-mono tabular-nums">{timeString}</span>
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono tabular-nums">
                {dateString}
              </span>
            </div>

            <div className="relative ml-0.5">
              <WinIcon name="bell" size={14} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full bg-sky-500 text-white text-[9px] font-bold flex items-center justify-center font-mono">
                  {unreadCount}
                </span>
              )}
            </div>
          </button>

          {/* Show Desktop Sliver Bar (Windows Peek) */}
          <div
            className="w-1.5 h-8 ml-0.5 rounded-r cursor-pointer hover:bg-neutral-400/40 dark:hover:bg-neutral-600/50 transition-colors"
            title="Show Desktop (Win + D)"
            onClick={showDesktop}
          />
        </div>
      </div>

      {/* Taskbar Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed z-[10001] w-48 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs text-slate-800 dark:text-slate-100 animate-win11-open"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={e => e.stopPropagation()}
        >
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 text-left transition-colors font-medium"
            onClick={() => {
              openWindow('taskmanager');
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
          >
            <WinIcon name="activity" size={14} />
            <span>Task Manager</span>
          </button>
          <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
          <button
            className="w-full flex items-center gap-2 px-3 py-1.5 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 text-left transition-colors font-medium"
            onClick={() => {
              openWindow('settings', { tab: 'personalization' });
              setContextMenu({ visible: false, x: 0, y: 0 });
            }}
          >
            <WinIcon name="settings" size={14} />
            <span>Taskbar settings</span>
          </button>
        </div>
      )}
    </>
  );
};
