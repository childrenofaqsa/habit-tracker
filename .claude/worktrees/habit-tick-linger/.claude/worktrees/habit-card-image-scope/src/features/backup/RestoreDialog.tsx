import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/overlay/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/common/components/ui/form/radio-group";
import { Label } from "@/common/components/ui/form/label";
import { Input } from "@/common/components/ui/form/input";
import { Button } from "@/common/components/ui/data/button";
import type { RestoreMode } from "@/features/backup/useBackup";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (mode: RestoreMode) => void;
};

export function RestoreDialog({ open, onOpenChange, onConfirm }: Props) {
  const [mode, setMode] = useState<RestoreMode>("merge");
  const [confirmText, setConfirmText] = useState("");

  const blocked = mode === "replace" && confirmText !== "RESTORE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Restore backup</DialogTitle>
          <DialogDescription>Choose how to apply this backup.</DialogDescription>
        </DialogHeader>

        <RadioGroup value={mode} onValueChange={(value) => setMode(value as RestoreMode)}>
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <RadioGroupItem value="merge" id="merge" className="mt-0.5" />
            <Label htmlFor="merge" className="font-normal">
              <span className="font-medium">Merge</span> — keep existing data, add or
              update items. History is never deleted.
            </Label>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <RadioGroupItem value="replace" id="replace" className="mt-0.5" />
            <Label htmlFor="replace" className="font-normal">
              <span className="font-medium">Replace all</span> — overwrite everything
              with this backup.
            </Label>
          </div>
        </RadioGroup>

        {mode === "replace" && (
          <div className="space-y-1">
            <Label htmlFor="confirm">Type RESTORE to confirm</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={blocked}
            onClick={() => {
              onConfirm(mode);
              onOpenChange(false);
              setConfirmText("");
            }}
          >
            Restore
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
