import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { fileSystem } from '../../services/fileSystem';
import { WinIcon } from '../common/WinIcon';
import { soundManager } from '../../services/soundEffects';

interface WordProps {
  payload?: {
    fileId?: string;
    fileName?: string;
    content?: string;
  };
}

export const WordPadApp: React.FC<WordProps> = ({ payload }) => {
  const { addNotification } = useOS();

  const [fileName, setFileName] = useState<string>(payload?.fileName || 'Document1.docx');
  const [fileId, setFileId] = useState<string | null>(payload?.fileId || null);
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (editorRef.current && payload?.content) {
      editorRef.current.innerText = payload.content;
    }
  }, [payload]);

  const exec = (command: string, value: string | undefined = undefined) => {
    soundManager.playClick();
    document.execCommand(command, false, value);
  };

  const handleSave = () => {
    soundManager.playClick();
    const content = editorRef.current?.innerText || '';
    if (fileId) {
      fileSystem.updateFileContent(fileId, content);
      addNotification('WordPad', `Saved changes to ${fileName}`, 'WordPad');
    } else {
      const newItem = fileSystem.createItem(fileName, 'file', 'documents', content, 'docx');
      setFileId(newItem.id);
      addNotification('WordPad', `Saved ${fileName} to Documents`, 'WordPad');
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-100 dark:bg-[#1f1f1f] text-slate-800 dark:text-slate-100 select-none">
      {/* Ribbon Bar */}
      <div className="p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#282828] text-xs space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              <WinIcon name="file-text" size={13} />
              <span>Save</span>
            </button>
          </div>
          <span className="font-semibold text-neutral-500 font-mono text-[11px]">{fileName}</span>
        </div>

        {/* Formatting Tools */}
        <div className="flex items-center gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => exec('bold')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 font-bold"
            title="Bold (Ctrl+B)"
          >
            B
          </button>
          <button
            onClick={() => exec('italic')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 italic"
            title="Italic (Ctrl+I)"
          >
            I
          </button>
          <button
            onClick={() => exec('underline')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 underline"
            title="Underline (Ctrl+U)"
          >
            U
          </button>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <button
            onClick={() => exec('justifyLeft')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Align Left"
          >
            Left
          </button>
          <button
            onClick={() => exec('justifyCenter')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Center"
          >
            Center
          </button>
          <button
            onClick={() => exec('justifyRight')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Align Right"
          >
            Right
          </button>
          <div className="h-4 w-px bg-neutral-300 dark:bg-neutral-700 mx-1" />
          <button
            onClick={() => exec('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
            title="Bullet list"
          >
            • Bullets
          </button>
        </div>
      </div>

      {/* Document Paper Page Viewport */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-neutral-200/80 dark:bg-[#141414]">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="w-full max-w-2xl min-h-[500px] p-10 bg-white text-slate-900 shadow-xl rounded-sm outline-none font-sans text-sm leading-relaxed select-text"
        >
          Executive Summary: Windows 11 Modern Experience
          <br /><br />
          Our web-based operating system delivers full desktop productivity directly inside the browser sandbox. With rich applications, seamless file management, and customizable personalizations, users enjoy a familiar and highly responsive computing environment without installation.
        </div>
      </div>
    </div>
  );
};
