import React from 'react';
import { useOS } from '../../context/OSContext';
import { WindowFrame } from './WindowFrame';
import { FileExplorerApp } from '../apps/FileExplorerApp';
import { EdgeBrowserApp } from '../apps/EdgeBrowserApp';
import { MicrosoftStoreApp } from '../apps/MicrosoftStoreApp';
import { NotepadApp } from '../apps/NotepadApp';
import { PaintApp } from '../apps/PaintApp';
import { CalculatorApp } from '../apps/CalculatorApp';
import { ClockApp } from '../apps/ClockApp';
import { CalendarApp } from '../apps/CalendarApp';
import { PhotosApp } from '../apps/PhotosApp';
import { MediaPlayerApp } from '../apps/MediaPlayerApp';
import { CameraApp } from '../apps/CameraApp';
import { VoiceRecorderApp } from '../apps/VoiceRecorderApp';
import { SnippingToolApp } from '../apps/SnippingToolApp';
import { TaskManagerApp } from '../apps/TaskManagerApp';
import { TerminalApp } from '../apps/TerminalApp';
import { SettingsApp } from '../apps/SettingsApp';
import { WindowsSecurityApp } from '../apps/WindowsSecurityApp';
import { StickyNotesApp } from '../apps/StickyNotesApp';
import { WordPadApp } from '../apps/WordPadApp';
import { ExcelSheetApp } from '../apps/ExcelSheetApp';
import { PowerPointApp } from '../apps/PowerPointApp';
import { VSCodeApp } from '../apps/VSCodeApp';

export const WindowManager: React.FC = () => {
  const { windows } = useOS();

  const renderAppContent = (appId: string, payload: any) => {
    switch (appId) {
      case 'explorer':
        return <FileExplorerApp payload={payload} />;
      case 'edge':
        return <EdgeBrowserApp payload={payload} />;
      case 'store':
        return <MicrosoftStoreApp />;
      case 'notepad':
        return <NotepadApp payload={payload} />;
      case 'paint':
        return <PaintApp />;
      case 'calc':
        return <CalculatorApp />;
      case 'clock':
        return <ClockApp />;
      case 'calendar':
        return <CalendarApp />;
      case 'photos':
        return <PhotosApp />;
      case 'mediaplayer':
        return <MediaPlayerApp />;
      case 'camera':
        return <CameraApp />;
      case 'voicerecorder':
        return <VoiceRecorderApp />;
      case 'snippingtool':
        return <SnippingToolApp />;
      case 'taskmanager':
        return <TaskManagerApp />;
      case 'terminal':
        return <TerminalApp />;
      case 'settings':
        return <SettingsApp payload={payload} />;
      case 'security':
        return <WindowsSecurityApp />;
      case 'stickynotes':
        return <StickyNotesApp />;
      case 'word':
        return <WordPadApp payload={payload} />;
      case 'excel':
        return <ExcelSheetApp payload={payload} />;
      case 'powerpoint':
        return <PowerPointApp payload={payload} />;
      case 'vscode':
        return <VSCodeApp payload={payload} />;
      default:
        return (
          <div className="p-6 text-center text-xs text-neutral-400">
            Application loading...
          </div>
        );
    }
  };

  return (
    <div className="pointer-events-auto">
      {windows.map(win => (
        <WindowFrame key={win.id} window={win}>
          {renderAppContent(win.appId, win.payload)}
        </WindowFrame>
      ))}
    </div>
  );
};
