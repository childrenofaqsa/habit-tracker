import { useCallback } from "react";
import { toast } from "sonner";
import { platform } from "@/runtime/platform";
import { selectAppData, useAppStore } from "@/store/useAppStore";
import { saveAppData } from "@/storage/loadAppData";
import { putImage } from "@/storage/imageStore";
import {
  buildBackupZip,
  buildBackupJson,
  backupZipName,
  backupJsonName,
  type ParsedBackup,
} from "@/storage/backup";

export type RestoreMode = "replace" | "merge";

export function useBackup() {
  const replaceAllData = useAppStore((state) => state.replaceAllData);
  const mergeData = useAppStore((state) => state.mergeData);

  const exportZip = useCallback(async () => {
    try {
      const blob = await buildBackupZip(selectAppData(useAppStore.getState()));
      await platform.saveFile(backupZipName(), blob);
      toast.success("Full backup saved");
    } catch {
      toast.error("Could not create backup");
    }
  }, []);

  const exportJson = useCallback(async () => {
    try {
      const blob = buildBackupJson(selectAppData(useAppStore.getState()));
      await platform.saveFile(backupJsonName(), blob);
      toast.success("Lite backup saved");
    } catch {
      toast.error("Could not create backup");
    }
  }, []);

  const applyRestore = useCallback(
    async (parsed: ParsedBackup, mode: RestoreMode) => {
      try {
        for (const [id, blob] of parsed.images) {
          await putImage(id, blob);
        }
        if (mode === "replace") replaceAllData(parsed.data);
        else mergeData(parsed.data);
        await saveAppData(selectAppData(useAppStore.getState()));
        toast.success(mode === "replace" ? "Data replaced" : "Data merged");
      } catch {
        toast.error("Restore failed; your existing data is preserved");
      }
    },
    [replaceAllData, mergeData],
  );

  return { exportZip, exportJson, applyRestore };
}
