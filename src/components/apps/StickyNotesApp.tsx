import React, { useState, useEffect } from 'react';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface Note {
  id: string;
  text: string;
  color: 'yellow' | 'green' | 'pink' | 'blue' | 'purple';
}

export const StickyNotesApp: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('win11_stickynotes_v1');
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', text: 'Quarterly review notes:\n• Fluent Design consistency\n• Performance benchmarking\n• Team presentation next Tuesday', color: 'yellow' },
            { id: '2', text: 'Reminder: Check Windows Update build 26100 release notes.', color: 'blue' },
          ];
    } catch {
      return [{ id: '1', text: 'Welcome to Sticky Notes!', color: 'yellow' }];
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string>(notes[0]?.id || '1');

  useEffect(() => {
    try {
      localStorage.setItem('win11_stickynotes_v1', JSON.stringify(notes));
    } catch {}
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeNoteId) || notes[0];

  const handleAddNote = () => {
    soundManager.playClick();
    const colors: ('yellow' | 'green' | 'pink' | 'blue' | 'purple')[] = ['yellow', 'green', 'pink', 'blue', 'purple'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const newNote: Note = {
      id: Date.now().toString(),
      text: '',
      color: randomColor,
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    soundManager.playTrash();
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (activeNoteId === id && remaining.length > 0) {
      setActiveNoteId(remaining[0].id);
    }
  };

  const handleUpdateText = (text: string) => {
    setNotes(prev => prev.map(n => (n.id === activeNoteId ? { ...n, text } : n)));
  };

  const handleUpdateColor = (color: Note['color']) => {
    setNotes(prev => prev.map(n => (n.id === activeNoteId ? { ...n, color } : n)));
  };

  const colorBgMap: Record<Note['color'], string> = {
    yellow: 'bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100',
    green: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-100',
    pink: 'bg-pink-100 dark:bg-pink-900/60 text-pink-950 dark:text-pink-100',
    blue: 'bg-sky-100 dark:bg-sky-900/60 text-sky-950 dark:text-sky-100',
    purple: 'bg-purple-100 dark:bg-purple-900/60 text-purple-950 dark:text-purple-100',
  };

  return (
    <div className={`flex flex-col h-full w-full select-none transition-colors ${colorBgMap[activeNote?.color || 'yellow']}`}>
      {/* Header Bar */}
      <div className="h-9 px-3 flex items-center justify-between border-b border-black/10 dark:border-white/10">
        <button
          onClick={handleAddNote}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10"
          title="New Note"
        >
          <WinIcon name="plus" size={15} />
        </button>

        {/* Color Palette Dots */}
        <div className="flex items-center gap-1.5">
          {(['yellow', 'green', 'pink', 'blue', 'purple'] as const).map(c => (
            <button
              key={c}
              onClick={() => handleUpdateColor(c)}
              className={`w-3.5 h-3.5 rounded-full border border-black/20 ${activeNote?.color === c ? 'ring-2 ring-blue-500 scale-110' : ''}`}
              style={{
                backgroundColor:
                  c === 'yellow' ? '#fde047' : c === 'green' ? '#86efac' : c === 'pink' ? '#f472b6' : c === 'blue' ? '#7dd3fc' : '#c084fc',
              }}
            />
          ))}
        </div>

        <button
          onClick={() => handleDeleteNote(activeNoteId)}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-red-600 dark:text-red-400"
          title="Delete Note"
        >
          <WinIcon name="trash-2" size={14} />
        </button>
      </div>

      {/* Note Textarea */}
      <textarea
        value={activeNote?.text || ''}
        onChange={e => handleUpdateText(e.target.value)}
        placeholder="Take a note..."
        className="flex-1 w-full p-4 bg-transparent resize-none outline-none text-xs leading-relaxed font-sans select-text"
      />
    </div>
  );
};
