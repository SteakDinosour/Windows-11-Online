import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface RecordingItem {
  id: string;
  name: string;
  duration: number;
  date: string;
  url?: string;
}

export const VoiceRecorderApp: React.FC = () => {
  const { addNotification } = useOS();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSecs, setRecordSecs] = useState<number>(0);
  const [recordings, setRecordings] = useState<RecordingItem[]>([
    { id: '1', name: 'Voice Note 1.m4a', duration: 14, date: '2026-10-29' },
  ]);
  const [selectedId, setSelectedId] = useState<string>('1');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordSecs(s => s + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const handleStartRecord = async () => {
    soundManager.playClick();
    setRecordSecs(0);
    setIsRecording(true);

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
      }
    } catch {
      // Audio capture simulated fallback
    }
  };

  const handleStopRecord = () => {
    soundManager.playClick();
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    const newRec: RecordingItem = {
      id: Date.now().toString(),
      name: `Recording (${recordings.length + 1}).m4a`,
      duration: recordSecs || 5,
      date: new Date().toISOString().split('T')[0],
    };

    setRecordings(prev => [newRec, ...prev]);
    setSelectedId(newRec.id);
    fileSystem.createItem(newRec.name, 'file', 'music', 'audio-binary', 'm4a');
    addNotification('Voice Recorder', `Saved ${newRec.name} to Music`, 'Voice Recorder');
  };

  const formatSecs = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Recordings List */}
      <div className="w-56 p-3 border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between bg-neutral-50 dark:bg-[#252525]">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block mb-2">Recordings</span>
          <div className="space-y-1">
            {recordings.map(rec => (
              <button
                key={rec.id}
                onClick={() => setSelectedId(rec.id)}
                className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors ${
                  selectedId === rec.id
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'hover:bg-neutral-200 dark:hover:bg-neutral-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="truncate">{rec.name}</div>
                <div className="flex justify-between text-[10px] opacity-70 mt-1 font-mono">
                  <span>{formatSecs(rec.duration)}</span>
                  <span>{rec.date}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recording Studio Viewport */}
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
        {/* Animated Waveform Visualizer */}
        <div className="flex items-center gap-1.5 h-16 mb-6">
          {Array.from({ length: 32 }).map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-neutral-400 dark:bg-neutral-600 h-2'
              }`}
              style={{
                height: isRecording ? `${Math.sin(i * 0.5 + recordSecs) * 20 + 24}px` : '4px',
              }}
            />
          ))}
        </div>

        <div className="text-4xl font-mono tabular-nums font-bold mb-6">
          {formatSecs(recordSecs)}
        </div>

        {/* Record / Stop Button */}
        <button
          onClick={isRecording ? handleStopRecord : handleStartRecord}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-lg ${
            isRecording ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
          }`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          <WinIcon name="mic" size={26} />
        </button>
        <span className="text-xs text-neutral-400 mt-3">
          {isRecording ? 'Recording in progress...' : 'Click to start recording'}
        </span>
      </div>
    </div>
  );
};
