import React, { useState } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
}

export const CalendarApp: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [events, setEvents] = useState<EventItem[]>([
    { id: '1', title: 'Windows 11 Team Sync', date: '2026-10-30', time: '10:00 AM', color: 'bg-blue-500' },
    { id: '2', title: 'Product Architecture Review', date: '2026-10-30', time: '2:30 PM', color: 'bg-emerald-500' },
    { id: '3', title: 'Release Verification', date: '2026-10-31', time: '4:00 PM', color: 'bg-purple-500' },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    soundManager.playClick();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
    setEvents(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        title: newEventTitle.trim(),
        date: dateStr,
        time: '12:00 PM',
        color: 'bg-sky-500',
      },
    ]);
    setNewEventTitle('');
  };

  const selectedDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${selectedDay.toString().padStart(2, '0')}`;
  const dayEvents = events.filter(e => e.date === selectedDateStr);

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Main Calendar Viewport */}
      <div className="flex-1 p-6 flex flex-col border-r border-neutral-200 dark:border-neutral-800">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">{monthNames[month]} {year}</h2>
            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDay(new Date().getDate());
              }}
              className="px-2.5 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-xs font-semibold"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <WinIcon name="chevron-left" size={16} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <WinIcon name="chevron-right" size={16} />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-neutral-400 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 flex-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="rounded-lg bg-neutral-200/20 dark:bg-neutral-800/20" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = selectedDay === dayNum;
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
            const hasEvents = events.some(e => e.date === dateStr);

            return (
              <button
                key={dayNum}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedDay(dayNum);
                }}
                className={`p-2 rounded-xl flex flex-col items-start justify-between border transition-all text-left ${
                  isSelected
                    ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500 font-bold'
                    : 'border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-[#282828] hover:border-neutral-400'
                }`}
              >
                <span className="text-xs font-mono tabular-nums">{dayNum}</span>
                {hasEvents && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 self-end" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Agenda Panel */}
      <div className="w-80 p-6 flex flex-col justify-between bg-neutral-50 dark:bg-[#252525]">
        <div>
          <h3 className="text-sm font-bold mb-1">Schedule for {monthNames[month]} {selectedDay}</h3>
          <p className="text-xs text-neutral-400 mb-4">{dayEvents.length} events scheduled</p>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {dayEvents.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-400">
                No events for this day
              </div>
            ) : (
              dayEvents.map(evt => (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-800 shadow-sm text-xs"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-2 h-2 rounded-full ${evt.color}`} />
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{evt.title}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono tabular-nums">{evt.time}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Add Event Form */}
        <form onSubmit={handleAddEvent} className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <input
            type="text"
            placeholder="Add new event..."
            value={newEventTitle}
            onChange={e => setNewEventTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white dark:bg-[#202020] border border-neutral-300 dark:border-neutral-700 text-xs outline-none mb-2"
          />
          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
};
