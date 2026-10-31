import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
}

export const WidgetsBoard: React.FC = () => {
  const { isWidgetsOpen, closeAllPopups } = useOS();

  const [todos, setTodos] = useState<TodoItem[]>([
    { id: '1', text: 'Review Windows 11 Fluent updates', done: true },
    { id: '2', text: 'Prepare quarterly financial models', done: false },
    { id: '3', text: 'Deploy web applet package', done: false },
  ]);
  const [newTodoText, setNewTodoText] = useState('');

  const [stocks] = useState([
    { symbol: 'MSFT', name: 'Microsoft Corp', price: '428.15', change: '+1.84%', positive: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp', price: '138.25', change: '+3.12%', positive: true },
    { symbol: 'AAPL', name: 'Apple Inc', price: '231.40', change: '-0.42%', positive: false },
    { symbol: 'GOOGL', name: 'Alphabet Inc', price: '178.60', change: '+0.95%', positive: true },
  ]);

  const [news] = useState([
    {
      id: 1,
      source: 'Technology News',
      time: '1h ago',
      title: 'Next-Generation Operating Systems Embrace Web-Native Sandboxing',
      summary: 'Frontend architectures now power desktop-class multitasking with fluent interfaces.',
    },
    {
      id: 2,
      source: 'Market Watch',
      time: '3h ago',
      title: 'Cloud Computing & AI Hardware Reach Record Q3 Shipments',
      summary: 'Enterprise demand continues surge across data platforms and specialized accelerators.',
    },
    {
      id: 3,
      source: 'Science & Discovery',
      time: '5h ago',
      title: 'Deep Space Telescope Unveils New Exoplanetary Atmospheres',
      summary: 'Astronomers detect unique molecular signatures in nearby stellar system.',
    },
  ]);

  if (!isWidgetsOpen) return null;

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setTodos(prev => [...prev, { id: Date.now().toString(), text: newTodoText.trim(), done: false }]);
    setNewTodoText('');
  };

  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div
      className="fixed left-4 bottom-14 z-[9900] w-[640px] max-w-[94vw] h-[680px] max-h-[85vh] rounded-2xl mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow flex flex-col overflow-hidden animate-win11-start text-slate-800 dark:text-slate-100"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="p-4 px-6 border-b border-neutral-200/80 dark:border-neutral-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <WinIcon name="sun" size={20} className="text-amber-500" />
          <h2 className="font-semibold text-sm">Widgets Board</h2>
        </div>
        <button
          onClick={closeAllPopups}
          className="p-1 rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 transition-colors"
        >
          <WinIcon name="close" size={16} />
        </button>
      </div>

      {/* Widgets Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Weather Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/20 via-blue-500/10 to-transparent border border-sky-400/30 dark:border-sky-500/20 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">Current Location</span>
              <h3 className="text-base font-bold">Redmond, WA</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Mostly Sunny · Wind 6 mph</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold font-mono tabular-nums text-amber-500">72°F</span>
              <p className="text-[11px] text-neutral-400 font-mono tabular-nums">H: 76° · L: 58°</p>
            </div>
          </div>

          {/* Hourly Forecast */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-sky-400/20 text-center text-xs">
            {['12 PM', '3 PM', '6 PM', '9 PM'].map((hr, idx) => (
              <div key={hr} className="flex flex-col items-center">
                <span className="text-[10px] text-neutral-400">{hr}</span>
                <WinIcon name="sun" size={14} className="my-1 text-amber-400" />
                <span className="font-mono tabular-nums font-semibold">{72 - idx * 2}°</span>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column: Stocks & To-Do */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stock Market Widget */}
          <div className="p-4 rounded-xl bg-neutral-200/40 dark:bg-neutral-800/40 border border-neutral-300/80 dark:border-neutral-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Watchlist</h4>
              <span className="text-[10px] text-neutral-400">Markets Open</span>
            </div>
            <div className="space-y-2">
              {stocks.map(st => (
                <div key={st.symbol} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold">{st.symbol}</span>
                    <span className="text-[10px] text-neutral-400 block truncate max-w-[100px]">{st.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono tabular-nums font-semibold block">${st.price}</span>
                    <span
                      className={`text-[10px] font-mono tabular-nums font-semibold ${
                        st.positive ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {st.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive To-Do Widget */}
          <div className="p-4 rounded-xl bg-neutral-200/40 dark:bg-neutral-800/40 border border-neutral-300/80 dark:border-neutral-700/60 shadow-sm flex flex-col">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-2">To Do</h4>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-36 mb-2">
              {todos.map(t => (
                <div key={t.id} className="flex items-center justify-between group text-xs">
                  <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggleTodo(t.id)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                    <span className={`truncate ${t.done ? 'line-through text-neutral-400' : 'font-medium'}`}>
                      {t.text}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTodo(t.id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-500 p-0.5"
                  >
                    <WinIcon name="close" size={12} />
                  </button>
                </div>
              ))}
            </div>
            <form onSubmit={handleAddTodo} className="flex items-center gap-1.5 pt-2 border-t border-neutral-300/60 dark:border-neutral-700/60">
              <input
                type="text"
                placeholder="Add a task..."
                value={newTodoText}
                onChange={e => setNewTodoText(e.target.value)}
                className="flex-1 text-xs px-2 py-1 rounded bg-neutral-300/50 dark:bg-neutral-700/50 outline-none"
              />
              <button type="submit" className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                Add
              </button>
            </form>
          </div>
        </div>

        {/* News Feed */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Top Stories</h4>
          {news.map(item => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-neutral-200/40 dark:bg-neutral-800/40 border border-neutral-300/80 dark:border-neutral-700/60 hover:border-sky-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                <span className="font-medium text-sky-500">{item.source}</span>
                <span>{item.time}</span>
              </div>
              <h5 className="text-xs font-semibold leading-snug">{item.title}</h5>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{item.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
