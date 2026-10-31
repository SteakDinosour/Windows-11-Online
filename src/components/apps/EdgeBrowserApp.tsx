import React, { useState } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface Tab {
  id: string;
  title: string;
  url: string;
  icon?: string;
}

interface EdgeProps {
  payload?: { initialUrl?: string };
}

export const EdgeBrowserApp: React.FC<EdgeProps> = ({ payload }) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Microsoft Start',
      url: payload?.initialUrl || 'https://www.msn.com',
      icon: 'globe',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');
  const [inputUrl, setInputUrl] = useState<string>(payload?.initialUrl || 'https://www.bing.com');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const handleNavigate = (url: string) => {
    soundManager.playClick();
    setIsLoading(true);
    let target = url.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        target = `https://www.bing.com/search?q=${encodeURIComponent(target)}`;
      }
    }

    setTabs(prev =>
      prev.map(t =>
        t.id === activeTabId
          ? { ...t, url: target, title: target.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] }
          : t
      )
    );
    setInputUrl(target);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleAddTab = () => {
    soundManager.playClick();
    const newId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newId,
      title: 'New Tab',
      url: 'https://www.bing.com',
      icon: 'globe',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newId);
    setInputUrl('https://www.bing.com');
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const nextTabs = tabs.filter(t => t.id !== id);
    setTabs(nextTabs);
    if (activeTabId === id) {
      setActiveTabId(nextTabs[0].id);
      setInputUrl(nextTabs[0].url);
    }
  };

  const favorites = [
    { title: 'Bing', url: 'https://www.bing.com' },
    { title: 'Wikipedia', url: 'https://en.wikipedia.org' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
    { title: 'Weather', url: 'https://weather.com' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#181818] text-slate-800 dark:text-slate-100 select-none">
      {/* Edge Tabs Bar */}
      <div className="h-10 flex items-center px-2 gap-1 bg-neutral-200 dark:bg-[#202020] border-b border-neutral-300 dark:border-neutral-800 pt-1">
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {tabs.map(tab => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => {
                  setActiveTabId(tab.id);
                  setInputUrl(tab.url);
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs max-w-56 cursor-pointer border-t border-x transition-colors ${
                  isActive
                    ? 'bg-neutral-50 dark:bg-[#181818] border-neutral-300 dark:border-neutral-700 font-medium'
                    : 'bg-transparent border-transparent text-neutral-500 hover:bg-neutral-300/50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <WinIcon name="globe" size={13} className="text-sky-500 shrink-0" />
                <span className="truncate flex-1">{tab.title}</span>
                {tabs.length > 1 && (
                  <button
                    onClick={e => handleCloseTab(tab.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600"
                  >
                    <WinIcon name="close" size={10} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddTab}
          className="p-1.5 rounded hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-500"
          title="New tab (Ctrl+T)"
        >
          <WinIcon name="plus" size={14} />
        </button>
      </div>

      {/* Navigation & Address Bar */}
      <div className="h-11 px-3 flex items-center gap-2 bg-neutral-50 dark:bg-[#181818] border-b border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => handleNavigate(activeTab.url)}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          title="Back"
        >
          <WinIcon name="chevron-left" size={16} />
        </button>
        <button
          onClick={() => handleNavigate(activeTab.url)}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          title="Forward"
        >
          <WinIcon name="chevron-right" size={16} />
        </button>
        <button
          onClick={() => handleNavigate(activeTab.url)}
          className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
          title="Refresh"
        >
          <WinIcon name="refresh" size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>

        {/* Address Input */}
        <form
          onSubmit={e => {
            e.preventDefault();
            handleNavigate(inputUrl);
          }}
          className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 text-xs shadow-inner"
        >
          <WinIcon name="lock" size={12} className="text-emerald-500" />
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            className="w-full bg-transparent outline-none text-slate-800 dark:text-slate-100"
            placeholder="Search or enter web address"
          />
        </form>
      </div>

      {/* Favorites Toolbar */}
      <div className="h-8 px-3 flex items-center gap-2 bg-neutral-100/60 dark:bg-[#1e1e1e] border-b border-neutral-200 dark:border-neutral-800 text-[11px] overflow-x-auto">
        {favorites.map(fav => (
          <button
            key={fav.title}
            onClick={() => handleNavigate(fav.url)}
            className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-medium whitespace-nowrap"
          >
            <WinIcon name="globe" size={12} className="text-sky-500" />
            <span>{fav.title}</span>
          </button>
        ))}
      </div>

      {/* Web Browser Frame Viewport */}
      <div className="flex-1 bg-white dark:bg-[#121212] overflow-hidden relative">
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-600 animate-pulse z-10" />
        )}

        <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-6 rounded-2xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700">
            <WinIcon name="edge" size={48} className="mx-auto mb-4" />
            <h3 className="text-base font-bold mb-2">Microsoft Edge Secure Web View</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
              Navigating to: <span className="font-mono text-sky-500">{activeTab.url}</span>
            </p>
            <div className="p-3 rounded-lg bg-neutral-200/50 dark:bg-neutral-900/50 text-left text-xs mb-4 font-sans space-y-2">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Featured Web Search Results:</div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                • <strong>Windows 11 Documentation:</strong> Architecture, Fluent Design System, and App APIs.
              </p>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                • <strong>Web Standards:</strong> HTML5 Canvas, Web Audio API, and local client sandboxing.
              </p>
            </div>
            <button
              onClick={() => handleNavigate('https://www.bing.com')}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
            >
              Search Bing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
