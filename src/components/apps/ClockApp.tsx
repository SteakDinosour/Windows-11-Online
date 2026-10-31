import React, { useState, useEffect } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const ClockApp: React.FC = () => {
  const [tab, setTab] = useState<'stopwatch' | 'timer' | 'world'>('stopwatch');

  // Stopwatch state
  const [swTime, setSwTime] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer state
  const [timerMinutes, setTimerMinutes] = useState<number>(5);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [timerRemaining, setTimerRemaining] = useState<number>(300);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Stopwatch interval
  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => setSwTime(t => t + 10), 10);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setTimerRunning(false);
            soundManager.playNotification();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatSwTime = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  const formatTimerTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Sidebar */}
      <div className="w-48 p-2 border-r border-neutral-200 dark:border-neutral-800 flex flex-col gap-1 bg-neutral-50 dark:bg-[#252525] text-xs font-semibold">
        {[
          { id: 'stopwatch', label: 'Stopwatch', icon: 'clock' },
          { id: 'timer', label: 'Timer', icon: 'clock' },
          { id: 'world', label: 'World Clock', icon: 'globe' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => {
              soundManager.playClick();
              setTab(item.id as any);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors text-left ${
              tab === item.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <WinIcon name={item.icon} size={15} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        {/* Stopwatch */}
        {tab === 'stopwatch' && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="text-5xl font-mono tabular-nums font-bold mb-6 text-slate-900 dark:text-white">
              {formatSwTime(swTime)}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSwRunning(!swRunning);
                }}
                className={`px-6 py-2 rounded-full font-semibold text-xs text-white transition-colors shadow-sm ${
                  swRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {swRunning ? 'Pause' : 'Start'}
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  if (swRunning) {
                    setLaps(prev => [swTime, ...prev]);
                  } else {
                    setSwTime(0);
                    setLaps([]);
                  }
                }}
                className="px-5 py-2 rounded-full font-semibold text-xs bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                {swRunning ? 'Lap' : 'Reset'}
              </button>
            </div>

            {/* Lap Table */}
            {laps.length > 0 && (
              <div className="w-full max-h-40 overflow-y-auto border-t border-neutral-200 dark:border-neutral-800 pt-3 space-y-1.5 text-xs">
                {laps.map((lap, idx) => (
                  <div key={idx} className="flex justify-between font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                    <span>Lap {laps.length - idx}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{formatSwTime(lap)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timer */}
        {tab === 'timer' && (
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="text-5xl font-mono tabular-nums font-bold mb-6 text-slate-900 dark:text-white">
              {formatTimerTime(timerRemaining)}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setTimerRunning(!timerRunning);
                }}
                className={`px-6 py-2 rounded-full font-semibold text-xs text-white transition-colors shadow-sm ${
                  timerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  setTimerRunning(false);
                  setTimerRemaining(timerMinutes * 60 + timerSeconds);
                }}
                className="px-5 py-2 rounded-full font-semibold text-xs bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              >
                Reset
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <label className="flex items-center gap-1">
                <span>Minutes:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerMinutes}
                  onChange={e => {
                    const m = parseInt(e.target.value) || 0;
                    setTimerMinutes(m);
                    if (!timerRunning) setTimerRemaining(m * 60 + timerSeconds);
                  }}
                  className="w-14 p-1 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-center outline-none"
                />
              </label>
              <label className="flex items-center gap-1">
                <span>Seconds:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={timerSeconds}
                  onChange={e => {
                    const s = parseInt(e.target.value) || 0;
                    setTimerSeconds(s);
                    if (!timerRunning) setTimerRemaining(timerMinutes * 60 + s);
                  }}
                  className="w-14 p-1 rounded bg-neutral-200 dark:bg-neutral-700 font-mono text-center outline-none"
                />
              </label>
            </div>
          </div>
        )}

        {/* World Clock */}
        {tab === 'world' && (
          <div className="w-full max-w-md space-y-3">
            {[
              { city: 'Redmond, USA', zone: 'Pacific Time', diff: 'Local Time', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              { city: 'London, UK', zone: 'GMT', diff: '+8 hours', time: new Date(Date.now() + 8 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
              { city: 'Tokyo, Japan', zone: 'JST', diff: '+17 hours', time: new Date(Date.now() + 17 * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
            ].map(c => (
              <div
                key={c.city}
                className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="font-bold text-sm">{c.city}</h4>
                  <span className="text-xs text-neutral-400">{c.diff} · {c.zone}</span>
                </div>
                <span className="text-2xl font-bold font-mono tabular-nums text-sky-500">{c.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
