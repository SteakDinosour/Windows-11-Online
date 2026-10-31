/**
 * Windows 11 Virtual File System with Persistent LocalStorage
 */

import { FileSystemItem } from '../types/os';
import { soundManager } from './soundEffects';

const STORAGE_KEY = 'win11_virtual_filesystem_v2';

export const INITIAL_FILES: FileSystemItem[] = [
  // Core Drives & System Folders
  { id: 'c-drive', name: 'Local Disk (C:)', type: 'folder', parentId: null, size: 4096, updatedAt: '2026-10-15', isSystem: true, icon: 'hard-drive' },
  { id: 'windows-sys', name: 'Windows', type: 'folder', parentId: 'c-drive', size: 1048576, updatedAt: '2026-10-15', isSystem: true, icon: 'folder' },
  { id: 'system32', name: 'System32', type: 'folder', parentId: 'windows-sys', size: 2048576, updatedAt: '2026-10-15', isSystem: true, icon: 'folder' },
  { id: 'prog-files', name: 'Program Files', type: 'folder', parentId: 'c-drive', size: 524288, updatedAt: '2026-10-15', isSystem: true, icon: 'folder' },
  { id: 'users-dir', name: 'Users', type: 'folder', parentId: 'c-drive', size: 4096, updatedAt: '2026-10-15', isSystem: true, icon: 'folder' },
  { id: 'user-dir', name: 'User', type: 'folder', parentId: 'users-dir', size: 4096, updatedAt: '2026-10-15', isSystem: true, icon: 'user' },

  // User standard profile folders
  { id: 'desktop', name: 'Desktop', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'monitor' },
  { id: 'documents', name: 'Documents', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'folder-text' },
  { id: 'downloads', name: 'Downloads', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'download' },
  { id: 'pictures', name: 'Pictures', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'image' },
  { id: 'music', name: 'Music', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'music' },
  { id: 'videos', name: 'Videos', type: 'folder', parentId: 'user-dir', size: 4096, updatedAt: '2026-10-30', isSystem: true, icon: 'video' },

  // Recycle Bin virtual container
  { id: 'recycle-bin', name: 'Recycle Bin', type: 'folder', parentId: null, size: 0, updatedAt: '2026-10-30', isSystem: true, icon: 'trash-2' },

  // Desktop files
  {
    id: 'desk-file-1',
    name: 'Getting Started with Windows 11.txt',
    type: 'file',
    parentId: 'desktop',
    extension: 'txt',
    size: 612,
    updatedAt: '2026-10-30',
    content: `Welcome to Windows 11 Online!

This browser-based operating system faithfully recreates Microsoft Windows 11.

Features ready to explore:
• Modern Start Menu, Taskbar, Widgets, and Quick Settings
• File Explorer with tabs, navigation, and persistent virtual filesystem
• Built-in apps: Notepad, Paint, Calculator, Edge, Photos, Media Player, Camera, Task Manager, Terminal, WordPad, Excel Sheet, PowerPoint, Sticky Notes, Clock, and Windows Security
• Snap Layouts: Hover over the maximize button or press Win+Z to snap windows!
• Keyboard shortcuts: Win, Win+E, Win+I, Win+R, Win+D, Win+L, Alt+Tab, Ctrl+Shift+Esc
• Full customization: Themes, wallpapers, accent colors, and taskbar alignment in Settings!`,
  },
  {
    id: 'desk-file-2',
    name: 'Quarterly Budget.xlsx',
    type: 'file',
    parentId: 'desktop',
    extension: 'xlsx',
    size: 2450,
    updatedAt: '2026-10-28',
    content: JSON.stringify([
      ['Department', 'Q1 Target', 'Q1 Actual', 'Variance'],
      ['Engineering', '150000', '142000', '=B2-C2'],
      ['Design', '45000', '43200', '=B3-C3'],
      ['Marketing', '80000', '86400', '=B4-C4'],
      ['Operations', '35000', '31000', '=B5-C5'],
      ['Total', '=SUM(B2:B5)', '=SUM(C2:C5)', '=SUM(D2:D5)'],
    ]),
  },
  {
    id: 'desk-file-3',
    name: 'Product Presentation.pptx',
    type: 'file',
    parentId: 'desktop',
    extension: 'pptx',
    size: 3840,
    updatedAt: '2026-10-25',
    content: JSON.stringify([
      { title: 'Windows 11 Architecture', bullets: ['Fluent Design system with Mica & Acrylic', 'Modernized Start Menu & Snap Layouts', 'Integrated Widgets & Notification Hub'] },
      { title: 'Performance Metrics', bullets: ['Instant startup & app switching', 'Responsive multi-window desktop manager', 'Client-side persistent virtual filesystem'] },
      { title: 'Next Steps', bullets: ['Expand app ecosystem in Microsoft Store', 'Cloud synchronization profile', 'Refined gaming overlay with live telemetry'] },
    ]),
  },
  {
    id: 'desk-file-4',
    name: 'Executive Brief.docx',
    type: 'file',
    parentId: 'desktop',
    extension: 'docx',
    size: 1540,
    updatedAt: '2026-10-26',
    content: `Executive Summary: Windows 11 Modern Experience\n\nOur web-based operating system delivers full desktop productivity directly inside the browser sandbox. With rich applications, seamless file management, and customizable personalizations, users enjoy a familiar and highly responsive computing environment without installation.`,
  },

  // Documents
  {
    id: 'doc-file-1',
    name: 'Meeting Minutes.txt',
    type: 'file',
    parentId: 'documents',
    extension: 'txt',
    size: 420,
    updatedAt: '2026-10-29',
    content: `Team Standup Notes - October 2026\n\n1. Reviewing Fluent UI design polish.\n2. Testing Virtual File System indexing and folder creation.\n3. Validating snap layouts on multi-resolution viewports.\n4. All tests green for production release.`,
  },
  {
    id: 'code-py-1',
    name: 'main.py',
    type: 'file',
    parentId: 'documents',
    extension: 'py',
    icon: 'py',
    size: 580,
    updatedAt: '2026-10-29',
    content: `# Windows 11 Virtual System - Data Analysis Script
import math
import sys

def compute_statistics(dataset):
    total = sum(dataset)
    mean = total / len(dataset)
    variance = sum((x - mean) ** 2 for x in dataset) / len(dataset)
    return {
        "mean": round(mean, 2),
        "std_dev": round(math.sqrt(variance), 2),
        "count": len(dataset),
        "total": total
    }

if __name__ == "__main__":
    samples = [12.5, 45.0, 78.2, 92.4, 110.1, 145.8]
    stats = compute_statistics(samples)
    print(f"Dataset Statistics: {stats}")
`,
  },
  {
    id: 'code-cpp-1',
    name: 'algorithm.cpp',
    type: 'file',
    parentId: 'documents',
    extension: 'cpp',
    icon: 'cpp',
    size: 720,
    updatedAt: '2026-10-28',
    content: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

class QuickSortEngine {
public:
    void sort(vector<int>& arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            sort(arr, low, pi - 1);
            sort(arr, pi + 1, high);
        }
    }
private:
    int partition(vector<int>& arr, int low, int high) {
        int pivot = arr[high];
        int i = (low - 1);
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                swap(arr[i], arr[j]);
            }
        }
        swap(arr[i + 1], arr[high]);
        return (i + 1);
    }
};

