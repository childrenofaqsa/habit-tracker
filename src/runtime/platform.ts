import { saveFile, openFile } from "@/runtime/fs";

function detectTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const standaloneNav = (navigator as Navigator & { standalone?: boolean }).standalone;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    standaloneNav === true ||
    detectTauri()
  );
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIPad = ua.includes("Mac") && "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isIPad;
}

function detectAndroid(): boolean {
  return typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);
}

async function notify(title: string, body: string): Promise<void> {
  if (typeof Notification === "undefined") return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") new Notification(title, { body });
  }
}

export const platform = {
  get isTauri() {
    return detectTauri();
  },
  get isPWAInstalled() {
    return detectStandalone();
  },
  get isIOS() {
    return detectIOS();
  },
  get isAndroid() {
    return detectAndroid();
  },
  saveFile,
  openFile,
  notify,
};
