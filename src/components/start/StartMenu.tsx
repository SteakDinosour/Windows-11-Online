import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS_REGISTRY } from '../../config/apps';
import { USER_AVATAR } from '../../config/wallpapers';
import { WinIcon } from '../common/WinIcon';
import { AppId } from '../../types/os';

export const StartMenu: React.FC = () => {
  const {
    isStartOpen,
    settings,
    openWindow,
    closeAllPopups,
    toggleSearch,
    lockSystem,
    sleepSystem,
    shutDownSystem,
    restartSystem,
  } = useOS();

  const [viewMode, setViewMode] = useState<'pinned' | 'all'>('pinned');
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);

  if (!isStartOpen) return null;

  const pinnedAppIds: AppId[] = [
    'edge',
    'word',
    'excel',
    'powerpoint',
    'store',
    'photos',
    'settings',
    'notepad',
    'paint',
    'calc',
    'clock',
    'calendar',
    'mediaplayer',
    'camera',
    'terminal',
    'taskmanager',
    'security',
    'stickynotes',
  ];

  const allApps = Object.values(APPS_REGISTRY).sort((a, b) =>
    a.title.localeCompare(b.title)
  );

  const recommendedItems = [
    {
      name: 'Getting Started with Windows 11.txt',
      time: '2h ago',
      icon: 'file-text',
      action: () => openWindow('notepad', { title: 'Getting Started with Windows 11.txt' }),
    },
    {
      name: 'Quarterly Budget.xlsx',
      time: 'Yesterday at 4:20 PM',
      icon: 'excel',
      action: () => openWindow('excel', { title: 'Quarterly Budget.xlsx' }),
    },
    {
      name: 'Product Presentation.pptx',
      time: 'Oct 28',
      icon: 'powerpoint',
      action: () => openWindow('powerpoint', { title: 'Product Presentation.pptx' }),
    },
    {
      name: 'Executive Brief.docx',
      time: 'Oct 26',
      icon: 'word',
      action: () => openWindow('word', { title: 'Executive Brief.docx' }),
    },
  ];

  return (
    <div
      className={`fixed bottom-14 z-[9900] w-[620px] max-w-[94vw] h-[640px] max-h-[85vh] rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow flex flex-col overflow-hidden animate-win11-start ${
        settings.taskbarAlignment === 'center'
          ? 'left-1/2 -translate-x-1/2'
          : 'left-4'
      }`}
      onClick={e => {
        e.stopPropagation();
        setIsPowerMenuOpen(false);
        setIsUserMenuOpen(false);
      }}
    >
      {/* Top Search Bar */}
      <div className="p-6 pb-4">
        <div
          onClick={() => {
            closeAllPopups();
            toggleSearch();
          }}
          className="flex items-center gap-3 px-3.5 py-2 rounded-full bg-neutral-200/60 dark:bg-neutral-800/80 border border-neutral-300/80 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:border-sky-500 cursor-pointer transition-colors shadow-sm"
        >
          <WinIcon name="search" size={17} />
          <span className="text-xs">Search for apps, settings, and documents</span>
        </div>
      </div>

      {/* Main Content: Pinned View or All Apps View */}
      <div className="flex-1 px-8 overflow-y-auto">
        {viewMode === 'pinned' ? (
          <>
            {/* Pinned Header */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Pinned</span>
              <button
                onClick={() => setViewMode('all')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-200/50 dark:bg-neutral-800/50 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <span>All apps</span>
                <WinIcon name="chevron-right" size={12} />
              </button>
            </div>

            {/* Pinned Apps Grid */}
            <div className="grid grid-cols-6 gap-y-4 gap-x-2 py-2">
              {pinnedAppIds.map(appId => {
                const meta = APPS_REGISTRY[appId];
                if (!meta) return null;

                return (
                  <button
                    key={appId}
                    onClick={() => {
                      openWindow(appId);
                      closeAllPopups();
                    }}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-all group"
                  >
                    <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
                      <WinIcon name={meta.icon} size={30} />
                    </div>
                    <span className="mt-1.5 text-[11px] text-center font-medium text-slate-700 dark:text-slate-200 truncate w-full">
                      {meta.title}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Recommended Section */}
            <div className="mt-6 pt-4 border-t border-neutral-200/80 dark:border-neutral-700/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">Recommended</span>
                <button
                  onClick={() => openWindow('explorer', { pathId: 'documents' })}
                  className="px-2 py-0.5 rounded text-[11px] text-neutral-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  More &gt;
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {recommendedItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      item.action();
                      closeAllPopups();
                    }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded flex items-center justify-center bg-neutral-200/50 dark:bg-neutral-800/50 shrink-0">
                      <WinIcon name={item.icon} size={18} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                        {item.time}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          // All Apps Alphabetical View
          <div className="py-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">All Apps</span>
              <button
                onClick={() => setViewMode('pinned')}
                className="flex items-center gap-1 px-2 py-1 rounded bg-neutral-200/50 dark:bg-neutral-800/50 text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <WinIcon name="chevron-left" size={12} />
                <span>Back</span>
              </button>
            </div>

            <div className="space-y-1">
              {allApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app.id);
                    closeAllPopups();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-colors text-left"
                >
                  <div className="w-7 h-7 flex items-center justify-center">
                    <WinIcon name={app.icon} size={22} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {app.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {app.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Profile & Power Footer */}
      <div className="h-16 px-8 flex items-center justify-between bg-neutral-200/40 dark:bg-neutral-900/40 border-t border-neutral-300/60 dark:border-neutral-700/50 relative">
        {/* User Profile Button */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setIsUserMenuOpen(prev => !prev);
              setIsPowerMenuOpen(false);
            }}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 transition-colors"
          >
            <img
              src={USER_AVATAR}
              alt="User Avatar"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-neutral-400/50"
              referrerPolicy="no-referrer"
            />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              User
            </span>
          </button>

          {/* User Account Popover */}
          {isUserMenuOpen && (
            <div className="absolute bottom-14 left-0 w-52 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs animate-win11-open z-[10000]">
              <button
                onClick={() => {
                  openWindow('settings', { tab: 'accounts' });
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
              >
                <WinIcon name="user" size={14} />
                <span>Change account settings</span>
              </button>
              <button
                onClick={() => {
                  lockSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
              >
                <WinIcon name="lock" size={14} />
                <span>Lock (Win + L)</span>
              </button>
              <button
                onClick={() => {
                  lockSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left text-red-500"
              >
                <WinIcon name="power" size={14} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

        {/* Power Button */}
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setIsPowerMenuOpen(prev => !prev);
              setIsUserMenuOpen(false);
            }}
            className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50 text-slate-700 dark:text-slate-200 transition-colors"
            title="Power"
          >
            <WinIcon name="power" size={18} />
          </button>

          {/* Power Options Popover */}
          {isPowerMenuOpen && (
            <div className="absolute bottom-14 right-0 w-44 p-1.5 rounded-lg mica-surface border border-neutral-300 dark:border-neutral-700 win11-flyout-shadow text-xs animate-win11-open z-[10000]">
              <button
                onClick={() => {
                  lockSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
              >
                <WinIcon name="lock" size={14} />
                <span>Lock</span>
              </button>
              <button
                onClick={() => {
                  sleepSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
              >
                <WinIcon name="moon" size={14} />
                <span>Sleep</span>
              </button>
              <button
                onClick={() => {
                  shutDownSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left text-red-500"
              >
                <WinIcon name="power" size={14} />
                <span>Shut down</span>
              </button>
              <button
                onClick={() => {
                  restartSystem();
                  closeAllPopups();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded hover:bg-neutral-200/70 dark:hover:bg-neutral-700/60 transition-colors text-left"
              >
                <WinIcon name="rotate-ccw" size={14} />
                <span>Restart</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