int main() {
    cout << "Windows 11 C++ High Performance Engine" << endl;
    return 0;
}
`,
  },
  {
    id: 'code-ino-1',
    name: 'firmware.ino',
    type: 'file',
    parentId: 'desktop',
    extension: 'ino',
    icon: 'ino',
    size: 460,
    updatedAt: '2026-10-30',
    content: `// Arduino Sensor Controller Firmware
#define LED_PIN 13
#define SENSOR_PIN A0

void setup() {
    Serial.begin(9600);
    pinMode(LED_PIN, OUTPUT);
    pinMode(SENSOR_PIN, INPUT);
    Serial.println("Arduino Hardware Initialized.");
}

void loop() {
    int sensorVal = analogRead(SENSOR_PIN);
    if (sensorVal > 512) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
    delay(100);
}
`,
  },
  {
    id: 'code-html-1',
    name: 'index.html',
    type: 'file',
    parentId: 'desktop',
    extension: 'html',
    icon: 'html',
    size: 340,
    updatedAt: '2026-10-30',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Windows 11 Web Application</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="root" class="container">
    <h1>Windows 11 Fluent App</h1>
    <p>Modern web development with Visual Studio Code.</p>
  </div>
  <script src="app.js"></script>
</body>
</html>
`,
  },
  {
    id: 'code-css-1',
    name: 'styles.css',
    type: 'file',
    parentId: 'desktop',
    extension: 'css',
    icon: 'css',
    size: 410,
    updatedAt: '2026-10-30',
    content: `/* Windows 11 Fluent Mica Stylesheet */
:root {
  --primary-accent: #0078d4;
  --bg-dark: #1f1f1f;
  --text-primary: #ffffff;
}

body {
  margin: 0;
  padding: 24px;
  background-color: var(--bg-dark);
  color: var(--text-primary);
  font-family: 'Segoe UI', system-ui, sans-serif;
}

.container {
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 20px;
}
`,
  },
  {
    id: 'code-js-1',
    name: 'app.js',
    type: 'file',
    parentId: 'desktop',
    extension: 'js',
    icon: 'js',
    size: 380,
    updatedAt: '2026-10-30',
    content: `// Windows 11 Client Runtime Script
class Application {
  constructor(name) {
    this.name = name;
    this.version = "1.0.0";
  }

  start() {
    console.log(\`Starting \${this.name} v\${this.version}\`);
    document.addEventListener("DOMContentLoaded", () => {
      console.log("DOM ready. System online.");
    });
  }
}

const app = new Application("VS Code Demo");
app.start();
`,
  },

  // Downloads
  {
    id: 'down-file-1',
    name: 'VS_Code_Setup_x64.exe',
    type: 'file',
    parentId: 'downloads',
    extension: 'exe',
    size: 89400,
    updatedAt: '2026-10-27',
    content: 'Binary executable package',
  },
  {
    id: 'down-file-2',
    name: 'Hardware_Specifications.pdf',
    type: 'file',
    parentId: 'downloads',
    extension: 'pdf',
    size: 12400,
    updatedAt: '2026-10-28',
    content: 'PDF Document specification',
  },
];

