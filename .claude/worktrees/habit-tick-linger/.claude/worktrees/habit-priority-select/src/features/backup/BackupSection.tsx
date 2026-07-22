import { useState } from "react";
import { toast } from "sonner";
import { FileArchive, FileJson, Upload } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import { platform } from "@/runtime/platform";
import { parseBackup, type ParsedBackup } from "@/storage/backup";
import { useBackup } from "@/features/backup/useBackup";
import { RestoreDialog } from "@/features/backup/RestoreDialog";

export function BackupSection() {
  const { exportZip, exportJson, applyRestore } = useBackup();
  const [pending, setPending] = useState<ParsedBackup | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const handleChooseFile = async () => {
    const file = await platform.openFile(".zip,.json");
    if (!file) return;
    try {
      const parsed = await parseBackup(file);
      setPending(parsed);
      setRestoreOpen(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid backup file");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Backup</h3>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={exportZip}>
            <FileArchive className="size-4" /> Full (.zip)
          </Button>
          <Button size="sm" variant="outline" onClick={exportJson}>
            <FileJson className="size-4" /> Lite (.json)
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Restore</h3>
        <Button size="sm" variant="secondary" onClick={handleChooseFile}>
          <Upload className="size-4" /> Choose file
        </Button>
      </div>

      <RestoreDialog
        open={restoreOpen}
        onOpenChange={setRestoreOpen}
        onConfirm={(mode) => {
          if (pending) void applyRestore(pending, mode);
        }}
      />
    </div>
  );
}
