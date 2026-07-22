type SaveFilePickerWindow = Window & {
  showSaveFilePicker?: (options: {
    suggestedName?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle>;
  showOpenFilePicker?: (options: {
    types?: { description: string; accept: Record<string, string[]> }[];
    multiple?: boolean;
  }) => Promise<FileSystemFileHandle[]>;
};

function mimeForName(name: string): string {
  if (name.endsWith(".zip")) return "application/zip";
  if (name.endsWith(".json")) return "application/json";
  return "application/octet-stream";
}

async function saveViaPicker(name: string, blob: Blob): Promise<boolean> {
  const picker = (window as SaveFilePickerWindow).showSaveFilePicker;
  if (!picker) return false;
  try {
    const handle = await picker({
      suggestedName: name,
      types: [
        { description: "Backup file", accept: { [mimeForName(name)]: [name.slice(name.lastIndexOf("."))] } },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return true;
    return false;
  }
}

function saveViaAnchor(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function saveFile(name: string, blob: Blob): Promise<void> {
  const saved = await saveViaPicker(name, blob);
  if (!saved) saveViaAnchor(name, blob);
}

export function openFile(accept: string): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.addEventListener("change", () => {
      resolve(input.files?.[0] ?? null);
    });
    input.addEventListener("cancel", () => resolve(null));
    input.click();
  });
}
