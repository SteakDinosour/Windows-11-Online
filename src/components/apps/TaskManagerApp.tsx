import React, { useState, useEffect, useRef } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface ProcessItem {
  id: string;
  name: string;
  icon: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  isSystem?: boolean;
  windowId?: string;
}

export const TaskManagerApp: React.FC = () => {
  const { windows, closeWindow } = useOS();

  const [activeTab, setActiveTab] = useState<'processes' | 'performance' | 'startup'>('processes');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 18, 15, 24, 20, 16, 28, 22, 19, 25, 18, 21]);
  const [memHistory, setMemHistory] = useState<number[]>([42, 42, 43, 44, 43, 45, 44, 43, 44, 45, 45, 44]);
  const cpuCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Combine real open windows with simulated system processes
  const processes: ProcessItem[] = [
    ...windows.map(w => ({
      id: w.id,
      name: w.title,
      icon: w.icon,
      cpu: Math.floor(Math.random() * 8) + 1,
      memory: Math.floor(Math.random() * 80) + 120,
      disk: +(Math.random() * 1.5).toFixed(1),
      network: +(Math.random() * 2.2).toFixed(1),
      windowId: w.id,
    })),
    { id: 'sys-dwm', name: 'Desktop Window Manager', icon: 'monitor', cpu: 2, memory: 84, disk: 0.1, network: 0.0, isSystem: true },
    { id: 'sys-exp', name: 'Windows Explorer', icon: 'folder', cpu: 1, memory: 142, disk: 0.3, network: 0.0, isSystem: true },
    { id: 'sys-sec', name: 'Antimalware Service Executable', icon: 'shield-check', cpu: 3, memory: 198, disk: 1.2, network: 0.1, isSystem: true },
    { id: 'sys-aud', name: 'Windows Audio Device Graph', icon: 'volume-2', cpu: 0, memory: 34, disk: 0.0, network: 0.0, isSystem: true },
    { id: 'sys-net', name: 'Network Connection Broker', icon: 'wifi', cpu: 0, memory: 28, disk: 0.0, network: 0.2, isSystem: true },
  ];

  // Update performance graph every second
  useEffect(() => {
    const timer = setInterval(() => {
      const nextCpu = Math.floor(Math.random() * 15) + 12;
      const nextMem = Math.floor(Math.random() * 4) + 42;
      setCpuHistory(prev => [...prev.slice(1), nextCpu]);
      setMemHistory(prev => [...prev.slice(1), nextMem]);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Render Performance CPU chart on canvas
  useEffect(() => {
    if (activeTab !== 'performance') return;
    const canvas = cpuCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Line curve
    ctx.strokeStyle = '#0078d4';
    ctx.lineWidth = 2;
    ctx.fillStyle = 'rgba(0, 120, 212, 0.15)';
    ctx.beginPath();

    const step = w / (cpuHistory.length - 1);
    cpuHistory.forEach((val, idx) => {
      const px = idx * step;
      const py = h - (val / 100) * h;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });

    // Fill area under line
    ctx.stroke();
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
  }, [cpuHistory, activeTab]);

  const handleEndTask = () => {
    if (!selectedProcessId) return;
    soundManager.playClick();
    const target = processes.find(p => p.id === selectedProcessId);
    if (target && target.windowId) {
      closeWindow(target.windowId);
      setSelectedProcessId(null);
    }
  };

  const totalCpu = cpuHistory[cpuHistory.length - 1] || 18;
  const totalMem = memHistory[memHistory.length - 1] || 44;

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Top Tabs */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#252525]">
        <div className="flex items-center gap-1 text-xs font-semibold">
          {[
            { id: 'processes', label: 'Processes', icon: 'activity' },
            { id: 'performance', label: 'Performance', icon: 'monitor' },
            { id: 'startup', label: 'Startup Apps', icon: 'refresh' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                soundManager.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors ${
                activeTab === t.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              <WinIcon name={t.icon} size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'processes' && (
          <button
            onClick={handleEndTask}
            disabled={!selectedProcessId || processes.find(p => p.id === selectedProcessId)?.isSystem}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white text-xs font-semibold transition-colors shadow-sm"
          >
            End task
          </button>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'processes' && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 pb-2 font-semibold">
                <th className="pb-2">Name</th>
                <th className="pb-2 text-right">CPU ({totalCpu}%)</th>
                <th className="pb-2 text-right">Memory ({totalMem}%)</th>
                <th className="pb-2 text-right">Disk</th>
                <th className="pb-2 text-right">Network</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200/50 dark:divide-neutral-800/50">
              {processes.map(proc => {
                const isSelected = selectedProcessId === proc.id;
                return (
                  <tr
                    key={proc.id}
                    onClick={() => setSelectedProcessId(proc.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-500/20'
                        : 'hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50'
                    }`}
                  >
                    <td className="py-2 flex items-center gap-2 font-medium">
                      <WinIcon name={proc.icon} size={16} />
                      <span className="truncate max-w-xs">{proc.name}</span>
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums">{proc.cpu}%</td>
                    <td className="py-2 text-right font-mono tabular-nums">{proc.memory} MB</td>
                    <td className="py-2 text-right font-mono tabular-nums">{proc.disk} MB/s</td>
                    <td className="py-2 text-right font-mono tabular-nums">{proc.network} Mbps</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-700/80">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <WinIcon name="activity" size={18} className="text-sky-500" />
                  <span className="font-bold text-sm">CPU Utilization</span>
                </div>
                <span className="font-mono tabular-nums font-bold text-lg text-sky-500">{totalCpu}%</span>
              </div>
              <canvas
                ref={cpuCanvasRef}
                width={700}
                height={160}
                className="w-full h-40 bg-neutral-100 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800"
              />
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block mb-1">Speed</span>
                <span className="text-base font-bold font-mono">3.80 GHz</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block mb-1">Processes</span>
                <span className="text-base font-bold font-mono">{processes.length}</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block mb-1">Threads</span>
                <span className="text-base font-bold font-mono">1,842</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800">
                <span className="text-neutral-400 block mb-1">Up time</span>
                <span className="text-base font-bold font-mono">0:04:32:15</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'startup' && (
          <div className="space-y-2">
            {[
              { name: 'Microsoft Edge', impact: 'High', enabled: true },
              { name: 'Microsoft OneDrive', impact: 'Medium', enabled: true },
              { name: 'Windows Security notification', impact: 'Low', enabled: true },
              { name: 'Discord', impact: 'High', enabled: false },
            ].map(app => (
              <div
                key={app.name}
                className="p-3 rounded-xl bg-white dark:bg-[#282828] border border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-semibold block">{app.name}</span>
                  <span className="text-[11px] text-neutral-400">Startup impact: {app.impact}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${app.enabled ? 'bg-emerald-500/15 text-emerald-500' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-400'}`}>
                  {app.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
