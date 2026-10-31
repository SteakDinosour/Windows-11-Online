import React, { useState, useEffect, useRef } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  notes: number[];
}

export const MediaPlayerApp: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [volume, setVolume] = useState<number>(80);

  const tracks: Track[] = [
    {
      id: 'track-1',
      title: 'Fluent Symphony (Ambient)',
      artist: 'Windows Studio Audio',
      duration: 180,
      notes: [261.63, 329.63, 392.0, 523.25, 440.0, 349.23], // C4, E4, G4, C5, A4, F4
    },
    {
      id: 'track-2',
      title: 'Horizon Sunrise',
      artist: 'Acoustic Soundscapes',
      duration: 210,
      notes: [293.66, 369.99, 440.0, 587.33, 493.88], // D4, F#4, A4, D5, B4
    },
    {
      id: 'track-3',
      title: 'Digital Petals',
      artist: 'Mica Electronic',
      duration: 165,
      notes: [329.63, 392.0, 493.88, 659.25, 587.33], // E4, G4, B4, E5, D5
    },
  ];

  const currentTrack = tracks[currentTrackIndex];
  const audioContextRef = useRef<AudioContext | null>(null);
  const noteTimerRef = useRef<any>(null);
  const progressTimerRef = useRef<any>(null);

  // Play procedural ambient tone sequences
  const playTone = (freq: number) => {
    try {
      if (!audioContextRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const targetGain = (volume / 100) * 0.15;
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(targetGain, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    if (isPlaying) {
      let noteIdx = 0;
      noteTimerRef.current = setInterval(() => {
        const notes = currentTrack.notes;
        playTone(notes[noteIdx % notes.length]);
        noteIdx++;
      }, 900);

      progressTimerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= currentTrack.duration) {
            setCurrentTrackIndex(idx => (idx + 1) % tracks.length);
            return 0;
          }
          return p + 1;
        });
      }, 1000);
    } else {
      clearInterval(noteTimerRef.current);
      clearInterval(progressTimerRef.current);
    }

    return () => {
      clearInterval(noteTimerRef.current);
      clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, currentTrack, volume]);

  const togglePlay = () => {
    soundManager.playClick();
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    soundManager.playClick();
    setCurrentTrackIndex((currentTrackIndex + 1) % tracks.length);
    setProgress(0);
  };

  const handlePrev = () => {
    soundManager.playClick();
    setCurrentTrackIndex((currentTrackIndex - 1 + tracks.length) % tracks.length);
    setProgress(0);
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-slate-100 select-none">
      {/* Visualizer & Album Art */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-48 h-48 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center border border-white/20 mb-6 transition-transform duration-500 ${isPlaying ? 'scale-105' : 'scale-100'}`}>
          <WinIcon name="play-circle" size={64} className="text-white drop-shadow-lg" />
        </div>

        <h3 className="text-lg font-bold">{currentTrack.title}</h3>
        <p className="text-xs text-neutral-400 mt-1">{currentTrack.artist}</p>

        {/* Ambient Wave Graphic */}
        <div className="flex items-center gap-1 mt-4 h-6">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-sky-500 transition-all duration-300 ${
                isPlaying ? 'animate-pulse' : 'h-1 opacity-30'
              }`}
              style={{
                height: isPlaying ? `${Math.sin(i * 0.4 + progress) * 12 + 14}px` : '4px',
                animationDelay: `${i * 50}ms`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Media Controls Bar */}
      <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 space-y-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 text-xs font-mono tabular-nums text-neutral-400">
          <span>{formatSecs(progress)}</span>
          <input
            type="range"
            min="0"
            max={currentTrack.duration}
            value={progress}
            onChange={e => setProgress(parseInt(e.target.value))}
            className="flex-1 accent-sky-500 cursor-pointer h-1 rounded bg-neutral-800"
          />
          <span>{formatSecs(currentTrack.duration)}</span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WinIcon name="volume-2" size={16} className="text-neutral-400" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={e => setVolume(parseInt(e.target.value))}
              className="w-20 accent-sky-500 cursor-pointer h-1 rounded bg-neutral-800"
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300">
              <WinIcon name="chevron-left" size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <WinIcon name={isPlaying ? 'pause' : 'play-circle'} size={20} />
            </button>
            <button onClick={handleNext} className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300">
              <WinIcon name="chevron-right" size={18} />
            </button>
          </div>

          <span className="text-xs text-neutral-400 font-medium">{currentTrackIndex + 1} of {tracks.length}</span>
        </div>
      </div>
    </div>
  );
};