class VirtualFileSystem {
  private items: FileSystemItem[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const loaded: FileSystemItem[] = JSON.parse(data);
        // Ensure any newly introduced sample files (like code files) are present
        INITIAL_FILES.forEach(initFile => {
          if (!loaded.some(item => item.id === initFile.id)) {
            loaded.push(initFile);
          }
        });
        this.items = loaded;
        this.save();
      } else {
        this.items = [...INITIAL_FILES];
        this.save();
      }
    } catch {
      this.items = [...INITIAL_FILES];
    }
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Failed to save file system', e);
    }
  }

  public getItems(parentId: string | null): FileSystemItem[] {
    return this.items.filter(item => item.parentId === parentId && !item.inRecycleBin);
  }

  public getAllItems(): FileSystemItem[] {
    return [...this.items];
  }

  public getItemById(id: string): FileSystemItem | undefined {
    return this.items.find(item => item.id === id);
  }

  public getDesktopItems(): FileSystemItem[] {
    return this.getItems('desktop');
  }

  public getRecycleBinItems(): FileSystemItem[] {
    return this.items.filter(item => item.inRecycleBin);
  }

  public createItem(
    name: string,
    type: 'file' | 'folder',
    parentId: string | null,
    content: string = '',
    extension?: string
  ): FileSystemItem {
    const id = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const ext = extension || (type === 'file' ? (name.includes('.') ? name.split('.').pop() : 'txt') : undefined);
    const dateStr = new Date().toISOString().split('T')[0];

    const newItem: FileSystemItem = {
      id,
      name,
      type,
      parentId,
      content,
      size: type === 'folder' ? 4096 : content.length,
      updatedAt: dateStr,
      extension: ext,
      icon: type === 'folder' ? 'folder' : ext === 'txt' ? 'file-text' : ext === 'xlsx' ? 'table' : ext === 'pptx' ? 'presentation' : 'file',
    };

    this.items.push(newItem);
    this.save();
    return newItem;
  }

  public updateFileContent(id: string, content: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (item && item.type === 'file') {
      item.content = content;
      item.size = content.length;
      item.updatedAt = new Date().toISOString().split('T')[0];
      this.save();
      return true;
    }
    return false;
  }

  public renameItem(id: string, newName: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;
    item.name = newName;
    if (item.type === 'file' && newName.includes('.')) {
      item.extension = newName.split('.').pop();
    }
    item.updatedAt = new Date().toISOString().split('T')[0];
    this.save();
    return true;
  }

  private crashCallback: (() => void) | null = null;

  public onCrash(callback: () => void) {
    this.crashCallback = callback;
  }

  public triggerCrashCallback() {
    if (this.crashCallback) {
      this.crashCallback();
    }
  }

  public deleteItem(id: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item) return false;

    // Special trigger: deleting system32 causes Windows to crash and BSOD!
    if (item.id === 'system32' || item.name.toLowerCase() === 'system32') {
      return this.deleteSystem32();
    }

    if (item.isSystem) return false;

    // Soft delete to recycle bin
    item.inRecycleBin = true;
    item.originalParentId = item.parentId;
    item.parentId = 'recycle-bin';
    this.save();
    soundManager.playTrash();
    return true;
  }

  public deleteSystem32(): boolean {
    const idx = this.items.findIndex(i => i.id === 'system32' || i.name.toLowerCase() === 'system32');
    if (idx !== -1) {
      this.items.splice(idx, 1);
      this.save();
    }
    this.triggerCrashCallback();
    return true;
  }

  public permanentDelete(id: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (item && (item.id === 'system32' || item.name.toLowerCase() === 'system32')) {
      return this.deleteSystem32();
    }
    const index = this.items.findIndex(i => i.id === id);
    if (index !== -1 && !this.items[index].isSystem) {
      this.items.splice(index, 1);
      this.save();
      return true;
    }
    return false;
  }

  public restoreItem(id: string): boolean {
    const item = this.items.find(i => i.id === id);
    if (!item || !item.inRecycleBin) return false;

    item.inRecycleBin = false;
    item.parentId = item.originalParentId || 'desktop';
    item.originalParentId = null;
    this.save();
    return true;
  }

  public restoreAll(): number {
    let count = 0;
    this.items.forEach(item => {
      if (item.inRecycleBin) {
        item.inRecycleBin = false;
        item.parentId = item.originalParentId || 'desktop';
        item.originalParentId = null;
        count++;
      }
    });
    if (count > 0) {
      this.save();
      soundManager.playClick();
    }
    return count;
  }

  public emptyRecycleBin(): void {
    this.items = this.items.filter(i => !i.inRecycleBin);
    this.save();
    soundManager.playTrash();
  }

  public copyItem(id: string, targetParentId: string | null): FileSystemItem | null {
    const source = this.getItemById(id);
    if (!source) return null;
    return this.createItem(`Copy of ${source.name}`, source.type, targetParentId, source.content, source.extension);
  }

  public moveItem(id: string, targetParentId: string | null): boolean {
    const item = this.getItemById(id);
    if (!item || item.isSystem) return false;
    item.parentId = targetParentId;
    this.save();
    return true;
  }

  public getPath(id: string | null): string {
    if (!id) return 'This PC';
    const parts: string[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const item = this.getItemById(currentId);
      if (!item) break;
      parts.unshift(item.name);
      currentId = item.parentId;
    }

    return parts.join(' > ') || 'This PC';
  }

  public resetToDefault() {
    this.items = [...INITIAL_FILES];
    this.save();
  }
}

export const fileSystem = new VirtualFileSystem();
