import React, { useState, useMemo } from 'react';
import { useOS } from '../../context/OSContext';
import { APPS_REGISTRY } from '../../config/apps';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';

export const WindowsSearch: React.FC = () => {
  const { isSearchOpen, openWindow, closeAllPopups, settings } = useOS();
  const [query, setQuery] = useState<string>('');
  const [category, setCategory] = useState<'all' | 'apps' | 'docs' | 'settings'>('all');

  const allFiles = useMemo(() => fileSystem.getAllItems(), []);

  // Filtered Results
  const filteredApps = useMemo(() => {
    if (!query.trim()) return Object.values(APPS_REGISTRY).slice(0, 6);
    return Object.values(APPS_REGISTRY).filter(app =>
      app.title.toLowerCase().includes(query.toLowerCase()) ||
      app.description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredDocs = useMemo(() => {
    if (!query.trim()) return allFiles.slice(0, 4);
    return allFiles.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, allFiles]);

  const settingResults = useMemo(() => {
    const list = [
      { name: 'Display settings', tab: 'display', icon: 'monitor' },
      { name: 'Sound & Volume settings', tab: 'sound', icon: 'volume-2' },
      { name: 'Personalization & Themes', tab: 'personalization', icon: 'palette' },
      { name: 'Wi-Fi & Network', tab: 'network', icon: 'wifi' },
      { name: 'Storage & Disk Cleanup', tab: 'storage', icon: 'hard-drive' },
      { name: 'Windows Update', tab: 'update', icon: 'refresh' },
      { name: 'Accessibility & Narrator', tab: 'accessibility', icon: 'user' },
    ];
    if (!query.trim()) return list.slice(0, 4);
    return list.filter(s => s.name.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  if (!isSearchOpen) return null;

  return (
    <div
      className={`fixed bottom-14 z-[9900] w-[660px] max-w-[94vw] h-[600px] max-h-[82vh] rounded-xl mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow flex flex-col overflow-hidden animate-win11-start ${
        settings.taskbarAlignment === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-4'
      }`}
      onClick={e => e.stopPropagation()}
    >
      {/* Search Input Bar */}
      <div className="p-4 border-b border-neutral-200/80 dark:border-neutral-700/60 flex items-center gap-3">
        <WinIcon name="search" size={20} className="text-sky-500" />
        <input
          type="text"
          autoFocus
          placeholder="Type here to search..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-neutral-400 outline-none font-medium"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="p-1 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 text-neutral-400"
          >
            <WinIcon name="close" size={14} />
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-neutral-200/50 dark:border-neutral-700/40 text-xs">
        {(['all', 'apps', 'docs', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setCategory(tab)}
            className={`px-3 py-1 rounded-full font-medium capitalize transition-colors ${
              category === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-neutral-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
            }`}
          >
            {tab === 'docs' ? 'Documents' : tab}
          </button>
        ))}
      </div>

      {/* Results View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Apps Section */}
        {(category === 'all' || category === 'apps') && filteredApps.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Apps
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {filteredApps.map(app => (
                <button
                  key={app.id}
                  onClick={() => {
                    openWindow(app.id);
                    closeAllPopups();
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded flex items-center justify-center bg-neutral-200/50 dark:bg-neutral-800/50">
                    <WinIcon name={app.icon} size={20} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {app.title}
                    </span>
                    <span className="text-[10px] text-neutral-400 truncate">
                      {app.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        {(category === 'all' || category === 'docs') && filteredDocs.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Documents & Files
            </h4>
            <div className="space-y-1">
              {filteredDocs.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.type === 'folder') {
                      openWindow('explorer', { pathId: item.id });
                    } else {
                      openWindow('notepad', { fileId: item.id, content: item.content, fileName: item.name });
                    }
                    closeAllPopups();
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <WinIcon name={item.icon || 'file'} size={18} />
                    <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                    {item.updatedAt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {(category === 'all' || category === 'settings') && settingResults.length > 0 && (
          <div>
            <h4 className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Settings
            </h4>
            <div className="space-y-1">
              {settingResults.map(s => (
                <button
                  key={s.name}
                  onClick={() => {
                    openWindow('settings', { tab: s.tab });
                    closeAllPopups();
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-200/60 dark:hover:bg-neutral-700/50 transition-colors text-left"
                >
                  <WinIcon name={s.icon} size={16} className="text-sky-500" />
                  <span className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Web Search fallback */}
        {query && (
          <div className="pt-2 border-t border-neutral-200/80 dark:border-neutral-700/60">
            <button
              onClick={() => {
                openWindow('edge', { initialUrl: `https://www.bing.com/search?q=${encodeURIComponent(query)}` });
                closeAllPopups();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors text-left text-xs font-medium"
            >
              <WinIcon name="globe" size={16} />
              <span>Search the web for "{query}"</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
