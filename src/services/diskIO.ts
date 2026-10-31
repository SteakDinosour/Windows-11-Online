/**
 * Real-disk I/O helpers. These use the browser's own file APIs so files move
 * between the user's actual PC and the simulated Windows environment.
 */

export const CODE_EXTENSIONS = [
  'py', 'c', 'cpp', 'h', 'hpp', 'css', 'htm', 'html', 'js', 'ino', 'json', 'md', 'txt',
];

/** Download a text file to the user's real disk (browser "Save as" / Downloads). */
export function saveToComputer(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Show the native "Choose file" dialog of the user's PC and read the chosen files as text. */
export function pickFilesFromComputer(
  accept: string[] = CODE_EXTENSIONS
): Promise<{ name: string; content: string }[]> {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = accept.map(e => `.${e}`).join(',');
    input.style.display = 'none';
    document.body.appendChild(input);

    const cleanup = () => input.remove();

    input.onchange = async () => {
      const files = Array.from(input.files || []);
      const out = await Promise.all(
        files.map(async f => ({ name: f.name, content: await f.text() }))
      );
      cleanup();
      resolve(out);
    };
    input.addEventListener('cancel', () => {
      cleanup();
      resolve([]);
    });
    input.click();
  });
}
