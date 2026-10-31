import React, { useState } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';
import { useOS } from '../../context/OSContext';

interface StoreAppItem {
  id: string;
  name: string;
  category: 'Productivity' | 'Utilities' | 'Creative' | 'Gaming';
  rating: number;
  reviews: string;
  icon: string;
  description: string;
  installed?: boolean;
  installing?: boolean;
  progress?: number;
}

// Official installer and web sources for each Store app. "Get" opens the
// official installer (a real download); "Open" launches the app.
const OFFICIAL_LINKS: Record<string, { download: string; web?: string }> = {
  vscode: { download: 'https://code.visualstudio.com/Download', web: 'https://vscode.dev' },
  spotify: { download: 'https://www.spotify.com/download/', web: 'https://open.spotify.com' },
  figma: { download: 'https://www.figma.com/downloads/', web: 'https://www.figma.com' },
  minecraft: { download: 'https://www.minecraft.net/en-us/download', web: 'https://www.minecraft.net' },
  discord: { download: 'https://discord.com/download', web: 'https://discord.com/app' },
  blender: { download: 'https://www.blender.org/download/', web: 'https://www.blender.org' },
  vlc: { download: 'https://www.videolan.org/vlc/' },
};

export const MicrosoftStoreApp: React.FC = () => {
  const { installedAppIds, installApp, uninstallApp, openWindow } = useOS();
  const [tab, setTab] = useState<'home' | 'apps' | 'gaming' | 'library'>('home');
  const [search, setSearch] = useState('');
  const [apps, setApps] = useState<StoreAppItem[]>([
    {
      id: 'vscode',
      name: 'Visual Studio Code',
      category: 'Productivity',
      rating: 4.9,
      reviews: '34.2K',
      icon: 'vscode',
      description: 'Code editing redefined. Build and debug modern web and cloud applications with rich language color support.',
    },
    {
      id: 'spotify',
      name: 'Spotify Music',
      category: 'Creative',
      rating: 4.8,
      reviews: '128K',
      icon: 'music',
      description: 'Listen to your favorite songs, podcasts, and curated playlists seamlessly.',
      installed: false,
    },
    {
      id: 'figma',
      name: 'Figma Design',
      category: 'Creative',
      rating: 4.9,
      reviews: '19.4K',
      icon: 'palette',
      description: 'The collaborative interface design tool for teams and product creators.',
      installed: false,
    },
    {
      id: 'minecraft',
      name: 'Minecraft: Bedrock Edition',
      category: 'Gaming',
      rating: 4.7,
      reviews: '412K',
      icon: 'presentation',
      description: 'Build, explore, and survive in infinite voxel worlds alone or with friends.',
      installed: false,
    },
    {
      id: 'discord',
      name: 'Discord',
      category: 'Productivity',
      rating: 4.6,
      reviews: '85K',
      icon: 'globe',
      description: 'Voice, video, and text communication service for gaming communities and teams.',
      installed: false,
    },
    {
      id: 'blender',
      name: 'Blender 3D Suite',
      category: 'Creative',
      rating: 4.9,
      reviews: '52K',
      icon: 'image',
      description: 'Open source 3D creation suite supporting modeling, rigging, animation, and rendering.',
      installed: false,
    },
    {
      id: 'vlc',
      name: 'VLC Media Player',
      category: 'Utilities',
      rating: 4.7,
      reviews: '94K',
      icon: 'play-circle',
      description: 'Free and open source cross-platform multimedia player and framework.',
      installed: true,
    },
  ]);

  const isInstalled = (id: string) => installedAppIds.includes(id);

  const openStoreApp = (id: string) => {
    soundManager.playClick();
    if (id === 'vscode') return openWindow('vscode');
    if (id === 'vlc') return openWindow('mediaplayer');
    const link = OFFICIAL_LINKS[id];
    if (link?.web) window.open(link.web, '_blank', 'noopener');
  };

  const handleInstall = async (id: string) => {
    soundManager.playClick();
    const link = OFFICIAL_LINKS[id];
    if (link?.download) window.open(link.download, '_blank', 'noopener');
    setApps(prev =>
      prev.map(a => (a.id === id ? { ...a, installing: true, progress: 10 } : a))
    );

    let currentP = 10;
    const interval = setInterval(() => {
      currentP += 25;
      if (currentP >= 100) {
        clearInterval(interval);
        installApp(id);
        setApps(prev =>
          prev.map(a => (a.id === id ? { ...a, installing: false, progress: 100 } : a))
        );
      } else {
        setApps(prev =>
          prev.map(a => (a.id === id ? { ...a, progress: currentP } : a))
        );
      }
    }, 280);
  };

  const handleUninstall = (id: string) => {
    soundManager.playClick();
    uninstallApp(id);
    setApps(prev =>
      prev.map(a => (a.id === id ? { ...a, progress: 0 } : a))
    );
  };

  const filteredApps = apps.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const installed = isInstalled(a.id);
    if (tab === 'home') return matchesSearch;
    if (tab === 'apps') return matchesSearch && a.category !== 'Gaming';
    if (tab === 'gaming') return matchesSearch && a.category === 'Gaming';
    if (tab === 'library') return matchesSearch && installed;
    return matchesSearch;
  });

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#191919] text-slate-800 dark:text-slate-100 select-none">
      {/* Sidebar */}
      <div className="w-52 p-3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 bg-neutral-50/70 dark:bg-[#1c1c1c]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 px-3 py-2 mb-3">
            <WinIcon name="shopping-bag" size={20} className="text-sky-500" />
            <span className="font-bold text-sm">Microsoft Store</span>
          </div>

          {[
            { id: 'home', label: 'Home', icon: 'layout-grid' },
            { id: 'apps', label: 'Apps', icon: 'folder' },
            { id: 'gaming', label: 'Gaming', icon: 'presentation' },
            { id: 'library', label: 'Library', icon: 'download' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playClick();
                setTab(item.id as any);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                tab === item.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-neutral-200/60 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <WinIcon name={item.icon} size={16} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-neutral-200/50 dark:bg-neutral-800/50 text-xs">
          <span className="font-semibold block mb-1">Downloads & updates</span>
          <span className="text-[11px] text-neutral-400">All apps up to date</span>
        </div>
      </div>

      {/* Main Store Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Search bar */}
        <div className="h-12 px-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-[#1a1a1a]">
          <div className="w-80 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#282828] border border-neutral-300 dark:border-neutral-700 text-xs">
            <WinIcon name="search" size={14} className="text-neutral-400" />
            <input
              type="text"
              placeholder="Search apps, games, movies and more..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Store Catalog Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero Featured Card (on Home tab) */}
          {tab === 'home' && !search && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-sky-500 text-white shadow-lg flex items-center justify-between">
              <div className="max-w-md">
                <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded">Featured Essential</span>
                <h2 className="text-2xl font-bold mt-2">Visual Studio Code</h2>
                <p className="text-xs text-blue-100 mt-1">Lightweight, versatile code editing for modern software development.</p>
                {isInstalled('vscode') ? (
                  <button
                    onClick={() => openWindow('vscode')}
                    className="mt-4 px-5 py-2 rounded-lg bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow flex items-center gap-1.5"
                  >
                    <span>Open App</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall('vscode')}
                    className="mt-4 px-5 py-2 rounded-lg bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-colors shadow"
                  >
                    Get Free
                  </button>
                )}
              </div>
              <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <WinIcon name="vscode" size={48} className="text-white" />
              </div>
            </div>
          )}

          {/* Apps List */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
              {tab === 'library' ? 'Installed Applications' : 'Top Free Apps & Games'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApps.map(item => {
                const installed = isInstalled(item.id);

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                        <WinIcon name={item.icon} size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-xs truncate">{item.name}</h4>
                        <span className="text-[10px] text-neutral-400 block">{item.category}</span>
                        <div className="flex items-center gap-1 mt-1 text-[10px] font-mono tabular-nums text-amber-500">
                          <span>★ {item.rating}</span>
                          <span className="text-neutral-400">({item.reviews})</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-3 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Free</span>

                      {item.installing ? (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="w-20 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 transition-all duration-300"
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono tabular-nums">{item.progress}%</span>
                        </div>
                      ) : installed ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openStoreApp(item.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleUninstall(item.id)}
                            className="px-2 py-1 rounded bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs font-medium hover:text-red-500 transition-colors"
                          >
                            Uninstall
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInstall(item.id)}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
                        >
                          Get
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
