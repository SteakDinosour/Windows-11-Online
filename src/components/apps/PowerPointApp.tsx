import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
}

interface PPTProps {
  payload?: {
    fileId?: string;
    fileName?: string;
    content?: string;
  };
}

export const PowerPointApp: React.FC<PPTProps> = ({ payload }) => {
  const { addNotification } = useOS();

  const [fileName, setFileName] = useState<string>(payload?.fileName || 'Presentation1.pptx');
  const [fileId, setFileId] = useState<string | null>(payload?.fileId || null);

  const [slides, setSlides] = useState<Slide[]>(() => {
    if (payload?.content) {
      try {
        const parsed = JSON.parse(payload.content);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [
      {
        id: '1',
        title: 'Windows 11 Architecture',
        bullets: ['Fluent Design with Mica & Acrylic materials', 'Full-featured Virtual Filesystem in IndexedDB/Storage', 'Seamless multi-window desktop management'],
      },
      {
        id: '2',
        title: 'Key System Enhancements',
        bullets: ['Snap Layouts (Win+Z or hover maximize)', 'Comprehensive 11-section Windows Settings', 'High fidelity procedural Web Audio soundscapes'],
      },
      {
        id: '3',
        title: 'Roadmap & Next Steps',
        bullets: ['Expand rich application suite', 'Gaming performance widget integration', 'Accessibility screen reader with Narrator'],
      },
    ];
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isSlideshowMode, setIsSlideshowMode] = useState<boolean>(false);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const handleAddSlide = () => {
    soundManager.playClick();
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: 'New Slide Title',
      bullets: ['First bullet point', 'Second bullet point'],
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  const handleDeleteSlide = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    soundManager.playTrash();
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next);
    setCurrentSlideIndex(Math.max(0, idx - 1));
  };

  const handleUpdateTitle = (text: string) => {
    setSlides(prev =>
      prev.map((s, idx) => (idx === currentSlideIndex ? { ...s, title: text } : s))
    );
  };

  const handleUpdateBullets = (text: string) => {
    const list = text.split('\n');
    setSlides(prev =>
      prev.map((s, idx) => (idx === currentSlideIndex ? { ...s, bullets: list } : s))
    );
  };

  const handleSave = () => {
    soundManager.playClick();
    const dataStr = JSON.stringify(slides);
    if (fileId) {
      fileSystem.updateFileContent(fileId, dataStr);
      addNotification('PowerPoint', `Saved changes to ${fileName}`, 'PowerPoint');
    } else {
      const newItem = fileSystem.createItem(fileName, 'file', 'desktop', dataStr, 'pptx');
      setFileId(newItem.id);
      addNotification('PowerPoint', `Saved ${fileName} to Desktop`, 'PowerPoint');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Top Ribbon */}
      <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#282828] text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSlide}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 font-semibold"
          >
            <WinIcon name="plus" size={13} />
            <span>New Slide</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setIsSlideshowMode(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-sm"
          >
            <WinIcon name="presentation" size={13} />
            <span>Present Slideshow</span>
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 rounded bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 font-semibold"
          >
            Save Deck
          </button>
        </div>
        <span className="font-semibold text-neutral-500 font-mono text-[11px]">{fileName}</span>
      </div>

      {/* Main Split: Left Thumbnails + Right Slide Canvas */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails Column */}
        <div className="w-56 p-3 border-r border-neutral-200 dark:border-neutral-800 overflow-y-auto space-y-3 bg-neutral-50 dark:bg-[#252525]">
          {slides.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`p-2 rounded-xl border cursor-pointer transition-all relative group ${
                idx === currentSlideIndex
                  ? 'border-orange-500 ring-2 ring-orange-500/30 bg-orange-500/10'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-neutral-400 mb-1">
                <span>Slide {idx + 1}</span>
                {slides.length > 1 && (
                  <button
                    onClick={e => handleDeleteSlide(idx, e)}
                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 p-0.5"
                  >
                    <WinIcon name="trash-2" size={12} />
                  </button>
                )}
              </div>
              <div className="text-xs font-semibold truncate">{s.title || 'Untitled'}</div>
              <div className="text-[10px] text-neutral-400 truncate">{s.bullets[0] || 'Empty'}</div>
            </div>
          ))}
        </div>

        {/* Slide Canvas Editor */}
        <div className="flex-1 p-8 flex items-center justify-center bg-neutral-200/80 dark:bg-[#151515] overflow-auto">
          <div className="w-full max-w-2xl aspect-[16/9] p-10 rounded-2xl bg-white text-slate-900 shadow-2xl flex flex-col justify-between border border-neutral-300">
            <div>
              <input
                type="text"
                value={currentSlide.title}
                onChange={e => handleUpdateTitle(e.target.value)}
                placeholder="Click to add slide title..."
                className="w-full text-2xl font-bold bg-transparent outline-none border-b border-transparent focus:border-orange-500 pb-1"
              />

              <textarea
                value={currentSlide.bullets.join('\n')}
                onChange={e => handleUpdateBullets(e.target.value)}
                placeholder="Click to add bullet points (one per line)..."
                className="w-full h-44 mt-4 bg-transparent outline-none resize-none text-sm leading-relaxed border-transparent focus:border-neutral-200"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-neutral-400 font-mono">
              <span>Windows 11 Presentation</span>
              <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Slideshow Presentation Overlay */}
      {isSlideshowMode && (
        <div
          className="fixed inset-0 z-[20000] bg-black text-white flex flex-col justify-between p-12 select-none"
          onClick={() => {
            if (currentSlideIndex < slides.length - 1) {
              setCurrentSlideIndex(i => i + 1);
            } else {
              setIsSlideshowMode(false);
            }
          }}
        >
          <div className="flex justify-between items-center text-neutral-400 text-sm">
            <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsSlideshowMode(false);
              }}
              className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold text-white"
            >
              Exit (Esc)
            </button>
          </div>

          <div className="max-w-4xl mx-auto w-full my-auto">
            <h1 className="text-5xl font-extrabold text-orange-400 mb-8 tracking-tight">
              {currentSlide.title}
            </h1>
            <ul className="space-y-4 text-2xl font-light text-neutral-200 list-disc list-inside">
              {currentSlide.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </div>

          <div className="text-center text-xs text-neutral-500">
            Click anywhere or press Space/Right Arrow to advance slide
          </div>
        </div>
      )}
    </div>
  );
};
