import React from 'react';
import { WinIcon } from './WinIcon';
import { FileSystemItem } from '../../types/os';
import { fileSystem } from '../../services/fileSystem';

interface PropertiesDialogProps {
  item: FileSystemItem;
  onClose: () => void;
}

export const PropertiesDialog: React.FC<PropertiesDialogProps> = ({ item, onClose }) => {
  const isFile = item.type === 'file';
  const location =
    item.id === 'desktop'
      ? 'C:\\Users\\User\\Desktop'
      : item.id === 'this-pc'
      ? 'This PC'
      : fileSystem.getPath(item.parentId) || 'C:\\';
  const typeLabel = isFile
    ? `${(item.extension || item.name.split('.').pop() || 'file').toUpperCase()} File`
    : 'File folder';
  const sizeLabel = isFile ? `${item.size.toLocaleString()} bytes` : '—';

  const rows: [string, string][] = [
    ['Name', item.name],
    ['Type', typeLabel],
    ['Location', location],
    ['Size', sizeLabel],
    ['Modified', item.updatedAt || 'Unknown'],
  ];

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="w-[380px] rounded-lg bg-white dark:bg-[#2b2b2b] text-slate-800 dark:text-slate-100 border border-neutral-300 dark:border-neutral-700 shadow-2xl text-xs"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-700">
          <span className="font-semibold">{item.name} Properties</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-neutral-200 dark:hover:bg-neutral-700"
          >
            <WinIcon name="close" size={12} />
          </button>
        </div>
        <div className="p-4 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700">
          <WinIcon name={item.icon || (isFile ? 'file' : 'folder')} size={36} />
          <span className="font-medium truncate">{item.name}</span>
        </div>
        <table className="w-full p-4">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="py-1.5 pl-4 pr-2 text-neutral-500 align-top w-24">{k}</td>
                <td className="py-1.5 pr-4 break-all">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
