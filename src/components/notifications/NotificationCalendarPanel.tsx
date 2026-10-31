import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const NotificationCalendarPanel: React.FC = () => {
  const { isCalendarOpen, notifications, clearNotifications, markNotificationRead, openWindow, closeAllPopups } = useOS();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [focusTime, setFocusTime] = useState<number>(25);
  const [isFocusActive, setIsFocusActive] = useState<boolean>(false);

  if (!isCalendarOpen) return null;

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div
      className="fixed right-4 bottom-14 z-[9900] w-[380px] max-w-[94vw] h-[660px] max-h-[85vh] rounded-2xl mica-surface border border-neutral-300 dark:border-neutral-700/80 win11-flyout-shadow flex flex-col overflow-hidden animate-win11-start text-slate-800 dark:text-slate-100"
      onClick={e => e.stopPropagation()}
    >
      {/* Top Section: Notifications */}
      <div className="p-4 border-b border-neutral-300/60 dark:border-neutral-700/60 max-h-56 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Notifications ({notifications.length})
          </span>
          {notifications.length > 0 && (
            <button
              onClick={() => {
                soundManager.playClick();
                clearNotifications();
              }}
              className="text-[11px] font-medium text-sky-500 hover:text-sky-600 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-6 text-center text-xs text-neutral-400">
            No new notifications
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-2.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                  notif.read
                    ? 'bg-neutral-200/30 dark:bg-neutral-800/30 border-neutral-300/40 dark:border-neutral-700/40 opacity-70'
                    : 'bg-neutral-200/60 dark:bg-neutral-800/60 border-neutral-300/80 dark:border-neutral-700/70 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                  <span className="font-semibold text-sky-500">{notif.app}</span>
                  <span className="font-mono tabular-nums">{notif.time}</span>
                </div>
                <h5 className="font-semibold text-slate-800 dark:text-slate-100 mb-0.5">{notif.title}</h5>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-300 leading-snug">{notif.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar Section */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleJumpToday}
              className="text-[10px] px-2 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800/50 text-neutral-500 hover:text-slate-900 dark:hover:text-slate-100 font-medium"
            >
              Today
            </button>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevMonth}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
            >
              <WinIcon name="chevron-left" size={14} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1 rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
            >
              <WinIcon name="chevron-right" size={14} />
            </button>
          </div>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-neutral-400 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <span key={d}>{d}</span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7" />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday =
              dayNum === today.getDate() &&
              month === today.getMonth() &&
              year === today.getFullYear();

            return (
              <button
                key={dayNum}
                onClick={() => {
                  openWindow('calendar');
                  closeAllPopups();
                }}
                className={`h-7 rounded-full flex items-center justify-center font-mono tabular-nums transition-colors ${
                  isToday
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'hover:bg-neutral-200/70 dark:hover:bg-neutral-700/70 text-slate-700 dark:text-slate-200'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>

        {/* Focus Session Widget */}
        <div className="mt-4 pt-3 border-t border-neutral-300/60 dark:border-neutral-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <WinIcon name="clock" size={16} className="text-sky-500" />
            <span className="font-medium">Focus session</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono tabular-nums text-xs font-semibold px-2 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800/50">
              <span>{focusTime} mins</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClick();
                setIsFocusActive(prev => !prev);
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                isFocusActive
                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isFocusActive ? 'Pause' : 'Start'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
