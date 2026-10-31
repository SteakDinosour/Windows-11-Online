import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

export const CameraApp: React.FC = () => {
  const { addNotification } = useOS();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [streamActive, setStreamActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then(stream => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
            setStreamActive(true);
          }
        })
        .catch(() => {
          setStreamActive(false);
        });
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    soundManager.playClick();
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) {
        clearInterval(interval);
        setCountdown(null);
        soundManager.playShutter();

        // Capture frame from video or fallback canvas
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (streamActive && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, 640, 480);
          } else {
            // Simulated photo booth selfie
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, 640, 480);
            ctx.fillStyle = '#38bdf8';
            ctx.font = '24px sans-serif';
            ctx.fillText('Windows 11 Photo Snapshot', 160, 240);
          }

          const dataUrl = canvas.toDataURL('image/jpeg');
          setCapturedImage(dataUrl);

          const fileName = `WIN_CAMERA_${Date.now()}.jpg`;
          fileSystem.createItem(fileName, 'file', 'pictures', dataUrl, 'jpg');
          addNotification('Camera', `Photo saved to Pictures: ${fileName}`, 'Camera');
        }
      } else {
        setCountdown(count);
      }
    }, 800);
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-white select-none relative overflow-hidden">
      {/* Video Viewport */}
      <div className="flex-1 flex items-center justify-center relative bg-neutral-950">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`max-w-full max-h-full object-contain ${streamActive ? 'scale-x-[-1]' : 'hidden'}`}
        />

        {!streamActive && (
          <div className="text-center p-6 text-neutral-400">
            <WinIcon name="camera" size={48} className="mx-auto mb-3 opacity-40" />
            <h4 className="font-semibold text-sm">Camera Ready</h4>
            <p className="text-xs text-neutral-500 mt-1">Photo booth simulation ready to capture snapshot</p>
          </div>
        )}

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
            <span className="text-8xl font-extrabold font-mono text-white animate-ping">
              {countdown}
            </span>
          </div>
        )}

        {/* Captured Snapshot Thumbnail */}
        {capturedImage && (
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-xl border-2 border-white overflow-hidden shadow-lg z-10">
            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Camera Shutter Bar */}
      <div className="h-20 bg-neutral-900/90 flex items-center justify-center border-t border-neutral-800">
        <button
          onClick={handleCapture}
          disabled={countdown !== null}
          className="w-14 h-14 rounded-full border-4 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          title="Take Photo"
        >
          <div className="w-10 h-10 rounded-full bg-white" />
        </button>
      </div>
    </div>
  );
};
