import { useEffect, useState } from "react";
import { platform } from "@/runtime/platform";
import { useAppStore } from "@/store/useAppStore";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function useInstallPrompt() {
  const installedAt = useAppStore((state) => state.settings.installedAt);
  const setInstalledAt = useAppStore((state) => state.setInstalledAt);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(platform.isPWAInstalled);

  useEffect(() => {
    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
      setInstalledAt(Date.now());
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [setInstalledAt]);

  const promptInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setInstalledAt(Date.now());
    setPromptEvent(null);
  };

  return {
    hidden: installed || installedAt !== null || platform.isTauri,
    canPrompt: promptEvent !== null,
    isIOS: platform.isIOS,
    promptInstall,
  };
}
