import { useState } from "react";
import { toast } from "sonner";
import { DatabaseBackup, FileArchive, FileJson, Upload } from "lucide-react";
import { Button } from "@/common/components/ui/data/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/common/components/ui/overlay/sheet";
import { Separator } from "@/common/components/ui/data/separator";
import { platform } from "@/runtime/platform";
import { parseBackup, type ParsedBackup } from "@/storage/backup";
import { useBackup } from "@/features/backup/useBackup";
import { RestoreDialog } from "@/features/backup/RestoreDialog";

export function BackupButton() {
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
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="touch-target"
          aria-label="Backup and restore"
        >
          <DatabaseBackup className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="space-y-5">
        <SheetHeader>
          <SheetTitle>Backup & Restore</SheetTitle>
          <SheetDescription>
            Everything stays on this device. Save a file to move data between devices.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Backup</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportZip}>
              <FileArchive className="size-4" /> Full backup (.zip)
            </Button>
            <Button variant="outline" onClick={exportJson}>
              <FileJson className="size-4" /> Lite backup (.json)
            </Button>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Restore</h3>
          <Button variant="secondary" onClick={handleChooseFile}>
            <Upload className="size-4" /> Choose backup file
          </Button>
        </div>

        <RestoreDialog
          open={restoreOpen}
          onOpenChange={setRestoreOpen}
          onConfirm={(mode) => {
            if (pending) void applyRestore(pending, mode);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
