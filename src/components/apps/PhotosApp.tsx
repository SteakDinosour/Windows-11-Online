import React, { useState, useEffect } from 'react';
import { fileSystem } from '../../services/fileSystem';
import { WALLPAPERS } from '../../config/wallpapers';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface PhotoItem {
  id: string;
  name: string;
  src: string;
  date: string;
}

export const PhotosApp: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  useEffect(() => {
    // Collect wallpapers and pictures files
    const samplePhotos: PhotoItem[] = WALLPAPERS.filter(w => w.type === 'image').map(w => ({
      id: w.id,
      name: w.name,
      src: w.src,
      date: '2026-10-30',
    }));

    const fsPictures = fileSystem.getItems('pictures').filter(f => f.content && f.content.startsWith('data:image')).map(f => ({
      id: f.id,
      name: f.name,
      src: f.content!,
      date: f.updatedAt,
    }));

    const all = [...samplePhotos, ...fsPictures];
    setPhotos(all);
    if (all.length > 0) {
      setSelectedPhoto(all[0]);
    }
  }, []);

  const handleSelect = (photo: PhotoItem) => {
    soundManager.playClick();
    setSelectedPhoto(photo);
    setZoom(100);
    setRotation(0);
  };

  const handleRotate = () => {
    soundManager.playClick();
    setRotation(r => (r + 90) % 360);
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-slate-100 select-none">
      {/* Top Action Bar */}
      <div className="h-11 px-4 flex items-center justify-between border-b border-neutral-800 bg-neutral-950/80 text-xs">
        <div className="flex items-center gap-2">
          <WinIcon name="image" size={16} className="text-sky-400" />
          <span className="font-semibold truncate max-w-xs">{selectedPhoto?.name || 'Photos'}</span>
        </div>

        {selectedPhoto && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(z => Math.max(z - 15, 30))}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300"
              title="Zoom Out"
            >
              <WinIcon name="minus" size={14} />
            </button>
            <span className="font-mono tabular-nums text-xs">{zoom}%</span>
            <button
              onClick={() => setZoom(z => Math.min(z + 15, 250))}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300"
              title="Zoom In"
            >
              <WinIcon name="plus" size={14} />
            </button>
            <div className="h-4 w-px bg-neutral-800 mx-1" />
            <button
              onClick={handleRotate}
              className="p-1.5 rounded hover:bg-neutral-800 text-neutral-300"
              title="Rotate 90°"
            >
              <WinIcon name="rotate-ccw" size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 overflow-hidden relative flex items-center justify-center p-6 bg-neutral-900">
        {selectedPhoto ? (
          <img
            src={selectedPhoto.src}
            alt={selectedPhoto.name}
            className="max-w-full max-h-full object-contain transition-transform duration-200 shadow-2xl rounded-lg"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="text-neutral-500 text-xs">No photos found</div>
        )}
      </div>

      {/* Filmstrip Bottom Thumbnails */}
      <div className="h-20 px-4 flex items-center gap-2 border-t border-neutral-800 bg-neutral-950/90 overflow-x-auto">
        {photos.map(photo => (
          <button
            key={photo.id}
            onClick={() => handleSelect(photo)}
            className={`h-14 w-20 rounded-md overflow-hidden border-2 transition-all shrink-0 ${
              selectedPhoto?.id === photo.id
                ? 'border-sky-500 ring-2 ring-sky-500/50 scale-105'
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
          >
            <img
              src={photo.src}
              alt={photo.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
