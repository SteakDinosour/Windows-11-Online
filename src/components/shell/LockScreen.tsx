import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { USER_AVATAR, WALLPAPERS } from '../../config/wallpapers';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const LockScreen: React.FC = () => {
  const {
    isLocked,
    unlockSystem,
    isSleeping,
    wakeSystem,
    isShutDown,
    powerOnSystem,
    isRestarting,
    settings,
  } = useOS();

  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [pin, setPin] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sleep Screen
  if (isSleeping) {
    return (
      <div
        onClick={wakeSystem}
        onKeyDown={wakeSystem}
        className="fixed inset-0 z-[50000] bg-black cursor-pointer flex items-center justify-center text-neutral-600 text-xs select-none"
      >
        <span className="opacity-40 animate-pulse">Press any key or click to wake system...</span>
      </div>
    );
  }

  // Shut Down Screen
  if (isShutDown) {
    return (
      <div className="fixed inset-0 z-[50000] bg-black flex flex-col items-center justify-center text-white select-none">
        <button
          onClick={powerOnSystem}
          className="group flex flex-col items-center gap-3 p-6 rounded-2xl hover:bg-white/5 transition-all"
        >
          <div className="w-20 h-20 rounded-full border-2 border-neutral-700 group-hover:border-sky-500 flex items-center justify-center text-neutral-400 group-hover:text-sky-400 transition-colors shadow-2xl">
            <WinIcon name="power" size={32} />
          </div>
          <span className="text-sm font-semibold text-neutral-400 group-hover:text-white transition-colors">
            Power On
          </span>
        </button>
      </div>
    );
  }

  // Restarting Screen
  if (isRestarting) {
    return (
      <div className="fixed inset-0 z-[50000] bg-[#001224] flex flex-col items-center justify-center text-white select-none">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-6" />
        <h3 className="text-xl font-light tracking-wide">Restarting</h3>
      </div>
    );
  }

  if (!isLocked) return null;

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    soundManager.playClick();
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      setShowLogin(false);
      setPin('');
      unlockSystem();
    }, 1200);
  };

  const timeStr = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const dateStr = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      className="fixed inset-0 z-[40000] bg-cover bg-center select-none flex flex-col justify-between p-12 text-white animate-win11-open"
      style={{
        backgroundImage: `url('${settings.wallpaper || WALLPAPERS[0].src}')`,
      }}
      onClick={() => {
        if (!showLogin) setShowLogin(true);
      }}
    >
      {/* Dimming layer */}
      <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] pointer-events-none" />

      {/* Lock Screen View (Phase 1) */}
      {!showLogin ? (
        <div className="relative z-10 flex flex-col justify-between h-full cursor-pointer">
          <div className="text-left mt-8">
            <div className="text-8xl font-light font-mono tabular-nums tracking-tight drop-shadow-lg">
              {timeStr}
            </div>
            <div className="text-2xl font-normal drop-shadow-md mt-1">
              {dateStr}
            </div>
          </div>

          <div className="self-center mb-8 flex flex-col items-center gap-2 text-sm text-white/80 animate-bounce">
            <span>Click or press Enter to unlock</span>
          </div>

          <div className="self-end flex items-center gap-4 text-white/90">
            <WinIcon name="wifi" size={18} />
            <WinIcon name="battery" size={18} />
          </div>
        </div>
      ) : (
        // Login Credentials Screen (Phase 2)
        <div
          className="relative z-10 flex flex-col items-center justify-center h-full max-w-sm mx-auto"
          onClick={e => e.stopPropagation()}
        >
          <img
            src={USER_AVATAR}
            alt="User Profile"
            className="w-28 h-28 rounded-full object-cover ring-4 ring-white/30 shadow-2xl mb-4"
            referrerPolicy="no-referrer"
          />

          <h2 className="text-2xl font-bold mb-4 drop-shadow">User</h2>

          {isAuthenticating ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <div className="w-8 h-8 border-3 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-medium">Welcome</span>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="w-full flex flex-col items-center gap-3">
              <div className="relative w-full">
                <input
                  type="password"
                  autoFocus
                  placeholder="PIN or Password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/20 text-white placeholder-white/50 text-sm outline-none focus:border-sky-400 text-center font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/20 text-white/80"
                >
                  <WinIcon name="chevron-right" size={16} />
                </button>
              </div>

              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-md transition-colors"
              >
                Sign In
              </button>
            </form>
          )}

          {/* Bottom Cancel / Back to lock */}
          <button
            onClick={() => setShowLogin(false)}
            className="mt-8 text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
